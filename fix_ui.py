import re

with open("/app/huashu-admin/src/pages/InteractiveStoryManagement.jsx", "r") as f:
    content = f.read()

pattern = re.compile(r'<span className=\{`text-xs px-2 py-1 rounded-full \$\{story\.status === .ACTIVE. \? .bg-green-100 text-green-700. : .bg-gray-100 text-gray-700.\}`\}>.*?<span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">', re.DOTALL)

replacement = """<span className={`text-xs px-2 py-1 rounded-full ${story.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {story.status}
                      </span>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        {story.category || '未分类'} · {story.difficulty || 1}星
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">"""

new_content = re.sub(pattern, replacement, content)

with open("/app/huashu-admin/src/pages/InteractiveStoryManagement.jsx", "w") as f:
    f.write(new_content)
