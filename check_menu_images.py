import json

with open('data/menu.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

for it in d['items']:
    img = it.get('image', '')
    cat = it.get('category', '')
    print(f"[{cat}] {it['id']}: {it['name']} -> {img}")
