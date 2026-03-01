import re

with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

extract_code = """    def _extract_landmarks(self, landmark_list, from_task_api=False):
        \"\"\"将 MediaPipe 的 landmarks 转换为字典列表，提取 x, y, z 和可见度\"\"\"
        if not landmark_list:
            return None
        if from_task_api:
            return [{"x": lm.x, "y": lm.y, "z": lm.z, "v": lm.visibility if hasattr(lm, 'visibility') else 1.0} for lm in landmark_list]
        else:
            return [{"x": lm.x, "y": lm.y, "z": lm.z, "v": lm.visibility if hasattr(lm, 'visibility') else 1.0} for lm in landmark_list.landmark]

    def process_frame(self, frame, timestamp_ms):"""

content = re.sub(r'    def _extract_landmarks\(self, landmark_list\):.*?(?=    def process_frame\(self, frame\):)', extract_code, content, flags=re.DOTALL)
content = content.replace("    def process_frame(self, frame):", "    def process_frame(self, frame, timestamp_ms):")

with open('main.py', 'w', encoding='utf-8') as f:
    f.write(content)
