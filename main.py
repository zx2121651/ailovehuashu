import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import numpy as np
import tkinter as tk
from tkinter import filedialog, messagebox
from PIL import Image, ImageTk
import json
import time
import threading
import math
import os
import urllib.request
from bvh_exporter import BVHExporter
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import matplotlib.pyplot as plt

class OneEuroFilter:
    def __init__(self, t0, x0, dx0=0.0, min_cutoff=1.0, beta=0.0, d_cutoff=1.0):
        self.min_cutoff = float(min_cutoff)
        self.beta = float(beta)
        self.d_cutoff = float(d_cutoff)
        self.x_prev = float(x0)
        self.dx_prev = float(dx0)
        self.t_prev = float(t0)

    def smoothing_factor(self, t_e, cutoff):
        r = 2 * math.pi * cutoff * t_e
        return r / (r + 1)

    def exponential_smoothing(self, a, x, x_prev):
        return a * x + (1 - a) * x_prev

    def __call__(self, t, x):
        t_e = t - self.t_prev

        # 避免除以零或过小的时间增量
        if t_e <= 0:
            return x

        # 根据截止频率和时间步计算平滑因子
        a_d = self.smoothing_factor(t_e, self.d_cutoff)
        dx = (x - self.x_prev) / t_e
        dx_hat = self.exponential_smoothing(a_d, dx, self.dx_prev)

        # 根据速度调整截止频率
        cutoff = self.min_cutoff + self.beta * abs(dx_hat)
        a = self.smoothing_factor(t_e, cutoff)
        x_hat = self.exponential_smoothing(a, x, self.x_prev)

        # 更新状态
        self.x_prev = x_hat
        self.dx_prev = dx_hat
        self.t_prev = t

        return x_hat

class LandmarkFilter:
    def __init__(self, min_cutoff=1.0, beta=0.0):
        self.min_cutoff = min_cutoff
        self.beta = beta
        self.filters = {} # key: landmark_idx, value: {'x': filter, 'y': filter, 'z': filter}

    def reset(self):
        self.filters.clear()

    def process(self, t, landmarks):
        if not landmarks:
            return None

        smoothed_landmarks = []
        for i, lm in enumerate(landmarks):
            if i not in self.filters:
                self.filters[i] = {
                    'x': OneEuroFilter(t, lm['x'], min_cutoff=self.min_cutoff, beta=self.beta),
                    'y': OneEuroFilter(t, lm['y'], min_cutoff=self.min_cutoff, beta=self.beta),
                    'z': OneEuroFilter(t, lm['z'], min_cutoff=self.min_cutoff, beta=self.beta)
                }
                smoothed_landmarks.append({'x': lm['x'], 'y': lm['y'], 'z': lm['z'], 'v': lm['v']})
            else:
                x = self.filters[i]['x'](t, lm['x'])
                y = self.filters[i]['y'](t, lm['y'])
                z = self.filters[i]['z'](t, lm['z'])
                smoothed_landmarks.append({'x': x, 'y': y, 'z': z, 'v': lm['v']})

        return smoothed_landmarks

