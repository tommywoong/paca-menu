import json
import re
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

step_file = r'C:\Users\THIETKE\.gemini\antigravity\brain\a869ff89-1562-4246-8135-c7401426ddea\.system_generated\steps\8\content.md'
with open(step_file, 'r', encoding='utf-8') as f:
    raw = f.read()

# Build mapping of media_id -> image_file from the RASTER definitions
# {"type":"RASTER","id":"MA...","version":1,"files":[{"url":"_assets/media/...
media_defs = re.findall(r'\"type\":\"(?:RASTER|VECTOR)\",\"id\":\"(MA[A-Za-z0-9_\-]+)\",\"version\":\d+,\"files\":\[\{\"url\":\"_assets/media/([^\"]+)\"', raw)
print(f"Total media definitions: {len(media_defs)}")
media_map = {}
for mid, filename in media_defs:
    media_map[mid] = filename

# Let's find all element placements that use media:
# Canva elements that render an image typically have: "A":"MA..." or "id":"...", ..., "A":"MA..."
# Let's search for: "A":"(MA[A-Za-z0-9_\-]+)"
placements = []
for m in re.finditer(r'\"A\":\"(MA[A-Za-z0-9_\-]+)\"', raw):
    mid = m.group(1)
    pos = m.start()
    # Search around for text or coordinates
    context = raw[max(0, pos-500):min(len(raw), pos+500)]
    fn = media_map.get(mid, 'unknown')
    placements.append((mid, fn, pos, context))

print(f"Total image placements in Canva: {len(placements)}")

# Let's check each placement's context for dish names or page names
dishes_keywords = [
    ('FRIES_GARLIC', 'french fries with GARLIC FISH SAUCE'),
    ('FRIES_BACON', 'bacon and cheese'),
    ('FRIES_CHEESE', 'fries with cheese'),
    ('FRIES_ONION', 'creamy onion'),
    ('FRIES_PLAIN', 'FRENCH FRIES'),
    ('POPCORN', 'POPCORN CHICKEN'),
    ('MACARONI', 'Macaroni and Cheese'),
    ('WONTON', 'wonton chips'),
    ('VELVET_BANANE', 'VELVET BANANE'),
    ('SOLD_OUT', 'SOLD OUT'),
    ('BEER', 'beer'),
    ('CIDER', 'cider'),
    ('STRAWBERRY', 'welcome to our tiny'),
    ('PACA_LOGO', 'PACA')
]

matched = []
for mid, fn, pos, ctx in placements:
    for tag, kw in dishes_keywords:
        if kw.lower() in ctx.lower():
            matched.append((tag, mid, fn, pos))
            print(f"MATCH: [{tag}] -> {mid} ({fn})")

print(f"\nTotal matched: {len(matched)}")
