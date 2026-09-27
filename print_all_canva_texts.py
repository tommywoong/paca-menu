import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('canva_texts.txt', 'r', encoding='utf-8') as f:
    lines = [line.strip() for line in f if line.strip()]

print(f"Total non-empty lines: {len(lines)}")
# Print with line numbers
for i, l in enumerate(lines):
    print(f"{i:3d}: {l}")
