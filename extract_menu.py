import json
import re

source_file = r'C:\Users\THIETKE\.gemini\antigravity\brain\a869ff89-1562-4246-8135-c7401426ddea\.system_generated\steps\8\content.md'
with open(source_file, 'r', encoding='utf-8') as f:
    content = f.read()

# find all occurrences of "A":[ ... ]
matches = re.findall(r'\"A\":\[(\"[^\]]+\")\]', content)
texts = []
for m in matches:
    try:
        arr = json.loads(f"[{m}]")
        for item in arr:
            s = item.strip()
            if s and s not in texts and len(s) > 1:
                texts.append(s)
    except:
        pass

output_file = r'D:\paca\canva_texts.txt'
with open(output_file, 'w', encoding='utf-8') as out:
    for t in texts:
        out.write(t.replace('\\n', ' ') + '\n')

print(f"Extracted {len(texts)} unique text snippets to {output_file}")
