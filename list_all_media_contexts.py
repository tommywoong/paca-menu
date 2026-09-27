import json
import re
import sys
import os
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

step_file = r'C:\Users\THIETKE\.gemini\antigravity\brain\a869ff89-1562-4246-8135-c7401426ddea\.system_generated\steps\8\content.md'
with open(step_file, 'r', encoding='utf-8') as f:
    raw = f.read()

# Build mapping of media_id -> image_file
media_defs = re.findall(r'\"type\":\"(?:RASTER|VECTOR)\",\"id\":\"(MA[A-Za-z0-9_\-]+)\",\"version\":\d+,\"files\":\[\{\"url\":\"_assets/media/([^\"]+)\"', raw)
media_map = dict(media_defs)

# Let's inspect unique media files referenced
referenced_mids = set(re.findall(r'\"A\":\"(MA[A-Za-z0-9_\-]+)\"', raw))
print(f"Unique referenced media IDs: {len(referenced_mids)}")

for mid in sorted(list(referenced_mids)):
    fn = media_map.get(mid, 'none')
    local_path = os.path.join('assets/canva', fn)
    exists = os.path.exists(local_path)
    sz = None
    if exists and fn.endswith(('.png', '.jpg', '.jpeg')):
        try:
            with Image.open(local_path) as im:
                sz = im.size
        except:
            pass

    # Find text within 1500 chars
    idx = raw.find(f'"{mid}"')
    ctx = raw[max(0, idx-800):min(len(raw), idx+1200)]
    # Extract any readable words
    words = re.findall(r'[A-Za-zÀ-ỹ0-9\+\&\-]{3,}', ctx)
    print(f"\nID: {mid} -> {fn} | Size: {sz} | Exists: {exists}")
    print(f"   Context words: {' '.join(words[:25])}")
