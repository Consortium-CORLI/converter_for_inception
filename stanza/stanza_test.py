import stanza
import os
import re
import time
import json
import zipfile
# import platform

path_to_data_files = r'./source'
lang = 'fr'
limit_n_char = 100
out_zip_path = 'inception_project_stanza.zip'

"""
# TO BE UNCOMMENTED ONCE IN PRODUCTION
print(f'Checking Stanza resources for "{lang}"...')
stanza_resources_path = '~/stanza_resources'
ld = os.listdir(stanza_resources_path)
if lang not in ld:
    print(f'"{lang}" resources not found, downloading them...')
    stanza.download(lang)
    print(f'Downloaded resources for "{lang}"')
else:
    print(f'Resources for "{lang}" found in {stanza_resources_path}/{lang}')
del(stanza_resources_path)
del(ld)
"""

nlp = stanza.Pipeline(lang)

sofa_pattern = '<cas:Sofa[^<>]*sofaString="([^"]*)"/>'
sofa_regex = re.compile(sofa_pattern)

sofa_pattern_for_implementation = '(<cas:Sofa[^\\n]*/>)'
sofa_regex_for_implementation = re.compile(sofa_pattern_for_implementation)

cas_view_members_pattern = '(<cas:View[^<>]*members=")([^"]*)("/>)'
cas_view_members_regex = re.compile(cas_view_members_pattern)

xml_special_chars_pattern_list = [
    ['&#10;','\n'],
    ['&quot;','"'],
    ['&apos;','\''],
    ['&lt;','<'],
    ['&gt;','>'],
    ['&amp;','&']
]
# xml_special_chars_regex_list = []
# for i in xml_special_chars_pattern_list:
#     xml_special_chars_regex_list.append(re.compile(i[0]))

xmi_id_pattern = '<[^ ]+ xmi:id="([0-9]+)"'
xmi_id_regex = re.compile(xmi_id_pattern)

ld = os.listdir(path_to_data_files)
for i in ld:
    if i.endswith('.xml'):
        # print(i,end='\r')
        print(f'Processing {i}',end=' ')
        p = f'{path_to_data_files}/{i}'
        f = open(p,'rt',encoding='utf-8')
        d = f.read()
        f.close()
        sofa = sofa_regex.findall(d)[0]
        # for j in xml_special_chars_regex_list:
        #     j.
        for j in xml_special_chars_pattern_list:
            sofa = sofa.replace(j[0],j[1])
        # print(sofa[:limit_n_char])
        # print(f'Total number of spaces: {sofa.count(" ")}')
        t = time.time()
        stanza_parsed_data = nlp(sofa[:limit_n_char])
        print(f'{time.time()-t}s',end='\r')
        # print(stanza_parsed_data.entities[:5])

        xmi_id_list = xmi_id_regex.findall(d)
        xmi_id_list = [int(j) for j in xmi_id_list]
        xmi_id_max = max(xmi_id_list)
        xmi_id_current = xmi_id_max + 1

        cas_view_group = ''

        quote = '"'
        escaped_quote = '\\"'

        stanza_parsed_data = stanza_parsed_data.to_dict() # ACTUALLY, GENERATES A LIST
        s_group = ''
        for j in stanza_parsed_data:
            for k in j:
                if ("start_char" not in k.keys()) or ("end_char" not in k.keys()):
                    continue
                s = f'<custom:stanza_tag xmi:id="{xmi_id_current}" begin="{k["start_char"]}" end="{k["end_char"]}" sofa="1"'
                for m in k.keys():
                    # s = f'{s} {str(m)}="{str(k[m]).replace("\"","\\\"")}"'
                    s = f'{s} {str(m)}="{str(k[m]).replace(quote,escaped_quote)}"'
                s = f'{s}/>'
                s_group = f'{s_group}\n  {s}'
                cas_view_group = f'{cas_view_group} {xmi_id_current}'
                # print(f'Generated tag: {s}')
                # print(sofa[k["start_char"]:k["end_char"]])
                xmi_id_current += 1
        

        new_d = sofa_regex_for_implementation.sub(f'{s_group}\n  \\1',d)
        new_d = cas_view_members_regex.sub(f'\\1\\2{cas_view_group}\\3',new_d)
        # print(new_d)
        # out_f = open(f'{path_to_data_files}/__{i}','wt',encoding='utf-8')
        out_f = open(f'{path_to_data_files}/{i}','wt',encoding='utf-8')
        out_f.write(new_d)
        out_f.close()
        # print(f'Wrote file __{i}')
        print(f'Wrote file {i}')

json_path = 'exportedproject.json'
if os.path.exists(json_path):
    f = open(json_path,'rt',encoding='utf-8')
    d = f.read()
    f.close()
    d = json.loads(d)
    # ...
    obj = {
        "name": "Stanza tags",
        "description": "Annotations generated with Stanza, an NLP tool",
        "language": "mul",
        "tags": [
            {
                "tag_name": "stanza_tag",
                "tag_description": "stanza_tag"
            }
        ],
        "create_tag": False
    }
    d["tag_sets"].append(obj)

    obj = {
        "name": "webanno.custom.stanza_tag",
        # "features": [],
        "features": [{
            "name": i,
            "tag_set": None,
            "uiName": i,
            "type": "uima.cas.String",
            "enabled": True,
            "visible": True,
            "include_in_hover": False,
            "required": False,
            "remember": False,
            "hideUnconstraintFeature": False,
            "description": i,
            "project_name": d["name"],
            "multi_value_mode": "NONE",
            "link_mode": "NONE",
            "link_type_name": None,
            "link_type_role_feature_name": None,
            "link_type_target_feature_name": None,
            "traits": None,
            "curatable": True
        } for i in [
            "text",
            "lemma",
            "upos",
            "xpos",
            "feats",
            "head",
            "deprel",
            "start_char",
            "end_char",
            "ner",
            "multi_ner"
        ]
        ],
        "uiName": "stanza_tag",
        "type": "span",
        "description": None,
        "enabled": True,
        "built_in": False,
        "readonly": False,
        "attach_type": None,
        "attach_feature": None,
        "allow_stacking": True,
        "cross_sentence": True,
        "show_hover": True,
        "anchoring_mode": "CHARACTERS",
        "overlap_mode": "ANY_OVERLAP",
        "validation_mode": "ALWAYS",
        "lock_to_token_offset": False,
        "multiple_tokens": True,
        "project_name": d["name"],
        "linked_list_behavior": False,
        "on_click_javascript_action": None,
        "traits": None
    }
    d["layers"].append(obj)

    f = open(json_path,'wt',encoding='utf-8')
    f.write(json.dumps(d))
    f.close()
    print(f'Wrote updated {json_path}')

    print(f'Creating {out_zip_path}...')
    with zipfile.ZipFile(out_zip_path,'w') as local_zip:
        print(f'Adding to ZIP: {json_path}')
        local_zip.write(json_path)
        ld = os.listdir('source')
        for i in ld:
            if not i.endswith('.xml'):
                continue
            print(f'Adding to ZIP: source/{i}',end='\r')
            local_zip.write(f'source/{i}')
    print(f'Created {out_zip_path}')
else:
    print(f'[ERROR] {json_path} does not exist.')