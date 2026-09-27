import os
import json
from PIL import Image

canva_dir = r'D:\paca\assets\canva'
files = os.listdir(canva_dir)

print(f"Total files in {canva_dir}: {len(files)}")

# Check image sizes and characteristics
image_details = []
for f in files:
    fp = os.path.join(canva_dir, f)
    ext = os.path.splitext(f)[1].lower()
    if ext in ['.png', '.jpg', '.jpeg']:
        try:
            with Image.open(fp) as im:
                image_details.append({
                    'file': f,
                    'path': f'assets/canva/{f}',
                    'ext': ext,
                    'size': im.size,
                    'mode': im.mode
                })
        except:
            pass

print(f"Loaded {len(image_details)} raster images.")
with open(r'D:\paca\assets\image_details.json', 'w', encoding='utf-8') as out:
    json.dump(image_details, out, indent=2)
