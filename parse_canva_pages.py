import re
import json

with open(r'C:\Users\THIETKE\.gemini\antigravity\brain\a869ff89-1562-4246-8135-c7401426ddea\.system_generated\steps\8\content.md', encoding='utf-8') as f:
    text = f.read()

with open(r'D:\paca\assets\canva_id_map.json', encoding='utf-8') as f:
    id_map = json.load(f)

# Find all pages in canva: "PB..."
pages = re.split(r'\{\"A\?\":\"i\",\"a\":\"(PB[A-Za-z0-9]+)\"', text)
print(f"Number of split page sections: {len(pages)}")

page_details = []
for i in range(1, len(pages), 2):
    page_id = pages[i]
    page_content = pages[i+1] if i+1 < len(pages) else ""
    
    # find all texts in this page
    texts = re.findall(r'\"A\":\[\"([^\"]+)\"\]', page_content)
    # clean texts
    clean_texts = [t.encode('utf-8').decode('unicode_escape', 'ignore').strip() for t in texts if len(t.strip()) > 1]
    
    # find all images in this page
    media_ids = re.findall(r'\"A\":\"(MA[A-Za-z0-9_\-]+)\"', page_content)
    images = [id_map.get(m, '') for m in media_ids if id_map.get(m, '')]
    
    page_details.append({
        'page_id': page_id,
        'title_sample': clean_texts[:3],
        'images': list(set(images))
    })

print(json.dumps(page_details, ensure_ascii=False, indent=2))
