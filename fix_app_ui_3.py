import re

with open("/app/huashu-app/src/pages/story/StoryList.jsx", "r") as f:
    content = f.read()

content = content.replace("</h3>\n                      </div>\n                      <div className=\"flex", "</h3>\n                      </div>\n                      <div className=\"flex")
content = content.replace("</div>\n                      </div>\n                      <p", "</div>\n                      <p")
with open("/app/huashu-app/src/pages/story/StoryList.jsx", "w") as f:
    f.write(content)
