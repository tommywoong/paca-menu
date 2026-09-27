import os
import json
from PIL import Image

assets_dir = r'D:\paca\assets\canva'
files = os.listdir(assets_dir)

manifest = {
    "backgrounds": [],
    "cocktails": [],
    "beer_drinks": [],
    "food": [],
    "stickers_decor": [],
    "icons_svg": []
}

for fname in files:
    fpath = os.path.join(assets_dir, fname)
    ext = os.path.splitext(fname)[1].lower()
    
    if ext == '.svg':
        manifest["icons_svg"].append({
            "filename": fname,
            "path": f"assets/canva/{fname}",
            "type": "svg"
        })
        continue

    try:
        with Image.open(fpath) as img:
            w, h = img.size
            ratio = w / h if h > 0 else 1
            info = {
                "filename": fname,
                "path": f"assets/canva/{fname}",
                "width": w,
                "height": h,
                "ratio": round(ratio, 2)
            }
            
            # Detect background photo (large landscape or high res)
            if (w > 800 or h > 800) and ext in ['.jpg', '.jpeg']:
                manifest["backgrounds"].append(info)
            elif ext == '.png':
                # PNG with transparency usually sticker or drink
                if w < 200 and h < 200:
                    manifest["stickers_decor"].append(info)
                elif ratio < 0.8:
                    manifest["cocktails"].append(info)
                else:
                    manifest["food"].append(info)
            else:
                manifest["cocktails"].append(info)
    except Exception as e:
        manifest["stickers_decor"].append({
            "filename": fname,
            "path": f"assets/canva/{fname}",
            "error": str(e)
        })

output_path = r'D:\paca\assets\canva_manifest.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)

print(f"Created manifest with {len(files)} items mapped into categories.")
