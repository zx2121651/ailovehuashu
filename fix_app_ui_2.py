import re

with open("/app/huashu-app/src/pages/story/StoryList.jsx", "r") as f:
    content = f.read()

content = content.replace("</span>\n                        {getStatusBadge(story.progressStatus)}\n                      </div>\n                      <p", "</span>\n                        {getStatusBadge(story.progressStatus)}\n                      </div>\n                      </div>\n                      <p")

with open("/app/huashu-app/src/pages/story/StoryList.jsx", "w") as f:
    f.write(content)
