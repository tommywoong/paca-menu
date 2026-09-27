import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('data/default_canvas_template.json', 'r', encoding='utf-8') as f:
    tpl = json.load(f)

with open('data/menu.json', 'r', encoding='utf-8') as f:
    menu = json.load(f)

menu_items_map = {it['id']: it for it in menu.get('items', [])}

print(f"Total menu items in menu.json: {len(menu_items_map)}")

missing = []
for p_idx, p in enumerate(tpl['pages']):
    for el in p['elements']:
        if el['type'] == 'product_card':
            pid = el.get('binding', {}).get('productId')
            if not pid or pid not in menu_items_map:
                missing.append((p_idx, p['title'], pid, el['props'].get('title')))
            else:
                it = menu_items_map[pid]
                # Check price consistency
                tpl_price = el['props'].get('price')
                # Format to int if possible
                try:
                    tpl_price_int = int(str(tpl_price).replace('k', '').replace('.', '').strip())
                    if tpl_price_int < 1000:
                        tpl_price_int *= 1000
                except:
                    tpl_price_int = 0
                if tpl_price_int and tpl_price_int != it['price']:
                    print(f"PRICE DIFF: [{pid}] '{it['name']}' menu.json={it['price']} vs template={tpl_price}")

if missing:
    print(f"\nMISSING BINDINGS ({len(missing)}):")
    for m in missing:
        print(f"  Page {m[0]} ({m[1]}): pid='{m[2]}', title='{m[3]}'")
else:
    print("\n✓ ALL product cards in 7-page template correctly bind to menu.json!")
