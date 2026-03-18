import os

images = [f for f in os.listdir('lianaijiapan') if f.endswith('.jpg')]
images.sort()

html = "<html><body><h1>Gallery</h1>"
for img in images:
    html += f"<h2>{img}</h2><img src='lianaijiapan/{img}' width='300'><br>"
html += "</body></html>"

with open('gallery.html', 'w') as f:
    f.write(html)
