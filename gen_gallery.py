import os
import json

html = ['<!DOCTYPE html><html><head><meta charset="utf-8"><title>Canva Assets Gallery</title>',
        '<style>body{font-family:sans-serif;background:#222;color:#fff;display:flex;flex-wrap:wrap;gap:15px;padding:20px;}',
        '.card{background:#333;padding:10px;border-radius:8px;width:180px;text-align:center;}',
        'img{width:160px;height:160px;object-fit:contain;background:#444;border-radius:4px;}',
        '.name{font-size:11px;margin-top:6px;word-break:break-all;color:#ddd;}',
        '</style></head><body>']

files = sorted(os.listdir('assets/canva'))
for f in files:
    if f.lower().endswith(('.png', '.jpg', '.jpeg', '.svg')):
        html.append(f'<div class="card"><img src="assets/canva/{f}"><div class="name">{f}</div></div>')

html.append('</body></html>')

with open('assets_gallery.html', 'w', encoding='utf-8') as out:
    out.write('\n'.join(html))

print(f"Generated assets_gallery.html with {len(files)} files.")
