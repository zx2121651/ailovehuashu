import re

with open("/app/huashu-app/src/pages/story/StoryList.jsx", "r") as f:
    content = f.read()

pattern = re.compile(r'<h3 className="font-bold text-white text-xl drop-shadow-md">\s*\{story\.title\}\s*</h3>', re.DOTALL)

replacement = """<h3 className="font-bold text-white text-xl drop-shadow-md">
                          {story.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 mb-2 text-xs font-medium text-white/90">
                        {story.category && (
                          <span className="bg-pink-500/40 px-2 py-0.5 rounded backdrop-blur-sm border border-pink-400/30">
                            {story.category}
                          </span>
                        )}
                        {story.authorName && (
                          <span className="bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm border border-white/20">
                            ✍️ {story.authorName}
                          </span>
                        )}
                        <span className="bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm border border-white/20 flex items-center">
                          {Array.from({ length: story.difficulty || 1 }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-amber-300 fill-current" />
                          ))}
                        </span>"""

new_content = re.sub(pattern, replacement, content)

with open("/app/huashu-app/src/pages/story/StoryList.jsx", "w") as f:
    f.write(new_content)
