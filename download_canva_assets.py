import re
import os
import urllib.request

source_file = r'C:\Users\THIETKE\.gemini\antigravity\brain\a869ff89-1562-4246-8135-c7401426ddea\.system_generated\steps\8\content.md'
with open(source_file, 'r', encoding='utf-8') as f:
    content = f.read()

asset_paths = set(re.findall(r'(_assets/(?:media|video|images)/[^\s\"\'<>]+\.(?:png|jpg|jpeg|svg|webp))', content))
print(f"Found {len(asset_paths)} media assets.")

dest_dir = r'D:\paca\assets\canva'
os.makedirs(dest_dir, exist_ok=True)

base_url = 'https://pacamenu.my.canva.site/paca-2025-online-menu/'
downloaded = []
failed = []

for rel_path in sorted(asset_paths):
    filename = os.path.basename(rel_path)
    local_path = os.path.join(dest_dir, filename)
    if os.path.exists(local_path) and os.path.getsize(local_path) > 0:
        downloaded.append(filename)
        continue
    
    url = base_url + rel_path
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read()
            with open(local_path, 'wb') as out_f:
                out_f.write(data)
            downloaded.append(filename)
    except Exception as e:
        failed.append((filename, str(e)))

print(f"Downloaded {len(downloaded)} assets. Failed: {len(failed)}")
if failed:
    print("Sample failures:", failed[:5])
