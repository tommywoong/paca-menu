import os
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

canva_dir = 'assets/canva'
files = os.listdir(canva_dir)
print(f"Total files in {canva_dir}: {len(files)}")

if os.path.exists('assets/manifest.json'):
    with open('assets/manifest.json', 'r', encoding='utf-8') as f:
        mf = json.load(f)
    print(f"\nManifest items ({len(mf)}):")
    for item in mf:
        print(f"  [{item.get('type')}] {item.get('name')}: {item.get('path')} (rel={item.get('relevant_item')})")
