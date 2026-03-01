import cv2
import mediapipe as mp
import mediapipe.python.solutions as solutions
import numpy as np
import tkinter as tk
from tkinter import filedialog, messagebox
from PIL import Image, ImageTk
import json
import time
import threading
import math

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
        self.window.geometry("1000x700")

        # 视频/摄像头相关状态
        self.vid = None
        self.is_playing = False
        self.video_source = None
        self._update_job = None
        self._canvas_image_id = None

        # MediaPipe 初始化
        self.mp_holistic = solutions.holistic
        self.mp_drawing = solutions.drawing_utils
        self.mp_drawing_styles = solutions.drawing_styles
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

        # 滤波器实例初始化
        self.face_filter = LandmarkFilter(self.param_smooth_cutoff.get(), self.param_smooth_beta.get())
        self.pose_filter = LandmarkFilter(self.param_smooth_cutoff.get(), self.param_smooth_beta.get())
        self.lhand_filter = LandmarkFilter(self.param_smooth_cutoff.get(), self.param_smooth_beta.get())
        self.rhand_filter = LandmarkFilter(self.param_smooth_cutoff.get(), self.param_smooth_beta.get())

        # 构建 UI
        self._build_ui()

        # 窗口关闭事件
        self.window.protocol("WM_DELETE_WINDOW", self.on_closing)

    def _build_ui(self):
        # 主布局：左右分栏
        self.paned_window = tk.PanedWindow(self.window, orient=tk.HORIZONTAL)
        self.paned_window.pack(fill=tk.BOTH, expand=True)

        # 左侧：画布和底部状态栏
        self.left_frame = tk.Frame(self.paned_window, bg='black')
        self.paned_window.add(self.left_frame, minsize=600)

        self.canvas = tk.Canvas(self.left_frame, bg='black', highlightthickness=0)
        self.canvas.pack(side=tk.TOP, fill=tk.BOTH, expand=True)

        self.status_label = tk.Label(self.left_frame, text="状态: 等待输入", fg="white", bg="#333", anchor="w", padx=10)
        self.status_label.pack(side=tk.BOTTOM, fill=tk.X)

        # 右侧：控制面板
        self.right_frame = tk.Frame(self.paned_window, width=350, padx=15, pady=15, bg='#f0f0f0')
        self.paned_window.add(self.right_frame, minsize=350)

        # --- 输入控制区 ---
        tk.Label(self.right_frame, text="【 输入源控制 】", font=("Arial", 12, "bold"), bg='#f0f0f0').pack(pady=(0, 10))
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
        tk.Label(self.right_frame, text="【 数据捕捉录制 】", font=("Arial", 12, "bold"), bg='#f0f0f0').pack(pady=(0, 10))

        self.btn_record = tk.Button(self.right_frame, text="🔴 开始录制 (导出平滑 JSON)", command=self.toggle_record, state=tk.DISABLED, bg='#e0e0e0', font=("Arial", 11, "bold"), pady=10)
        self.btn_record.pack(fill=tk.X)

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

    def reinit_holistic(self):
        if hasattr(self, 'holistic') and self.holistic is not None:
            self.holistic.close()

        self.holistic = self.mp_holistic.Holistic(
            min_detection_confidence=self.param_min_det_conf.get(),
            min_tracking_confidence=self.param_min_track_conf.get(),
            model_complexity=self.param_model_complexity.get()
        )
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
            self.btn_record.config(text="停止录制并导出", bg='red', fg='white')
            self.status_label.config(text="状态: 录制中...", fg="red")
        else:
            # 停止录制并导出
            self.is_recording = False
            self.btn_record.config(text="开始录制 (JSON)", bg='lightgray', fg='black')
            self.status_label.config(text="状态: 录制停止，正在导出...", fg="blue")
            self.export_data()

    def export_data(self):
        if not self.recorded_data:
            messagebox.showinfo("提示", "没有捕捉到任何数据")
            self.status_label.config(text="状态: 准备就绪")
            return

        save_path = filedialog.asksaveasfilename(
            defaultextension=".json",
            initialfile=f"motion_capture_{int(time.time())}.json",
            title="保存捕捉数据",
            filetypes=(("JSON files", "*.json"), ("All files", "*.*"))
        )

        if save_path:
            try:
                with open(save_path, 'w', encoding='utf-8') as f:
                    json.dump({
                        "frames": self.frame_count,
                        "fps": self.frame_count / (time.time() - self.start_time),
                        "data": self.recorded_data
                    }, f)
                messagebox.showinfo("成功", f"数据已成功导出至:\n{save_path}")
            except Exception as e:
                messagebox.showerror("错误", f"导出数据失败:\n{str(e)}")

        self.status_label.config(text="状态: 准备就绪")

    def _extract_landmarks(self, landmark_list):
        """将 MediaPipe 的 landmarks 转换为字典列表，提取 x, y, z 和可见度"""
        if not landmark_list:
            return None
        return [{"x": lm.x, "y": lm.y, "z": lm.z, "v": lm.visibility} for lm in landmark_list.landmark]

    def process_frame(self, frame):
        """使用 MediaPipe Holistic 处理视频帧"""
        # 将 BGR 转换为 RGB
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False

        # 执行检测
        results = self.holistic.process(image)

        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        # 在图像上绘制特征点
        # 1. 面部网格
        self.mp_drawing.draw_landmarks(
            image,
            results.face_landmarks,
            self.mp_holistic.FACEMESH_TESSELATION,
            landmark_drawing_spec=None,
            connection_drawing_spec=self.mp_drawing_styles.get_default_face_mesh_tesselation_style()
        )
        # 2. 姿态（骨骼）
        self.mp_drawing.draw_landmarks(
            image,
            results.pose_landmarks,
            self.mp_holistic.POSE_CONNECTIONS,
            landmark_drawing_spec=self.mp_drawing_styles.get_default_pose_landmarks_style()
        )
        # 3. 左手
        self.mp_drawing.draw_landmarks(
            image,
            results.left_hand_landmarks,
            self.mp_holistic.HAND_CONNECTIONS
        )
        # 4. 右手
        self.mp_drawing.draw_landmarks(
            image,
            results.right_hand_landmarks,
            self.mp_holistic.HAND_CONNECTIONS
        )

        # 提取关键点并平滑处理
        t = time.time()
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

        # 录制数据 (此时记录的为平滑后的数据)
        if self.is_recording:
            frame_data = {
                "frame_id": self.frame_count,
                "timestamp": t - self.start_time,
                "face": face_data,
                "pose": pose_data,
                "left_hand": lhand_data,
                "right_hand": rhand_data
            }
            self.recorded_data.append(frame_data)
            self.frame_count += 1

        return image

    def update(self):
        if self.is_playing and self.vid is not None and self.vid.isOpened():
            ret, frame = self.vid.read()
            if ret:
                # 处理图像
                processed_frame = self.process_frame(frame)

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
