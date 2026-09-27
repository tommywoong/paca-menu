import re
import json

with open(r'C:\Users\THIETKE\.gemini\antigravity\brain\a869ff89-1562-4246-8135-c7401426ddea\.system_generated\steps\8\content.md', 'r', encoding='utf-8') as f:
    raw = f.read()

# Build media definitions dict
media_defs = re.findall(r'\"type\":\"(?:RASTER|VECTOR)\",\"id\":\"(MA[A-Za-z0-9_\-]+)\",\"version\":\d+,\"files\":\[\{\"url\":\"_assets/media/([^\"]+)\"', raw)
media_map = dict(media_defs)

# Canva uses: "rows" or "pages" or "document"
# Let's find all text blocks with their surrounding media
# A text block has: "A":["...text..."]
text_blocks = re.finditer(r'\"A\":\[\"([^\"]+)\"\]', raw)
blocks = []
for tb in text_blocks:
    txt = tb.group(1).encode().decode('unicode_escape')
    pos = tb.start()
    blocks.append((pos, txt))

print(f"Found {len(blocks)} text blocks in Canva.")

# Now for each block, find the nearest media reference
results = []
for pos, txt in blocks:
    txt_clean = txt.strip().replace('\\n', ' ')
    if len(txt_clean) < 3:
        continue
    # find nearest media within 2000 chars
    nearby = raw[max(0, pos-1500):min(len(raw), pos+1500)]
    mids = re.findall(r'(MA[A-Za-z0-9_\-]{8,})', nearby)
    mids_known = [m for m in mids if m in media_map]
    if mids_known:
        files = [media_map[m] for m in mids_known]
        results.append((txt_clean, files))

print(f"Mapped {len(results)} text blocks with nearby media.")
for t, fl in results[:30]:
    print(f"TEXT: {t[:60]}")
    print(f"  MEDIA: {set(fl)}\n")
