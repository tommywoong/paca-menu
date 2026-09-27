import os
from PIL import Image

files = sorted(os.listdir('assets/canva'))
print(f"Total files: {len(files)}")

# Let's inspect all files with size and mode
for f in files:
    if f.lower().endswith(('.png', '.jpg', '.jpeg')):
        p = os.path.join('assets/canva', f)
        try:
            with Image.open(p) as im:
                # check if square or portrait
                w, h = im.size
                if w > 300 and h > 300:
                    print(f"{f}: {im.size} {im.mode}")
        except:
            pass
