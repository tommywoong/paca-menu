import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

step_file = r'C:\Users\THIETKE\.gemini\antigravity\brain\a869ff89-1562-4246-8135-c7401426ddea\.system_generated\steps\8\content.md'
with open(step_file, 'r', encoding='utf-8') as f:
    raw = f.read()

# Look for image extensions
img_matches = set(re.findall(r'([A-Za-z0-9_\-]+\.(?:png|jpg|jpeg|svg))', raw))
print(f"Total image filenames mentioned: {len(img_matches)}")
for img in sorted(list(img_matches))[:25]:
    # find context of where this image is mentioned
    idx = raw.find(img)
    ctx = raw[max(0, idx-100):min(len(raw), idx+150)].replace('\n', ' ')
    print(f"\n{img}:")
    print(f"  {ctx}")
