import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

step_file = r'C:\Users\THIETKE\.gemini\antigravity\brain\a869ff89-1562-4246-8135-c7401426ddea\.system_generated\steps\8\content.md'
with open(step_file, 'r', encoding='utf-8') as f:
    raw = f.read()

# Canva page objects have: "page_..." or look for "pages" or "rows" or "document"
# Let's search for "PACADesign" or "pages" or examine how pages are organized
page_matches = re.finditer(r'\"id\":\"(page_[A-Za-z0-9_\-]+|PA[A-Za-z0-9_\-]+)\"', raw)
found_pages = []
for pm in page_matches:
    found_pages.append((pm.group(1), pm.start()))

print(f"Found {len(found_pages)} page markers:")
for p, pos in found_pages:
    print(f"  {p} at {pos}")

# Also look for images/media in raw
media_matches = re.findall(r'\"A\":\"(MA[A-Za-z0-9_\-]+)\"[^}]*?\"url\":\"([^\"]+)\"', raw)
print(f"\nFound {len(media_matches)} media url mappings:")
for mid, url in media_matches[:15]:
    print(f"  {mid} -> {url[:60]}")
