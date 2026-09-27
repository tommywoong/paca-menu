import re
import json

with open(r'C:\Users\THIETKE\.gemini\antigravity\brain\a869ff89-1562-4246-8135-c7401426ddea\.system_generated\steps\8\content.md', encoding='utf-8') as f:
    text = f.read()

# find all media mappings {"type":..., "id":"...", "files":[...]}
media_map = {}
raster_matches = re.finditer(r'\"id\":\"([^\"]+)\",\"version\":\d+,\"files\":\[\{.*?\"url\":\"_assets/([^\"]+)\"', text)
for m in raster_matches:
    media_id = m.group(1)
    file_path = m.group(2)
    media_map[media_id] = file_path

print(f"Mapped {len(media_map)} media IDs to local files.")

with open(r'D:\paca\assets\canva_id_map.json', 'w', encoding='utf-8') as out:
    json.dump(media_map, out, indent=2)
