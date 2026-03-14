import re
with open("/app/huashu-app/src/App.jsx", "r") as f:
    content = f.read()

# Replace hardcoded tailwind classes with custom css
content = content.replace('className="absolute bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100', 'className="absolute bottom-0 w-full nav-bottom-glass')
content = content.replace('bg-gray-50', 'bg-transparent')
content = content.replace('bg-[#F5F7FA]', 'bg-transparent')

with open("/app/huashu-app/src/App.jsx", "w") as f:
    f.write(content)
