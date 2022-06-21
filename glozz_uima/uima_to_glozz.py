import os
import re
import time

path = ''

######################################################

xml_tag_pattern = '^<\\?xml[^\\?]*\\?>'
xml_tag_regex = re.compile(xml_tag_pattern)

# uima_annotation_pattern = '(<([^:]+):([^\\s/<>]+)[^<>]*>)'
uima_annotation_pattern = '(<([^:\\?]+):([^\\s/<>]+)[^<>]*>)'
uima_annotation_regex = re.compile(uima_annotation_pattern)

uima_sofa_pattern = '<cas:Sofa[^<>]*sofaString="([^"]*)"[^<>]>'
uima_sofa_regex = re.compile(uima_sofa_pattern)


xml_attribute_pattern = '\\s([^=]+)="([^"]*)"'
xml_attribute_regex = re.compile(xml_attribute_pattern)

ld = os.listdir(path)
for i in ld:
    if not i.endswith('.xml'):
        continue
    lp = f'{path}/{i}'
    if not os.path.isfile(lp):
        continue
    
    f = open(lp,'rt',encoding='utf-8')
    d = f.read()
    f.close()

    depth = 0
    tab = '\t'

    quote = '"'

    s_out = f'{xml_tag_regex.findall(d)[0]}\n{tab*depth}<annotations>'

    aam_s_out = '<?xml version="1.0" encoding="UTF-8"?>\n<annotationModel>'

    aam_units = f'{tab*1}<units>'
    aam_relations = f'{tab*1}<relations>'
    aam_schemas = f'{tab*1}<schemas>'

    aam_units_list = []
    aam_relations_list = []
    aam_schemas_list = []

    # depth += 1


    uima_tags_list = uima_annotation_regex.findall(d)

    for j in uima_tags_list:
        # if j[1].lower() == 'cas' or (j[1].lower() == 'xmi' and j[2].lower() == 'xmi'):
        if j[1].lower() == 'cas' or (j[1].lower() == 'xmi' or j[2].lower() == 'xmi'):
        # if j[1].lower() == 'cas' or j[1].lower() == 'xmi':
            continue
        # print(depth)

        adding_to_aam = False

        depth += 1
        attributes_list = xml_attribute_regex.findall(j[0])
        s_out = f'{s_out}\n{tab*depth}<unit'
        for k in attributes_list:
            # if k[0].lower() == 'id':
            if k[0].lower() in ['xmi:id','id']:
                s_out = f'{s_out} id="{k[1]}"'
                # if k[1] not in aam_units_list:
                #     aam_units = f'{aam_units}\n<type name="{k[1]}" groups="Syntaxe">'
                #     aam_units_list.append(k[1])
                #     adding_to_aam = True
                break
        s_out = f'{s_out}>'

        depth += 1

        s_out = f'{s_out}\n{tab*depth}<metadata'

        # metadata_has_content = False
        s_author = ''
        s_creation_date = ''
        for k in attributes_list:
            if k[0].lower() == 'author':
                depth += 1
                s_author = f'{tab*depth}<author>{k[1]}</author>'
                depth -= 1
            elif k[0].lower() == 'creation_date':
                depth += 1
                s_creation_date = f'{tab*depth}<creation-date>{k[1]}</creation-date>'
                depth -= 1
        
        if len(s_author) == 0:
            depth += 1
            s_author = f'{tab*depth}<author>anonymous_from_converter</author>'
            depth -= 1
        if len(s_creation_date) == 0:
            depth += 1
            s_creation_date = f'{tab*depth}<creation-date>{str(int(time.time() * 1000))}</creation-date>'
            depth -= 1
        
        has_author = (len(s_author) > 0)
        has_creation_date = (len(s_creation_date) > 0)
        if has_author or has_creation_date:
            s_out = f'{s_out}>'
            if has_author:
                s_out = f'{s_out}\n{s_author}'
            if has_creation_date:
                s_out = f'{s_out}\n{s_creation_date}'
            # if not has_author:
            #     s_author = 'anonymous_from_converter'
            # s_out = f'{s_out}\n{s_author}'
            # if not has_creation_date:
            #     s_creation_date = str(int(time.time() * 1000))
            #     s_out = f'{s_out}\n{s_creation_date}'

            # depth -= 1
            s_out = f'{s_out}\n{tab*depth}</metadata>'
            depth -= 1
        else:
            s_out = f'{s_out}/>'
            depth -= 1
        

        
        
        


        depth += 1

        s_out = f'{s_out}\n{tab*depth}<characterisation>'

        depth += 1

        s_out = f'{s_out}\n{tab*depth}<type>{j[2]}</type>'

        if j[2] not in aam_units_list:
            aam_units = f'{aam_units}\n{tab*2}<type name="{j[2]}" groups="Syntaxe">'
            aam_units_list.append(j[2])
            adding_to_aam = True

        depth -= 1

        depth += 1

        s_out = f'{s_out}\n{tab*depth}<featureSet>'

        if adding_to_aam:
            aam_units = f'{aam_units}\n{tab*3}<featureSet>'

        depth += 1
        for k in attributes_list:
            if k[0].lower() in ['id','author','creation_date','begin','end'] or k[0].lower().startswith('xmi:'):
                continue
            s_out = f'{s_out}\n{tab*depth}<feature name="{k[0]}">{k[1]}</feature>'
            
            if adding_to_aam:
                aam_units = f'{aam_units}\n{tab*4}<feature name="{k[0]}">\n{tab*5}<value type="free" default="{k[1].replace(quote,"&quot;")}"/>\n{tab*4}</feature>'

        depth -= 1
        s_out = f'{s_out}\n{tab*depth}</featureSet>'

        if adding_to_aam:
            aam_units = f'{aam_units}\n{tab*3}</featureSet>'
            aam_units = f'{aam_units}\n{tab*2}</type>'

        depth -= 1

        s_out = f'{s_out}\n{tab*depth}</characterisation>'

        depth -= 1

        depth += 1

        s_out = f'{s_out}\n{tab*depth}<positioning>'

        depth += 1
        s_out = f'{s_out}\n{tab*depth}<start>'

        depth += 1
        for k in attributes_list:
            if k[0].lower() == 'begin':
                s_out = f'{s_out}\n{tab*depth}<singlePosition index="{k[1]}"/>'
                break

        depth -= 1
        s_out = f'{s_out}\n{tab*depth}</start>'

        depth -= 1

        depth += 1
        s_out = f'{s_out}\n{tab*depth}<end>'

        depth += 1
        for k in attributes_list:
            if k[0].lower() == 'end':
                s_out = f'{s_out}\n{tab*depth}<singlePosition index="{k[1]}"/>'
                break

        depth -= 1
        s_out = f'{s_out}\n{tab*depth}</end>'

        depth -= 1
        s_out = f'{s_out}\n{tab*depth}</positioning>'

        depth -= 1

        s_out = f'{s_out}\n{tab*depth}</unit>'

        depth -= 1
    










    s_out = f'{s_out}\n{tab*depth}</annotations>'

    # print(s_out)

    
    path_out = f'{path}/__{i[:-4]}.aa'
    f = open(path_out,'wt',encoding='utf-8')
    f.write(s_out)
    f.close()
    print(f'Wrote {path_out}')

    path_out = f'{path}/__{i[:-4]}.ac'
    f = open(path_out,'wt',encoding='utf-8')
    # f.write(uima_sofa_regex.findall(d)[0].replace("&#10;","\n"))
    f.write(uima_sofa_regex.findall(d)[0].replace("&#10;"," "))
    f.close()
    print(f'Wrote {path_out}')

    aam_units = f'{aam_units}\n{tab*1}</units>'
    aam_relations = f'{aam_relations}\n{tab*1}</relations>'
    aam_schemas = f'{aam_schemas}\n{tab*1}</schemas>'
    aam_s_out = f'{aam_s_out}\n{aam_units}\n{aam_relations}\n{aam_schemas}\n</annotationModel>'
    path_out = f'{path}/__{i[:-4]}.aam'
    f = open(path_out,'wt',encoding='utf-8')
    f.write(aam_s_out)
    f.close()
    print(f'Wrote {path_out}')
    