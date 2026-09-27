import sys
import json
import os

sys.stdout.reconfigure(encoding='utf-8')

with open('canva_texts.txt', 'r', encoding='utf-8') as f:
    text = f.read()

print("=== CANVA TEXTS OVERVIEW ===")
sections = text.split("==================================================")
for idx, sec in enumerate(sections):
    sec_clean = sec.strip()
    if not sec_clean:
        continue
    lines = [l.strip() for l in sec_clean.split("\n") if l.strip()]
    first_few = " | ".join(lines[:4])
    print(f"\n--- Section {idx} ({len(lines)} lines) ---")
    print(f"Preview: {first_few[:120]}")
    for l in lines:
        print(f"  > {l}")

# Check assets/manifest.json
if os.path.exists('assets/manifest.json'):
    with open('assets/manifest.json', 'r', encoding='utf-8') as f:
        mf = json.load(f)
    print(f"\n=== ASSETS MANIFEST: {len(mf)} items ===")
    for item in mf[:20]:
        print(f"  {item.get('name')}: {item.get('path')} ({item.get('type')})")
