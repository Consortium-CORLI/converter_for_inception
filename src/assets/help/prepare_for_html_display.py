import os
import re

# attribute_pattern = '(<[^<>]+)([^\\s]+)="([^"]*)"([^<>]>)'
attribute_pattern = '([^\\s]+)="([^"]*)"'
attribute_regex = re.compile(attribute_pattern)

lt_pattern = '<([/\\?])?([^<>\\s]+)'
lt_regex = re.compile(lt_pattern)

gt_pattern = '>'
gt_regex = re.compile(gt_pattern)

tag_pattern = '<([/\\?])?([^<>\\s]+)([^<>]*)>'
tag_regex = re.compile(tag_pattern)

path = '.'

ld = os.listdir(path)
for i in ld:
    lp = f'{path}/{i}'
    if not i.endswith('.xml'):
        continue
    f = open(lp,'rt',encoding='utf-8')
    d = f.read()
    f.close()
    
    # d = attribute_regex.sub('<span style="color:#aaccff;">\\1</span>=&quot;<span style="color:#aaffcc;">\\2</span>&quot;',d)
    # d = lt_regex.sub('&lt;\\1<span style="color:#ffaacc;">\\2</span>',d)
    # d = gt_regex.sub('&gt;',d)
    d = tag_regex.sub('&lt;\\1<span style="color:#aa6688;"><b>\\2</b></span>\\3&gt;',d)
    # d = attribute_regex.sub('\\1<span style="color:#aaccff;">\\2</span>')

    out_path = f'{path}/__{i}'
    f = open(out_path,'wt',encoding='utf-8')
    f.write(d)
    f.close()
    print(f'Wrote {out_path}')