class MotionCaptureApp:
    def __init__(self, window, window_title):
        self.window = window
        self.window.title(window_title)
        self.window.geometry("1200x800")

        # 视频/摄像头相关状态
        self.vid = None
        self.is_playing = False
        self.video_source = None
        self._update_job = None
        self._canvas_image_id = None

        # MediaPipe 初始化
        self.mp_holistic = mp.solutions.holistic
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        self.holistic = self.mp_holistic.Holistic(
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
            model_complexity=1
        )

        # 录制状态
        self.is_recording = False
        self.recorded_data = []
        self.frame_count = 0
        self.start_time = 0

        # 配置状态变量
        self.param_model_complexity = tk.IntVar(value=1)
        self.param_min_det_conf = tk.DoubleVar(value=0.5)
        self.param_min_track_conf = tk.DoubleVar(value=0.5)
        self.param_enable_smoothing = tk.BooleanVar(value=True)
        self.param_smooth_cutoff = tk.DoubleVar(value=1.0)
        self.param_smooth_beta = tk.DoubleVar(value=0.0)

        # 捕捉模式变量
        self.param_capture_mode = tk.StringVar(value="single_holistic")
        self.param_max_num_poses = tk.IntVar(value=3)

        # MediaPipe PoseLandmarker (用于多人) 初始化
        self.pose_landmarker = None
        self._init_pose_landmarker()

        # 滤波器实例初始化
        self.face_filter = LandmarkFilter(self.param_smooth_cutoff.get(), self.param_smooth_beta.get())
        self.pose_filter = LandmarkFilter(self.param_smooth_cutoff.get(), self.param_smooth_beta.get())
        self.lhand_filter = LandmarkFilter(self.param_smooth_cutoff.get(), self.param_smooth_beta.get())
        self.rhand_filter = LandmarkFilter(self.param_smooth_cutoff.get(), self.param_smooth_beta.get())

        # 构建 UI
        self._build_ui()

        # 窗口关闭事件
        self.window.protocol("WM_DELETE_WINDOW", self.on_closing)

    def _init_pose_landmarker(self):
        model_path = 'pose_landmarker_full.task'
        if not os.path.exists(model_path):
            print("Downloading multi-person pose landmarker model...")
            url = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task"
            try:
                urllib.request.urlretrieve(url, model_path)
                print("Model downloaded successfully.")
            except Exception as e:
                print(f"Error downloading model: {e}")
                return

        base_options = python.BaseOptions(model_asset_path=model_path)
        options = vision.PoseLandmarkerOptions(
            base_options=base_options,
            running_mode=vision.RunningMode.VIDEO,
            num_poses=self.param_max_num_poses.get(),
            min_pose_detection_confidence=self.param_min_det_conf.get(),
            min_pose_presence_confidence=self.param_min_track_conf.get(),
            min_tracking_confidence=self.param_min_track_conf.get(),
            output_segmentation_masks=False
        )
        if self.pose_landmarker is not None:
            self.pose_landmarker.close()
        self.pose_landmarker = vision.PoseLandmarker.create_from_options(options)

    def _init_3d_plot(self):
        self.fig = plt.Figure(figsize=(5, 4), dpi=100)
        self.fig.patch.set_facecolor('black')
        self.ax = self.fig.add_subplot(111, projection='3d')
        self.ax.set_facecolor('black')

        # 隐藏坐标轴
        self.ax.grid(False)
        self.ax.set_xticks([])
        self.ax.set_yticks([])
        self.ax.set_zticks([])
        self.ax.axis('off')

        # 设置视角范围
        self.ax.set_xlim([-1.0, 1.0])
        self.ax.set_ylim([1.0, -1.0]) # 反转 Y 轴，匹配人眼直觉
        self.ax.set_zlim([-1.0, 1.0])

        # MediaPipe 姿态拓扑连接线
        self.pose_connections = [
            (11, 12), (11, 13), (13, 15), (12, 14), (14, 16), # 手臂与肩
            (11, 23), (12, 24), (23, 24),                     # 躯干
            (23, 25), (24, 26), (25, 27), (26, 28),           # 腿部
            (0, 1), (1, 2), (2, 3), (3, 7),                   # 脸部简化(左)
            (0, 4), (4, 5), (5, 6), (6, 8)                    # 脸部简化(右)
        ]

        # 初始化 3D 线段对象
        self.lines_3d = []
        for _ in self.pose_connections:
            line, = self.ax.plot([0, 0], [0, 0], [0, 0], c='cyan', lw=2)
            self.lines_3d.append(line)

        self.scatter_3d = self.ax.scatter([], [], [], c='magenta', s=20)

        # 嵌入 Tkinter
        self.plot_canvas = FigureCanvasTkAgg(self.fig, master=self.left_frame)
        self.plot_canvas.draw()

        # 将 3D 画布放入 left_frame 的下半部分
        self.left_frame.add(self.plot_canvas.get_tk_widget(), minsize=350)

    def _update_3d_plot(self, pose_data):
        if not pose_data or len(pose_data) < 33:
            return

        # 提取坐标 (注意：MediaPipe 的坐标默认原点在左上角，我们在这里做一个简单的居中平移)
        xs = [p['x'] - 0.5 for p in pose_data]
        ys = [p['y'] - 0.5 for p in pose_data]
        zs = [p['z'] for p in pose_data]

        # 更新关节点散点
        self.scatter_3d._offsets3d = (xs, ys, zs)

        # 更新连接线
        for i, connection in enumerate(self.pose_connections):
            start_idx, end_idx = connection
            self.lines_3d[i].set_data(
                [xs[start_idx], xs[end_idx]],
                [ys[start_idx], ys[end_idx]]
            )
            self.lines_3d[i].set_3d_properties([zs[start_idx], zs[end_idx]])

        self.plot_canvas.draw_idle()

    def _build_ui(self):
        # 主布局：左右分栏
        self.paned_window = tk.PanedWindow(self.window, orient=tk.HORIZONTAL)
        self.paned_window.pack(fill=tk.BOTH, expand=True)

        # 左侧：分上下两层 (上面 2D 视频，下面 3D 骨架)
        self.left_frame = tk.PanedWindow(self.paned_window, orient=tk.VERTICAL, bg='black')
        self.paned_window.add(self.left_frame, minsize=600)

        self.canvas = tk.Canvas(self.left_frame, bg='black', highlightthickness=0)
        self.left_frame.add(self.canvas, minsize=350)

        # 3D 绘图区 (Matplotlib)
        self._init_3d_plot()

        self.status_label = tk.Label(self.window, text="状态: 等待输入", fg="white", bg="#333", anchor="w", padx=10)
        self.status_label.pack(side=tk.BOTTOM, fill=tk.X)

        # 右侧：控制面板
        self.right_frame = tk.Frame(self.paned_window, width=350, padx=15, pady=15, bg='#f0f0f0')
        self.paned_window.add(self.right_frame, minsize=350)

        # --- 模式选择区 ---
        tk.Label(self.right_frame, text="【 捕捉模式 】", font=("Arial", 12, "bold"), bg='#f0f0f0', fg='#d32f2f').pack(pady=(0, 5))
        mode_frame = tk.Frame(self.right_frame, bg='#f0f0f0')
        mode_frame.pack(fill=tk.X, pady=(0, 10))
        tk.Radiobutton(mode_frame, text="单人精细捕捉 (面部+双手+全身)", variable=self.param_capture_mode, value="single_holistic", command=self.on_mode_change, bg='#f0f0f0', font=("Arial", 9, "bold")).pack(anchor="w")
        tk.Radiobutton(mode_frame, text="多人骨骼捕捉 (最多N人身体)", variable=self.param_capture_mode, value="multi_pose", command=self.on_mode_change, bg='#f0f0f0', font=("Arial", 9, "bold")).pack(anchor="w")

        # --- 输入控制区 ---
        tk.Frame(self.right_frame, height=2, bd=1, relief=tk.SUNKEN).pack(fill=tk.X, pady=5)
        tk.Label(self.right_frame, text="【 输入源控制 】", font=("Arial", 12, "bold"), bg='#f0f0f0').pack(pady=(5, 10))
        btn_frame = tk.Frame(self.right_frame, bg='#f0f0f0')
        btn_frame.pack(fill=tk.X)

        self.btn_camera = tk.Button(btn_frame, text="打开摄像头", command=self.open_camera)
        self.btn_camera.pack(side=tk.LEFT, expand=True, fill=tk.X, padx=2)

        self.btn_video = tk.Button(btn_frame, text="选择本地视频", command=self.open_video_file)
        self.btn_video.pack(side=tk.LEFT, expand=True, fill=tk.X, padx=2)

        self.btn_toggle = tk.Button(self.right_frame, text="开始/暂停画面", command=self.toggle_play, state=tk.DISABLED, pady=5)
        self.btn_toggle.pack(fill=tk.X, pady=(5, 15))

        # --- 增强捕捉参数配置区 ---
        tk.Label(self.right_frame, text="【 捕捉引擎配置 】", font=("Arial", 12, "bold"), bg='#f0f0f0').pack(pady=(10, 5))

        # 1. 模型复杂度
        tk.Label(self.right_frame, text="MediaPipe 模型复杂度 (高精度=慢)", bg='#f0f0f0', anchor="w").pack(fill=tk.X)
        complex_frame = tk.Frame(self.right_frame, bg='#f0f0f0')
        complex_frame.pack(fill=tk.X, pady=2)
        tk.Radiobutton(complex_frame, text="0(快)", variable=self.param_model_complexity, value=0, command=self.reinit_holistic, bg='#f0f0f0').pack(side=tk.LEFT)
        tk.Radiobutton(complex_frame, text="1(中)", variable=self.param_model_complexity, value=1, command=self.reinit_holistic, bg='#f0f0f0').pack(side=tk.LEFT)
        tk.Radiobutton(complex_frame, text="2(准)", variable=self.param_model_complexity, value=2, command=self.reinit_holistic, bg='#f0f0f0').pack(side=tk.LEFT)

        # 2. 置信度阈值
        tk.Label(self.right_frame, text="检测置信度 (min_detection_confidence)", bg='#f0f0f0', anchor="w").pack(fill=tk.X, pady=(5, 0))
        det_scale = tk.Scale(self.right_frame, variable=self.param_min_det_conf, from_=0.1, to_=0.9, resolution=0.1, orient=tk.HORIZONTAL, bg='#f0f0f0')
        det_scale.bind("<ButtonRelease-1>", lambda e: self.reinit_holistic())
        det_scale.pack(fill=tk.X)

        tk.Label(self.right_frame, text="追踪置信度 (min_tracking_confidence)", bg='#f0f0f0', anchor="w").pack(fill=tk.X)
        trk_scale = tk.Scale(self.right_frame, variable=self.param_min_track_conf, from_=0.1, to_=0.9, resolution=0.1, orient=tk.HORIZONTAL, bg='#f0f0f0')
        trk_scale.bind("<ButtonRelease-1>", lambda e: self.reinit_holistic())
        trk_scale.pack(fill=tk.X)

        # 多人模式参数
        tk.Label(self.right_frame, text="最大追踪人数 (仅多人模式)", bg='#f0f0f0', anchor="w", fg='#1976d2').pack(fill=tk.X)
        ppl_scale = tk.Scale(self.right_frame, variable=self.param_max_num_poses, from_=1, to_=5, resolution=1, orient=tk.HORIZONTAL, bg='#f0f0f0')
        ppl_scale.bind("<ButtonRelease-1>", lambda e: self._init_pose_landmarker())
        ppl_scale.pack(fill=tk.X)

        # --- 防抖滤波配置区 ---
        tk.Label(self.right_frame, text="【 OneEuro 防抖滤波 (导出数据) 】", font=("Arial", 12, "bold"), bg='#f0f0f0').pack(pady=(15, 5))

        tk.Checkbutton(self.right_frame, text="启用 3D 坐标数据平滑防抖", variable=self.param_enable_smoothing, bg='#f0f0f0', command=self.update_filter_params).pack(anchor="w")

        tk.Label(self.right_frame, text="最小截止频率 (Min Cutoff) - 越小越平滑但有延迟", bg='#f0f0f0', anchor="w").pack(fill=tk.X, pady=(5, 0))
        cutoff_scale = tk.Scale(self.right_frame, variable=self.param_smooth_cutoff, from_=0.01, to_=5.0, resolution=0.1, orient=tk.HORIZONTAL, bg='#f0f0f0')
        cutoff_scale.bind("<ButtonRelease-1>", lambda e: self.update_filter_params())
        cutoff_scale.pack(fill=tk.X)

        tk.Label(self.right_frame, text="速度系数 (Beta) - 越大对快速运动响应越快", bg='#f0f0f0', anchor="w").pack(fill=tk.X)
        beta_scale = tk.Scale(self.right_frame, variable=self.param_smooth_beta, from_=0.0, to_=2.0, resolution=0.01, orient=tk.HORIZONTAL, bg='#f0f0f0')
        beta_scale.bind("<ButtonRelease-1>", lambda e: self.update_filter_params())
        beta_scale.pack(fill=tk.X)

        # --- 录制导出区 ---
        tk.Frame(self.right_frame, height=2, bd=1, relief=tk.SUNKEN).pack(fill=tk.X, pady=15)
        tk.Label(self.right_frame, text="【 数据捕捉录制 & 导出 】", font=("Arial", 12, "bold"), bg='#f0f0f0').pack(pady=(0, 10))

        self.btn_record = tk.Button(self.right_frame, text="🔴 开始动作录制", command=self.toggle_record, state=tk.DISABLED, bg='#e0e0e0', font=("Arial", 11, "bold"), pady=8)
        self.btn_record.pack(fill=tk.X)

        export_btn_frame = tk.Frame(self.right_frame, bg='#f0f0f0')
        export_btn_frame.pack(fill=tk.X, pady=(5, 0))

        self.btn_export_json = tk.Button(export_btn_frame, text="导出 JSON", command=lambda: self.export_data('json'), state=tk.DISABLED)
        self.btn_export_json.pack(side=tk.LEFT, expand=True, fill=tk.X, padx=2)

        self.btn_export_bvh = tk.Button(export_btn_frame, text="导出 BVH (动画标准)", command=lambda: self.export_data('bvh'), state=tk.DISABLED)
        self.btn_export_bvh.pack(side=tk.LEFT, expand=True, fill=tk.X, padx=2)

    def update_filter_params(self):
        cutoff = self.param_smooth_cutoff.get()
        beta = self.param_smooth_beta.get()
        self.face_filter.min_cutoff = cutoff
        self.face_filter.beta = beta
        self.pose_filter.min_cutoff = cutoff
        self.pose_filter.beta = beta
        self.lhand_filter.min_cutoff = cutoff
        self.lhand_filter.beta = beta
        self.rhand_filter.min_cutoff = cutoff
        self.rhand_filter.beta = beta

    def on_mode_change(self):
        mode = self.param_capture_mode.get()
        if mode == "single_holistic":
            self.status_label.config(text="状态: 已切换到【单人精细捕捉】模式")
        else:
            self.status_label.config(text="状态: 已切换到【多人骨骼捕捉】模式")

    def reinit_holistic(self):
        if hasattr(self, 'holistic') and self.holistic is not None:
            self.holistic.close()
        self.holistic = self.mp_holistic.Holistic(
            min_detection_confidence=self.param_min_det_conf.get(),
            min_tracking_confidence=self.param_min_track_conf.get(),
            model_complexity=self.param_model_complexity.get()
        )
        self._init_pose_landmarker()
        self.status_label.config(text=f"状态: 模型已重置 (复杂={self.param_model_complexity.get()})")

    def open_camera(self):
        self._start_video_source(0)
        self.status_label.config(text="状态: 摄像头开启")

    def open_video_file(self):
        file_path = filedialog.askopenfilename(
            title="选择视频文件",
            filetypes=(("Video files", "*.mp4 *.avi *.mov *.mkv"), ("All files", "*.*"))
        )
        if file_path:
            self._start_video_source(file_path)
            self.status_label.config(text=f"状态: 播放本地视频 ({file_path.split('/')[-1]})")

    def _start_video_source(self, source):
        if self.vid is not None:
            self.vid.release()

        if self._update_job is not None:
            self.window.after_cancel(self._update_job)
            self._update_job = None

        self.video_source = source
        self.vid = cv2.VideoCapture(source)

        if not self.vid.isOpened():
            messagebox.showerror("错误", "无法打开视频源")
            return

        self.is_playing = True
        self.btn_toggle.config(state=tk.NORMAL)
        self.btn_record.config(state=tk.NORMAL)

        # 启动更新循环
        self.update()

    def toggle_play(self):
        self.is_playing = not self.is_playing
        if self.is_playing:
            if self._update_job is not None:
                self.window.after_cancel(self._update_job)
            self.update()
        else:
            if self._update_job is not None:
                self.window.after_cancel(self._update_job)
                self._update_job = None

    def toggle_record(self):
        if not self.is_recording:
            # 开始录制
            self.is_recording = True
            self.recorded_data = []
            self.frame_count = 0
            self.start_time = time.time()
            self.btn_record.config(text="⏹ 停止录制", bg='red', fg='white')
            self.btn_export_json.config(state=tk.DISABLED)
            self.btn_export_bvh.config(state=tk.DISABLED)
            self.status_label.config(text="状态: 录制中...", fg="red")
        else:
            # 停止录制
            self.is_recording = False
            self.btn_record.config(text="🔴 重新开始录制", bg='lightgray', fg='black')

            if self.frame_count > 0:
                self.btn_export_json.config(state=tk.NORMAL)
                # BVH 导出当前只支持单人模式的骨骼数据，或者是多人模式的第一个人
                self.btn_export_bvh.config(state=tk.NORMAL)
                self.status_label.config(text=f"状态: 录制已停止，包含 {self.frame_count} 帧。请选择导出格式", fg="blue")
            else:
                self.status_label.config(text="状态: 录制停止 (无数据)")

    def export_data(self, fmt='json'):
        if not self.recorded_data:
            messagebox.showinfo("提示", "没有捕捉到任何数据")
            return

        fps = self.frame_count / (time.time() - self.start_time) if self.frame_count > 0 else 30.0

        if fmt == 'json':
            save_path = filedialog.asksaveasfilename(
                defaultextension=".json",
                initialfile=f"mocap_{int(time.time())}.json",
                title="保存 JSON 数据",
                filetypes=(("JSON files", "*.json"), ("All files", "*.*"))
            )
            if save_path:
                try:
                    with open(save_path, 'w', encoding='utf-8') as f:
                        json.dump({
                            "frames": self.frame_count,
                            "fps": fps,
                            "data": self.recorded_data
                        }, f)
                    messagebox.showinfo("成功", f"JSON 已成功导出:\n{save_path}")
                except Exception as e:
                    messagebox.showerror("错误", f"导出 JSON 失败:\n{str(e)}")

        elif fmt == 'bvh':
            save_path = filedialog.asksaveasfilename(
                defaultextension=".bvh",
                initialfile=f"mocap_{int(time.time())}.bvh",
                title="保存 BVH 动画",
                filetypes=(("BVH files", "*.bvh"), ("All files", "*.*"))
            )
            if save_path:
                try:
                    # 提取纯 pose 的数组序列
                    pose_sequence = []
                    for frame in self.recorded_data:
                        if self.param_capture_mode.get() == 'single_holistic':
                            pose_sequence.append(frame.get("pose"))
                        else:
                            # 多人模式默认导出第一个人（Index 0）作为主角色
                            poses = frame.get("people_poses")
                            if poses and len(poses) > 0:
                                pose_sequence.append(poses[0])
                            else:
                                pose_sequence.append(None)

                    exporter = BVHExporter()
                    bvh_content = exporter.convert_pose_frames_to_bvh(pose_sequence, fps=fps)

                    with open(save_path, 'w', encoding='utf-8') as f:
                        f.write(bvh_content)
                    messagebox.showinfo("成功", f"BVH 动画已成功导出:\n{save_path}")
                except Exception as e:
                    messagebox.showerror("错误", f"导出 BVH 失败:\n{str(e)}")

        self.status_label.config(text="状态: 准备就绪")

    def _extract_landmarks(self, landmark_list, from_task_api=False):
        """将 MediaPipe 的 landmarks 转换为字典列表，提取 x, y, z 和可见度"""
        if not landmark_list:
            return None
        if from_task_api:
            return [{"x": lm.x, "y": lm.y, "z": lm.z, "v": lm.visibility if hasattr(lm, 'visibility') else 1.0} for lm in landmark_list]
        else:
            return [{"x": lm.x, "y": lm.y, "z": lm.z, "v": lm.visibility if hasattr(lm, 'visibility') else 1.0} for lm in landmark_list.landmark]

    def process_frame(self, frame, timestamp_ms):
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        t = time.time()

        if self.param_capture_mode.get() == "single_holistic":
            # 模式 1：单人全身超精细
            results = self.holistic.process(image)
            image.flags.writeable = True
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

            self.mp_drawing.draw_landmarks(
                image, results.face_landmarks, self.mp_holistic.FACEMESH_TESSELATION,
                landmark_drawing_spec=None, connection_drawing_spec=self.mp_drawing_styles.get_default_face_mesh_tesselation_style()
            )
            self.mp_drawing.draw_landmarks(
                image, results.pose_landmarks, self.mp_holistic.POSE_CONNECTIONS,
                landmark_drawing_spec=self.mp_drawing_styles.get_default_pose_landmarks_style()
            )
            self.mp_drawing.draw_landmarks(image, results.left_hand_landmarks, self.mp_holistic.HAND_CONNECTIONS)
            self.mp_drawing.draw_landmarks(image, results.right_hand_landmarks, self.mp_holistic.HAND_CONNECTIONS)

            raw_face = self._extract_landmarks(results.face_landmarks)
            raw_pose = self._extract_landmarks(results.pose_landmarks)
            raw_lhand = self._extract_landmarks(results.left_hand_landmarks)
            raw_rhand = self._extract_landmarks(results.right_hand_landmarks)

            if self.param_enable_smoothing.get():
                face_data = self.face_filter.process(t, raw_face)
                pose_data = self.pose_filter.process(t, raw_pose)
                lhand_data = self.lhand_filter.process(t, raw_lhand)
                rhand_data = self.rhand_filter.process(t, raw_rhand)
            else:
                face_data, pose_data, lhand_data, rhand_data = raw_face, raw_pose, raw_lhand, raw_rhand

            if self.is_recording:
                self.recorded_data.append({
                    "frame_id": self.frame_count, "timestamp": t - self.start_time,
                    "face": face_data, "pose": pose_data, "left_hand": lhand_data, "right_hand": rhand_data,
                    "people_poses": None # 区分模式
                })
                self.frame_count += 1

            # 更新 3D 预览（主视角人）
            if pose_data:
                self._update_3d_plot(pose_data)

        else:
            # 模式 2：多人骨骼姿态
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image)
            results = self.pose_landmarker.detect_for_video(mp_image, int(timestamp_ms))
            image.flags.writeable = True
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

            all_poses_data = []

            if results.pose_landmarks:
                for i, pose_landmarks in enumerate(results.pose_landmarks):
                    # 绘制每个人
                    proto_landmarks = mp.framework.formats.landmark_pb2.NormalizedLandmarkList()
                    proto_landmarks.landmark.extend([
                        mp.framework.formats.landmark_pb2.NormalizedLandmark(x=lm.x, y=lm.y, z=lm.z, visibility=lm.visibility if hasattr(lm, 'visibility') else 1.0)
                        for lm in pose_landmarks
                    ])
                    self.mp_drawing.draw_landmarks(
                        image, proto_landmarks, mp.solutions.pose.POSE_CONNECTIONS,
                        landmark_drawing_spec=self.mp_drawing_styles.get_default_pose_landmarks_style()
                    )

                    # 提取数据 (注意多人模式的防抖比较复杂，因为每次检测的 index 不一定对应同一个人，所以这里多人模式暂时跳过防抖以避免幽灵重影)
                    pose_data = self._extract_landmarks(pose_landmarks, from_task_api=True)
                    all_poses_data.append(pose_data)

            # 更新 3D 预览（渲染检测到的第一个人）
            if all_poses_data and len(all_poses_data) > 0:
                self._update_3d_plot(all_poses_data[0])

            if self.is_recording:
                self.recorded_data.append({
                    "frame_id": self.frame_count, "timestamp": t - self.start_time,
                    "face": None, "pose": None, "left_hand": None, "right_hand": None,
                    "people_poses": all_poses_data
                })
                self.frame_count += 1

        return image

    def update(self):
        if self.is_playing and self.vid is not None and self.vid.isOpened():
            ret, frame = self.vid.read()
            if ret:
                # 处理图像
                timestamp_ms = self.vid.get(cv2.CAP_PROP_POS_MSEC)
                if timestamp_ms <= 0: timestamp_ms = time.time() * 1000
                processed_frame = self.process_frame(frame, timestamp_ms)

                # 转换图像以便在 Tkinter 中显示
                cv2image = cv2.cvtColor(processed_frame, cv2.COLOR_BGR2RGB)

                # 调整图像大小以适应 Canvas
                h, w = cv2image.shape[:2]
                canvas_w = self.canvas.winfo_width()
                canvas_h = self.canvas.winfo_height()

                if canvas_w > 10 and canvas_h > 10:
                    ratio = min(canvas_w/w, canvas_h/h)
                    new_w, new_h = int(w*ratio), int(h*ratio)
                    cv2image = cv2.resize(cv2image, (new_w, new_h))

                img = Image.fromarray(cv2image)
                self.photo = ImageTk.PhotoImage(image=img)

                if self._canvas_image_id is None:
                    self._canvas_image_id = self.canvas.create_image(canvas_w//2, canvas_h//2, image=self.photo, anchor=tk.CENTER)
                else:
                    self.canvas.itemconfig(self._canvas_image_id, image=self.photo)
                    self.canvas.coords(self._canvas_image_id, canvas_w//2, canvas_h//2)

                # 循环调用
                self._update_job = self.window.after(15, self.update)
            else:
                # 视频结束
                if isinstance(self.video_source, str):  # 如果是本地视频
                    self.is_playing = False
                    if self.is_recording:
                        self.toggle_record()  # 自动停止录制并保存
                    self.status_label.config(text="状态: 视频播放结束")
                else:
                    self._update_job = self.window.after(15, self.update)

    def on_closing(self):
        if self.is_recording:
            if messagebox.askokcancel("退出", "正在录制中，退出将丢失当前未保存的捕捉数据。确定要退出吗？"):
                self._cleanup_and_quit()
        else:
            self._cleanup_and_quit()

    def _cleanup_and_quit(self):
        self.is_playing = False
        if self._update_job is not None:
            self.window.after_cancel(self._update_job)
        if self.vid is not None:
            self.vid.release()
        self.holistic.close()
        self.window.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = MotionCaptureApp(root, "全身/面部 2D转3D 动画捕捉系统")
    root.mainloop()
