import re

with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "import mediapipe.python.solutions as solutions\nimport numpy as np",
    "import mediapipe.python.solutions as solutions\nfrom mediapipe.tasks import python\nfrom mediapipe.tasks.python import vision\nimport numpy as np"
)

content = content.replace(
    "        self.param_smooth_beta = tk.DoubleVar(value=0.0)\n        \n        # 滤波器实例初始化",
    "        self.param_smooth_beta = tk.DoubleVar(value=0.0)\n        \n        # 捕捉模式变量\n        self.param_capture_mode = tk.StringVar(value=\"single_holistic\")\n        self.param_max_num_poses = tk.IntVar(value=3)\n        \n        # 滤波器实例初始化"
)

content = content.replace(
    "        self.holistic = self.mp_holistic.Holistic(\n            min_detection_confidence=0.5,\n            min_tracking_confidence=0.5,\n            model_complexity=1\n        )\n        \n        # 录制状态",
    "        self.holistic = self.mp_holistic.Holistic(\n            min_detection_confidence=0.5,\n            min_tracking_confidence=0.5,\n            model_complexity=1\n        )\n        \n        # MediaPipe PoseLandmarker (用于多人) 初始化\n        self.pose_landmarker = None\n        self._init_pose_landmarker()\n        \n        # 录制状态"
)

init_pose_code = """
    def _init_pose_landmarker(self):
        base_options = python.BaseOptions(model_asset_path='pose_landmarker_full.task')
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

    def _build_ui(self):"""
content = content.replace("    def _build_ui(self):", init_pose_code.lstrip("\n"))


mode_ui_code = """        # --- 模式选择区 ---
        tk.Label(self.right_frame, text="【 捕捉模式 】", font=("Arial", 12, "bold"), bg='#f0f0f0', fg='#d32f2f').pack(pady=(0, 5))
        mode_frame = tk.Frame(self.right_frame, bg='#f0f0f0')
        mode_frame.pack(fill=tk.X, pady=(0, 10))
        tk.Radiobutton(mode_frame, text="单人精细捕捉 (面部+双手+全身)", variable=self.param_capture_mode, value="single_holistic", command=self.on_mode_change, bg='#f0f0f0', font=("Arial", 9, "bold")).pack(anchor="w")
        tk.Radiobutton(mode_frame, text="多人骨骼捕捉 (最多N人身体)", variable=self.param_capture_mode, value="multi_pose", command=self.on_mode_change, bg='#f0f0f0', font=("Arial", 9, "bold")).pack(anchor="w")

        # --- 输入控制区 ---
        tk.Frame(self.right_frame, height=2, bd=1, relief=tk.SUNKEN).pack(fill=tk.X, pady=5)
        tk.Label(self.right_frame, text="【 输入源控制 】", font=("Arial", 12, "bold"), bg='#f0f0f0').pack(pady=(5, 10))
        btn_frame = tk.Frame(self.right_frame, bg='#f0f0f0')"""
content = content.replace(
    "        # --- 输入控制区 ---\n        tk.Label(self.right_frame, text=\"【 输入源控制 】\", font=(\"Arial\", 12, \"bold\"), bg='#f0f0f0').pack(pady=(0, 10))\n        btn_frame = tk.Frame(self.right_frame, bg='#f0f0f0')",
    mode_ui_code
)


max_pose_code = """        trk_scale.pack(fill=tk.X)

        # 多人模式参数
        tk.Label(self.right_frame, text="最大追踪人数 (仅多人模式)", bg='#f0f0f0', anchor="w", fg='#1976d2').pack(fill=tk.X)
        ppl_scale = tk.Scale(self.right_frame, variable=self.param_max_num_poses, from_=1, to_=5, resolution=1, orient=tk.HORIZONTAL, bg='#f0f0f0')
        ppl_scale.bind("<ButtonRelease-1>", lambda e: self._init_pose_landmarker())
        ppl_scale.pack(fill=tk.X)

        # --- 防抖滤波配置区 ---"""
content = content.replace(
    "        trk_scale.pack(fill=tk.X)\n\n        # --- 防抖滤波配置区 ---",
    max_pose_code
)


reinit_code = """    def on_mode_change(self):
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
        self.status_label.config(text=f"状态: 模型已重置 (复杂={self.param_model_complexity.get()})")"""

content = content.replace(
    "    def reinit_holistic(self):\n        if hasattr(self, 'holistic') and self.holistic is not None:\n            self.holistic.close()\n            \n        self.holistic = self.mp_holistic.Holistic(\n            min_detection_confidence=self.param_min_det_conf.get(),\n            min_tracking_confidence=self.param_min_track_conf.get(),\n            model_complexity=self.param_model_complexity.get()\n        )\n        self.status_label.config(text=f\"状态: 模型已重置 (复杂={self.param_model_complexity.get()})\")",
    reinit_code
)

with open('main.py', 'w', encoding='utf-8') as f:
    f.write(content)
