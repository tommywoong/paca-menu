import re
import json

source_file = r'C:\Users\THIETKE\.gemini\antigravity\brain\a869ff89-1562-4246-8135-c7401426ddea\.system_generated\steps\8\content.md'
with open(source_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Canva websites embed their manifest in window['bootstrap'] or similar
match = re.search(r'window\[\'bootstrap\'\]\s*=\s*JSON\.parse\(\'([^\']+)\'\);', content)
if match:
    raw_json = match.group(1).encode('utf-8').decode('unicode_escape')
    try:
        data = json.loads(raw_json)
        print("Bootstrap keys:", list(data.keys()))
        # Find images/media in data
        media_urls = re.findall(r'https?://[^\s\"\'<>]+', raw_json)
        print("Media URLs in bootstrap:", len(media_urls), media_urls[:10])
    except Exception as e:
        print("JSON parse error:", e)
else:
    print("Bootstrap not found by regex")

# Also search directly in content
asset_paths = re.findall(r'(_assets/[^\s\"\'<>]+\.(?:png|jpg|jpeg|svg|webp|css|js))', content)
print("Asset paths:", len(asset_paths), set(asset_paths))
