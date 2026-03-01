import re

with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("processed_frame = self.process_frame(frame)", "timestamp_ms = self.vid.get(cv2.CAP_PROP_POS_MSEC)\n                if timestamp_ms <= 0: timestamp_ms = time.time() * 1000\n                processed_frame = self.process_frame(frame, timestamp_ms)")

with open('main.py', 'w', encoding='utf-8') as f:
    f.write(content)
