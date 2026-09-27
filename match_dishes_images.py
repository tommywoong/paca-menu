import re
import json

with open(r'C:\Users\THIETKE\.gemini\antigravity\brain\a869ff89-1562-4246-8135-c7401426ddea\.system_generated\steps\8\content.md', encoding='utf-8') as f:
    text = f.read()

with open(r'D:\paca\assets\canva_id_map.json', encoding='utf-8') as f:
    id_map = json.load(f)

# Find sections and element text near raster images
# e.g., "id":"...", files:[{"url":"_assets/..."}]
# Let's see what text appears around each media ID
matches = re.finditer(r'\"A\":\"(MA[A-Za-z0-9_\-]+)\"', text)
found_ids = set()
for m in matches:
    found_ids.add(m.group(1))

print(f"Found {len(found_ids)} media references in elements.")

associations = []
for mid in found_ids:
    idx = text.find(f'"{mid}"')
    if idx != -1:
        # scan +/- 600 characters for dish text
        context = text[max(0, idx-400):min(len(text), idx+600)]
        # find dish keywords
        file_path = id_map.get(mid, '')
        associations.append({
            'media_id': mid,
            'file': file_path,
            'context_sample': context[:180]
        })

print("Sample associations:")
for a in associations[:8]:
    print(a['media_id'], '->', a['file'])
