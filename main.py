import cv2
import mediapipe as mp
import numpy as np
import tkinter as tk
from tkinter import filedialog, messagebox
from PIL import Image, ImageTk
import json
import time
import threading

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

        # 构建 UI
        self._build_ui()

        # 窗口关闭事件
        self.window.protocol("WM_DELETE_WINDOW", self.on_closing)

    def _build_ui(self):
        # 顶部控制面板
        control_frame = tk.Frame(self.window, pady=10)
        control_frame.pack(side=tk.TOP, fill=tk.X)

        self.btn_camera = tk.Button(control_frame, text="打开摄像头", width=15, command=self.open_camera)
        self.btn_camera.pack(side=tk.LEFT, padx=10)

        self.btn_video = tk.Button(control_frame, text="选择本地视频", width=15, command=self.open_video_file)
        self.btn_video.pack(side=tk.LEFT, padx=10)

        self.btn_toggle = tk.Button(control_frame, text="开始/暂停", width=15, command=self.toggle_play, state=tk.DISABLED)
        self.btn_toggle.pack(side=tk.LEFT, padx=10)

        self.btn_record = tk.Button(control_frame, text="开始录制 (JSON)", width=20, command=self.toggle_record, state=tk.DISABLED, bg='lightgray')
        self.btn_record.pack(side=tk.LEFT, padx=10)

        # 状态显示
        self.status_label = tk.Label(control_frame, text="状态: 等待输入", fg="blue")
        self.status_label.pack(side=tk.RIGHT, padx=20)

        # 视频画布区域
        self.canvas = tk.Canvas(self.window, width=800, height=600, bg='black')
        self.canvas.pack(side=tk.TOP, pady=10, expand=True)

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

        # 录制数据
        if self.is_recording:
            frame_data = {
                "frame_id": self.frame_count,
                "timestamp": time.time() - self.start_time,
                "face": self._extract_landmarks(results.face_landmarks),
                "pose": self._extract_landmarks(results.pose_landmarks),
                "left_hand": self._extract_landmarks(results.left_hand_landmarks),
                "right_hand": self._extract_landmarks(results.right_hand_landmarks)
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
