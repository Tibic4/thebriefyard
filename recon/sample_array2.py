import re
src = open('v1_script.js', encoding='utf-8').read()
m = re.search(r'array2\s*=\s*new\s+Array\((.*?)\);', src, re.DOTALL)
body = m.group(1)
items = re.findall(r'"((?:[^"\\\\]|\\\\.)*)"', body)
print("array2 length:", len(items))
print("first 15:", items[:15])
print("random samples:", items[100], items[500], items[1000], items[2000], items[3000], items[4500])
# array1
m = re.search(r'array1\s*=\s*new\s+Array\((.*?)\);', src, re.DOTALL)
items1 = re.findall(r'"((?:[^"\\\\]|\\\\.)*)"', m.group(1))
print("array1 non-empty:", [x for x in items1 if x.strip()])
# array3
m = re.search(r'array3\s*=\s*new\s+Array\((.*?)\);', src, re.DOTALL)
items3 = re.findall(r'"((?:[^"\\\\]|\\\\.)*)"', m.group(1))
print("array3 non-empty:", [x for x in items3 if x.strip()])
