import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('data/menu.json', 'r', encoding='utf-8') as f:
    menu = json.load(f)

for it in menu.get('items', []):
    print(f"[{it['id']}] ({it.get('category')}) {it['name']} | {it['name_vi']} | {it['price']}đ | station={it.get('station')}")
