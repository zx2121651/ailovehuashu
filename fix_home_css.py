import glob

files = glob.glob("/app/huashu-app/src/**/*.jsx", recursive=True)

for file in files:
    with open(file, "r") as f:
        content = f.read()

    # Strip rigid backgrounds and borders
    content = content.replace('bg-gray-50', 'bg-transparent')
    content = content.replace('bg-[#F5F7FA]', 'bg-transparent')
    content = content.replace('bg-white', 'love-card')
    content = content.replace('border-gray-100', 'border-transparent')

    with open(file, "w") as f:
        f.write(content)
