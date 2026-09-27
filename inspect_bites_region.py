import re
import json

with open(r'C:\Users\THIETKE\.gemini\antigravity\brain\a869ff89-1562-4246-8135-c7401426ddea\.system_generated\steps\8\content.md', 'r', encoding='utf-8') as f:
    raw = f.read()

# Let's find any occurrence of .png, .jpg in bites region
bites_pos = raw.find('Crispy Fried Macaroni and Cheese')
print('Crispy Fried at:', bites_pos)
wonton_pos = raw.find('fried wonton chips')
print('Wonton at:', wonton_pos)

# Extract 50,000 characters around this region
sub = raw[bites_pos-10000:wonton_pos+30000]

# Find any image files or media IDs
img_files = re.findall(r'([A-Za-z0-9_\-]+\.(?:png|jpg|jpeg|svg))', sub)
print(f"Image files in bites region ({len(img_files)}):", set(img_files))

# Find any "MA..."
mas = re.findall(r'(MA[A-Za-z0-9_\-]{8,})', sub)
print(f"MAs in bites region ({len(mas)}):", set(mas))

with open('assets/canva_id_map.json', 'r', encoding='utf-8') as f:
    id_map = json.load(f)

for m in set(mas):
    print(f"  {m} -> {id_map.get(m, 'unknown')}")
