import json

with open(r'D:\paca\data\menu.json', 'r', encoding='utf-8') as f:
    menu = json.load(f)

# Update Popcorn Chicken with variants
for it in menu['items']:
    if it['id'] == 'b08':
        it['name'] = "POPCORN CHICKEN WITH SWEET & SPICY SAUCE + MELTED CHEESE"
        it['name_vi'] = "Gà viên sốt cay phủ phô mai"
        it['price'] = 95000
        it['variants'] = [
            {"id": "m", "name": "Size M", "price": 95000},
            {"id": "l", "name": "Size L", "price": 125000}
        ]
        it['options'] = [
            {"id": "extra_cheese", "name": "Thêm phô mai kéo sợi (+Extra Cheese)", "price": 30000}
        ]
    elif it['id'] == 'b09':
        # Can keep b09 or mark as alias
        it['is_available'] = True

# Add matching images from canva if known
with open(r'D:\paca\data\menu.json', 'w', encoding='utf-8') as f:
    json.dump(menu, f, ensure_ascii=False, indent=2)

print("Updated menu.json with variants and options.")
