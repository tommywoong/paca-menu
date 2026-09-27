import json
import sys

# Load menu.json
with open('data/menu.json', 'r', encoding='utf-8') as f:
    menu = json.load(f)

# Look at existing items
existing_map = {it['id']: it for it in menu['items']}

# Let's inspect existing items
print(f"Total existing items: {len(menu['items'])}")

# Update / add items to align with Canva
# 1. Bites prices & images alignment
bites_updates = {
    'b01': {
        'name': 'FRENCH FRIES WITH GARLIC FISH SAUCE',
        'name_vi': 'Khoai tây chiên mắm tỏi',
        'price': 70000,
        'image': 'assets/canva/0e6ad945841bfc9bde3aefe8930e6839.png',
        'description_vi': 'Khoai tây chiên giòn rụm xốc sốt nước mắm tỏi ớt đậm đà thơm lừng.',
        'badge': 'Best Seller'
    },
    'b02': {
        'name': 'FRENCH FRIES WITH BACON & CHEESE',
        'name_vi': 'Khoai tây chiên sốt phô mai & thịt xông khói',
        'price': 95000,
        'image': 'assets/canva/c243f99dc58032a0f023c28ba843eac2.png',
        'description_vi': 'Khoai tây chiên phủ ngập xốt phô mai béo ngậy và thịt xông khói giòn tan.',
        'badge': 'Must Try'
    },
    'b03': {
        'name': 'FRENCH FRIES WITH CHEESE',
        'name_vi': 'Khoai tây chiên sốt phô mai',
        'price': 70000, # Aligned with Canva (was 85000)
        'image': 'assets/canva/2478f97ef54304ee79763d99641719e0.png',
        'description_vi': 'Khoai tây chiên vàng giòn rưới đẫm xốt phô mai cheddar tan chảy béo ngậy.',
        'badge': 'Cheesy'
    },
    'b04': {
        'name': 'CLASSIC FRENCH FRIES',
        'name_vi': 'Khoai tây chiên truyền thống',
        'price': 55000,
        'image': 'assets/canva/0e6ad945841bfc9bde3aefe8930e6839.png',
        'description_vi': 'Khoai tây cọng truyền thống chiên ráo dầu, giòn lâu ăn kèm sốt cà chua/tương ớt.',
        'badge': 'Classic'
    },
    'b05': {
        'name': 'CRISPY FRIED MACARONI & CHEESE',
        'name_vi': 'Nui chiên giòn lắc phô mai',
        'price': 55000,
        'description_vi': 'Nui chiên phồng giòn rụm lắc bột phô mai mặn ngọt đậm đà, món nhắm lai rai cực dính.',
        'badge': 'Popular'
    },
    'b06': {
        'name': 'FRIED WONTON CHIPS',
        'name_vi': 'Lá hoành thánh chiên giòn',
        'price': 55000, # Aligned with Canva 55k
        'image': 'assets/canva/192a266e9d811dc75d8647348854481c.jpg',
        'description_vi': 'Lá hoành thánh chiên phồng giòn tan chấm tương ớt chua ngọt vui miệng.',
        'badge': 'Snack'
    },
    'b07': {
        'name': 'FRIES WITH CREAMY ONION SAUCE',
        'name_vi': 'Khoai tây chiên sốt kem hành tây',
        'price': 70000, # Aligned with Canva (was 85000)
        'image': 'assets/canva/5dc4519f512c639864a5c59fcd450574.jpg',
        'description_vi': 'Khoai tây chiên giòn phủ sốt kem chua hành tây thơm béo mịn màng đặc trưng.',
        'badge': 'New'
    },
    'b08': {
        'name': 'POPCORN CHICKEN CHEESE',
        'name_vi': 'Gà viên sốt cay phủ phô mai',
        'price': 95000,
        'description_vi': 'Gà chiên giòn rụm áo sốt cay ngọt Hàn Quốc phủ ngập phô mai kéo sợi thơm phức.',
        'badge': 'M/L Options',
        'variants': [
            {'id': 'v_m', 'name': 'Size M', 'price': 95000, 'is_default': True},
            {'id': 'v_l', 'name': 'Size L', 'price': 125000, 'is_default': False}
        ],
        'toppings': [
            {'id': 'top_cheese', 'name': 'Thêm phô mai kéo sợi', 'price': 30000}
        ]
    }
}

for k, val in bites_updates.items():
    if k in existing_map:
        existing_map[k].update(val)
    else:
        val['id'] = k
        val['category'] = 'bites'
        val['station'] = 'kitchen'
        val['is_available'] = True
        existing_map[k] = val
        menu['items'].append(val)

# 2. Week items (w01 to w10), ensure w07 is SOLD OUT (is_available = False)
if 'w07' in existing_map:
    existing_map['w07']['is_available'] = False
    existing_map['w07']['badge'] = 'SOLD OUT'

