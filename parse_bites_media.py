import json
import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

step_file = r'C:\Users\THIETKE\.gemini\antigravity\brain\a869ff89-1562-4246-8135-c7401426ddea\.system_generated\steps\8\content.md'
with open(step_file, 'r', encoding='utf-8') as f:
    raw = f.read()

print(f"Loaded raw content: {len(raw)} chars")

with open('assets/canva_id_map.json', 'r', encoding='utf-8') as f:
    id_map = json.load(f)

# Find all occurrences of dishes, especially Bites
bites_keywords = ['FRIES', 'POPCORN', 'MACARONI', 'WONTON', 'KHOAI', 'NUI', 'GÀ VIÊN', 'HOÀNH THÁNH']

for kw in bites_keywords:
    print(f"\n=== SEARCH FOR '{kw}' ===")
    matches = [m.start() for m in re.finditer(kw, raw, re.IGNORECASE)]
    for pos in matches[:3]:
        snippet = raw[max(0, pos-200):min(len(raw), pos+300)]
        # Find any media ID in this snippet
        media_in_snippet = re.findall(r'MA[A-Za-z0-9_\-]+', snippet)
        print(f"At {pos}: {snippet.replace(chr(10), ' ')}")
        if media_in_snippet:
            for mid in media_in_snippet:
                if mid in id_map:
                    print(f"   -> FOUND MEDIA: {mid} -> {id_map[mid]}")
