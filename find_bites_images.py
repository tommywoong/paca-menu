import os
import re
import json
from PIL import Image

# Let's inspect images in assets/canva and see their filenames, aspect ratios, etc.
files = sorted(os.listdir('assets/canva'))
print(f"Total files: {len(files)}")

# In the earlier step 8, let's see which media files were placed in the Bites section
with open(r'C:\Users\THIETKE\.gemini\antigravity\brain\a869ff89-1562-4246-8135-c7401426ddea\.system_generated\steps\8\content.md', 'r', encoding='utf-8') as f:
    raw = f.read()

# Let's find the section between 'bites' / 'nhâm nhi' and 'cocktail' in raw
bites_pos = raw.find('bites')
cocktail_pos = raw.find('No fancy classics here')
print(f"Bites region: {bites_pos} to {cocktail_pos}")

bites_raw = raw[bites_pos-10000:cocktail_pos+5000]
# Find all media references in bites_raw
mids = re.findall(r'\"A\":\"(MA[A-Za-z0-9_\-]+)\"', bites_raw)
print(f"Media in Bites section ({len(mids)}):", set(mids))

with open('assets/canva_id_map.json', 'r', encoding='utf-8') as f:
    id_map = json.load(f)

for mid in set(mids):
    print(f"  {mid} -> {id_map.get(mid, 'none')}")
