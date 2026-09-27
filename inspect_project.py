import sys
import json
import os

sys.stdout.reconfigure(encoding='utf-8')

# 1. Inspect menu.json
with open('data/menu.json', 'r', encoding='utf-8') as f:
    menu = json.load(f)

print(f"=== MENU.JSON: {len(menu.get('items', []))} items ===")
cats = {}
for it in menu.get('items', []):
    c = it.get('category', 'unknown')
    cats[c] = cats.get(c, 0) + 1
print("Categories count:", cats)

# 2. Inspect default_canvas_template.json
with open('data/default_canvas_template.json', 'r', encoding='utf-8') as f:
    tpl = json.load(f)

print(f"\n=== CANVAS TEMPLATE: {len(tpl.get('pages', []))} pages ===")
for i, p in enumerate(tpl.get('pages', [])):
    cards = [e for e in p.get('elements', []) if e.get('type') == 'product_card']
    card_ids = [c.get('binding', {}).get('productId') for c in cards]
    print(f"Page {i}: id='{p.get('id')}', title='{p.get('title')}', h={p.get('height')}, cards={len(cards)} -> {card_ids}")

# 3. Check canva texts
if os.path.exists('canva_texts.txt'):
    with open('canva_texts.txt', 'r', encoding='utf-8') as f:
        print(f"\ncanva_texts.txt length: {len(f.read())} chars")