# 3. Add aliases / ensure beer items (be01 - be06) and (br01 - br06) are both present or aliased
# Canva beer items:
beer_items = [
    {
        'id': 'be01',
        'name': 'SUNNY PINT (PILSNER)',
        'name_vi': 'Bia Sunny Pint rót vòi',
        'category': 'beer',
        'station': 'bar',
        'price': 65000,
        'badge': 'ABV 5.2%',
        'description_vi': 'Hoppy Pilsner thơm lừng hoa bia tươi, hậu vị đắng giòn thanh mát sảng khoái.',
        'description_en': 'Hoppy Pilsner with crisp bitterness and refreshing hop aroma.',
        'is_available': True
    },
    {
        'id': 'be02',
        'name': 'CRISPY BOI (PILSNER)',
        'name_vi': 'Bia Crispy Boi rót vòi',
        'category': 'beer',
        'station': 'bar',
        'price': 65000,
        'badge': 'Classic',
        'description_vi': 'Pilsner truyền thống, vị mạch nha cân bằng giòn tan rất dễ uống.',
        'description_en': 'Clean, crisp and classic pilsner for easy drinking.',
        'is_available': True
    },
    {
        'id': 'be03',
        'name': 'APPLE CIDER',
        'name_vi': 'Apple Cider táo lên men',
        'category': 'beer',
        'station': 'bar',
        'price': 75000,
        'badge': '330ml',
        'description_vi': 'Nước táo lên men tự nhiên giòn ngọt, sủi tăm tươi mát dễ uống.',
        'description_en': 'Crisp and refreshing naturally fermented apple cider.',
        'is_available': True
    },
    {
        'id': 'be04',
        'name': 'KISO - TEPACHE (DỨA)',
        'name_vi': 'Nước dứa lên men Tepache',
        'category': 'beer',
        'station': 'bar',
        'price': 65000,
        'badge': 'Mexico Recipe',
        'description_vi': 'Ủ từ vỏ dứa chín, đường thốt nốt và quế theo công thức Mexico. Chua thanh sủi bọt cực đã.',
        'description_en': 'Fermented pineapple drink with raw cane sugar and aromatic cinnamon.',
        'is_available': True
    },
    {
        'id': 'be05',
        'name': 'HOEGAARDEN WITBIER',
        'name_vi': 'Bia Hoegaarden Witbier',
        'category': 'beer',
        'station': 'bar',
        'price': 45000,
        'badge': '250ml',
        'image': 'assets/canva/ea093b2144fcd44344cfc2c4f1b8f149.png',
        'description_vi': 'Bia lúa mì Bỉ nồng nàn vị vỏ cam curacao và hạt ngò rí thơm dịu.',
        'description_en': 'Authentic Belgian white wheat beer with orange peel and coriander.',
        'is_available': True
    },
    {
        'id': 'be06',
        'name': 'CORONA EXTRA',
        'name_vi': 'Bia Corona Extra',
        'category': 'beer',
        'station': 'bar',
        'price': 85000,
        'badge': '355ml',
        'image': 'assets/canva/32ce3196c738a55c6e125673a1c9709f.png',
        'description_vi': 'Bia Mexico kinh điển uống cùng lát chanh tươi mát lạnh sảng khoái.',
        'description_en': 'Iconic Mexican lager served ice-cold with fresh lime.',
        'is_available': True
    }
]

for b in beer_items:
    if b['id'] in existing_map:
        existing_map[b['id']].update(b)
    else:
        existing_map[b['id']] = b
        menu['items'].append(b)

# 4. Wine & Shots: w_merlot, s01, s02
wine_shot_items = [
    {
        'id': 'w_merlot',
        'name': 'CHATEAU DALAT MERLOT',
        'name_vi': 'Vang đỏ Chateau Dalat Merlot',
        'category': 'wine_shot',
        'station': 'bar',
        'price': 85000,
        'badge': '150ml Glass',
        'image': 'assets/canva/b39e83bcd3e781d72ac36b3fee710acb.png',
        'description_vi': 'Vang đỏ Đà Lạt êm dịu, hương dâu tằm chín và gỗ sồi phảng phất.',
        'description_en': 'Smooth Dalat red wine by the glass, notes of ripe berries and oak.',
        'is_available': True
    },
    {
        'id': 's01',
        'name': 'BLACK LABEL WHISKY',
        'name_vi': 'Shot Black Label Whisky',
        'category': 'wine_shot',
        'station': 'bar',
        'price': 120000,
        'badge': '40ml Shot',
        'image': 'assets/canva/8ccdcdb3a2f18990e491a76889d7f24d.png',
        'description_vi': 'Blended Scotch Whisky đậm vị khói than bùn, gia vị ấm và vani phong phú.',
        'description_en': '40ml shot of iconic blended Scotch whisky with rich smokiness.',
        'is_available': True
    },
    {
        'id': 's02',
        'name': 'TANQUERAY NO. 10',
        'name_vi': 'Shot Tanqueray No. 10',
        'category': 'wine_shot',
        'station': 'bar',
        'price': 120000,
        'badge': '40ml Shot',
        'description_vi': 'London Dry Gin chưng cất cùng cam chanh bưởi tươi thanh mát, hậu vị mượt mà.',
        'description_en': '40ml shot of premium London Dry Gin with fresh whole citrus.',
        'is_available': True
    }
]

for ws in wine_shot_items:
    if ws['id'] in existing_map:
        existing_map[ws['id']].update(ws)
    else:
        existing_map[ws['id']] = ws
        menu['items'].append(ws)

# Save updated menu.json
with open('data/menu.json', 'w', encoding='utf-8') as f:
    json.dump(menu, f, indent=2, ensure_ascii=False)

print(f"Successfully synchronized menu.json! Total items now: {len(menu['items'])}")
