import re
src = open('v1_script.js', encoding='utf-8').read()
pat = re.compile(r'(\w+)\s*=\s*new\s+Array\((.*?)\);', re.DOTALL)
qpat = re.compile(r'"((?:[^"\\\\]|\\\\.)*)"')
for m in pat.finditer(src):
    name = m.group(1); body = m.group(2)
    items = qpat.findall(body)
    print(f"{name}: {len(items)} items  sample={items[:3]}")
