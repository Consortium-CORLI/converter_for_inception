import os
import re
import time

path = 'source'
allow_dependencies = True

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

xml_special_chars = [
    ['&amp;','&'],
    ['&gt;','>'],
    ['&lt;','<'],
    ['&quot;','"'],
    ['&apos;','\'']#,
    # ['&amp;','&']
]

tab = '\t'

quote = '"'

linefeed = '\n'

unix_time = int(time.time() * 1000)

aam_s_out = '<?xml version="1.0" encoding="UTF-8"?>\n<annotationModel>'

aam_units = f'{tab*1}<units>'
aam_relations = f'{tab*1}<relations>'
aam_schemas = f'{tab*1}<schemas>'

aam_units_list = []
aam_relations_list = []
aam_schemas_list = []

if not os.path.exists('TEI') or os.path.isfile('TEI'):
    os.mkdir('TEI')

ld = os.listdir(path)
progress = 0
len_ld = len(ld)
for i in ld:
    progress += 1
    if not i.endswith('.xml'):
        continue
    lp = f'{path}/{i}'
    if not os.path.isfile(lp):
        continue
    
    
    f = open(lp,'rt',encoding='utf-8')
    d = f.read()
    f.close()

    depth = 0

    s_out = f'{xml_tag_regex.findall(d)[0]}\n{tab*depth}<annotations>'

    """
    aam_s_out = '<?xml version="1.0" encoding="UTF-8"?>\n<annotationModel>'

    aam_units = f'{tab*1}<units>'
    aam_relations = f'{tab*1}<relations>'
    aam_schemas = f'{tab*1}<schemas>'

    aam_units_list = []
    aam_relations_list = []
    aam_schemas_list = []
    """

    # depth += 1

    id_conversion_memory = []

    uima_tags_list = uima_annotation_regex.findall(d)


    sofa = uima_sofa_regex.findall(d)[0].replace("&#10;","\n") #CHANGED FROM SPACE TO LINEFEED FOR REPLACEMENT
    for j in xml_special_chars:
        sofa = sofa.replace(j[0],j[1])
    
    # print(lp,'; sofa after special chars removal :',sofa)

    #<TEI_SPECIAL>
    tokens_list = []
    for j in uima_tags_list:
        if j[2].lower() == 'token':
            local_attributes = xml_attribute_regex.findall(j[0])
            begin = None
            for k in local_attributes:
                if k[0] == 'begin':
                    begin = int(k[1])
                    break
            if begin == None:
                continue
            end = None
            for k in local_attributes:
                if k[0] == 'end':
                    end = int(k[1])
                    break
            if end == None:
                continue
            xmi_id = None
            for k in local_attributes:
                # if k[0] == 'xmi:id' or k[0] == 'xml:id':
                if k[0] in ['xmi:id','xml:id','xmi_id','xml_id']:
                    xmi_id = int(k[1])
                    break
            if xmi_id == None:
                continue
            
            lemma = None
            
            pos = None
            
            morph = None
            for k in local_attributes:
                if k[0] == 'lemma':
                    lemma = int(k[1])
                elif k[0] == 'pos':
                    pos = int(k[1])
                elif k[0] == 'morph':
                    morph = int(k[1])

            local_form = sofa[begin:end]
            # for k in xml_special_chars:
            #     local_form = local_form.replace(k[1],k[0])

            local_form = local_form.replace('&','&amp;')
            
            tokens_list.append({
                "regex_result": j,
                "xmi_id": xmi_id,
                "begin": begin,
                "end": end,
                "lemma": lemma,
                "pos": pos,
                "morph": morph,
                # "out_str": f'<w id="w_{i[:-4]}_{len(tokens_list)+1}">\n\t<txm:form>{sofa[begin:end]}</txm:form>'
                # "out_str": f'<w id="w_{i[:-4]}_{len(tokens_list)+1}">\n\t<txm:form>{local_form}</txm:form>'
                # "out_str": f'\n<w id="w_{i[:-4]}_{len(tokens_list)+1}">\n\t<txm:form>{local_form}</txm:form>\n\t<txm:ana resp="none" type="#xmi:id">{str(xmi_id)}</txm:ana>\n\t<txm:ana resp="none" type="#begin">{str(begin)}</txm:ana>\n\t<txm:ana resp="none" type="#end">{str(end)}</txm:ana>{(linefeed+tab+"<txm:ana resp="+quote+"none"+quote+" type="+quote+"#lemma"+quote+">"+str(lemma)+"</txm:ana>") if lemma != None else ""}{(linefeed+tab+"<txm:ana resp="+quote+"none"+quote+" type="+quote+"#pos"+quote+">"+str(pos)+"</txm:ana>") if pos != None else ""}{(linefeed+tab+"<txm:ana resp="+quote+"none"+quote+" type="+quote+"#morph"+quote+">"+str(morph)+"</txm:ana>") if morph != None else ""}'
                # "out_str": f'\n<w id="w_{i[:-4]}_{len(tokens_list)+1}">\n\t<txm:form>{local_form}</txm:form>\n\t<txm:ana resp="none" type="#xmi:id">{str(xmi_id)}</txm:ana>\n\t<txm:ana resp="none" type="#begin">{str(begin)}</txm:ana>\n\t<txm:ana resp="none" type="#end">{str(end)}</txm:ana>{(linefeed+tab+"<txm:ana resp="+quote+"none"+quote+" type="+quote+"#idlemma"+quote+">"+str(lemma)+"</txm:ana>") if lemma != None else ""}{(linefeed+tab+"<txm:ana resp="+quote+"none"+quote+" type="+quote+"#idpos"+quote+">"+str(pos)+"</txm:ana>") if pos != None else ""}{(linefeed+tab+"<txm:ana resp="+quote+"none"+quote+" type="+quote+"#idmorph"+quote+">"+str(morph)+"</txm:ana>") if morph != None else ""}'
                # "out_str": f'\n<w id="w_{i[:-4]}_{len(tokens_list)+1}">\n\t<txm:form>{local_form}</txm:form>\n\t<txm:ana resp="none" type="#xmi:id">{str(xmi_id)}</txm:ana>\n\t<txm:ana resp="none" type="#begin">{str(begin)}</txm:ana>\n\t<txm:ana resp="none" type="#end">{str(end)}</txm:ana>'
                "out_str": f'\n<w id="w_{i[:-4]}_{len(tokens_list)+1}">\n\t<txm:form>{local_form}</txm:form>\n\t<txm:ana resp="none" type="#xmi_id">{str(xmi_id)}</txm:ana>\n\t<txm:ana resp="none" type="#begin">{str(begin)}</txm:ana>\n\t<txm:ana resp="none" type="#end">{str(end)}</txm:ana>{(linefeed+tab+"<txm:ana resp="+quote+"none"+quote+" type="+quote+"#lemma"+quote+">"+str(lemma)+"</txm:ana>") if lemma != None else ""}{(linefeed+tab+"<txm:ana resp="+quote+"none"+quote+" type="+quote+"#pos"+quote+">"+str(pos)+"</txm:ana>") if pos != None else ""}{(linefeed+tab+"<txm:ana resp="+quote+"none"+quote+" type="+quote+"#morph"+quote+">"+str(morph)+"</txm:ana>") if morph != None else ""}'
            })

    custom_list = []
    for j in uima_tags_list:
        if j[1].lower() == 'custom':
            local_attributes = xml_attribute_regex.findall(j[0])
            begin = None
            for k in local_attributes:
                if k[0] == 'begin':
                    begin = int(k[1])
                    break
            if begin == None:
                continue
            end = None
            for k in local_attributes:
                if k[0] == 'end':
                    end = int(k[1])
                    break
            if end == None:
                continue
            xmi_id = None
            for k in local_attributes:
                if k[0] == 'xmi:id':
                    xmi_id = int(k[1])
                    break
            if xmi_id == None:
                continue
            
            custom_list.append({
                "regex_result": j,
                "xmi_id": xmi_id,
                # "xmi:id": xmi_id,
                "begin": begin,
                "end": end,
                "local_attributes": [k for k in local_attributes if k not in ['xmi:id','sofa','begin','end']]
            })
    #</TEI_SPECIAL>

    for j in uima_tags_list:
        # if j[1].lower() == 'cas' or (j[1].lower() == 'xmi' and j[2].lower() == 'xmi'):
        # if j[1].lower() == 'cas' or (j[1].lower() == 'xmi' or j[2].lower() == 'xmi'):
        # if j[1].lower() == 'cas' or (j[1].lower() == 'xmi' or j[2].lower() == 'xmi' or j[2].lower() == 'token'):
        if j[1].lower() == 'cas' or (j[2].lower() == 'xmi' or j[2].lower() == 'token'):
        # if j[1].lower() == 'cas' or j[1].lower() == 'xmi':
            continue
        # print(depth)

        local_attributes = xml_attribute_regex.findall(j[0])
        begin = None
        for k in local_attributes:
            if k[0] == 'begin':
                begin = int(k[1])
                break
        if begin == None:
            continue
        end = None
        for k in local_attributes:
            if k[0] == 'end':
                end = int(k[1])
                break
        if end == None:
            continue

        stand_in = False
        for k in tokens_list:
            if k["begin"] == begin and k["end"] == end:
                """
                k["out_str"] = f'{k["out_str"]}\n\t<txm:ana resp="none" type="#{j[2]}">'
                if j[2].lower() == 'pos':
                    k["out_str"] = f'{k["out_str"]}{}'
                k["out_str"] = f'{k["out_str"]}</txm:ana>'
                """
                # k["out_str"] = f'{k["out_str"]}\n\t<txm:ana resp="none" type="#xmi:id">'
                for m in local_attributes:
                    # if m[0] in ['xmi:id','begin','end','sofa']:
                    #     continue
                    k["out_str"] = f'{k["out_str"]}\n\t<txm:ana resp="none" type="#{j[2]}_attr_{m[0].replace(":id","_id")}">'
                    k["out_str"] = f'{k["out_str"]}{m[1].replace("&","&amp;")}'
                    k["out_str"] = f'{k["out_str"]}</txm:ana>'
                stand_in = True
                break

        """
        if not stand_in:
            #<standOff> here if any
            # pass
            for k in custom_list:
                if k["begin"] <= begin and end <= k["end"]:
                    for m in k["local_attributes"]:
                        if m[0] in ['xmi:id','begin','end','sofa']:
                            continue
                        k["out_str"] = f'{k["out_str"]}\n\t<txm:ana resp="none" type="#{j[2]}_{m[0]}">'
                        k["out_str"] = f'{k["out_str"]}{m[1]}'
                        k["out_str"] = f'{k["out_str"]}</txm:ana>'
        """
    
    

    current_file_out_str = f'<?xml version="1.0" encoding="utf-8"?>\n<TEI xmlns="http://www.tei-c.org/ns/1.0" xmlns:txm="http://textometrie.org/1.0" xmlns:tei="http://www.tei-c.org/ns/1.0">\n\t<teiHeader></teiHeader>\n\t<text id="{i[:-4]}">'
    for j in tokens_list:
        #<TEST TAGS GREATER THAN TOKEN>
        for k in custom_list:
            if k["begin"] <= j["begin"] and j["end"] <= k["end"]:
                j["out_str"] = f'{j["out_str"]}\n\t<txm:ana resp="none" type="#{k["regex_result"][2]}_tag">true</txm:ana>'
                for m in k["local_attributes"]:
                    # if m[0] in ['xmi:id','begin','end','sofa']:
                    #     continue
                    j["out_str"] = f'{j["out_str"]}\n\t<txm:ana resp="none" type="#{k["regex_result"][2]}_attr_{m[0].replace(":id","_id")}">'
                    j["out_str"] = f'{j["out_str"]}{m[1].replace("&","&amp;")}'
                    j["out_str"] = f'{j["out_str"]}</txm:ana>'
        #</TEST TAGS GREATER THAN TOKEN>
        j["out_str"] = f'{j["out_str"]}\n</w>'
        current_file_out_str = f'{current_file_out_str}{j["out_str"]}'
    current_file_out_str = f'{current_file_out_str}\n\t</text>\n</TEI>'

    out_path = f'TEI/{i}'
    f = open(out_path,'wt',encoding='utf-8')
    f.write(current_file_out_str)
    f.close()
    print(f'\r[{"="*(int((progress/len_ld)*30))}{" "*(30-int((progress/len_ld)*30))}] {int((progress/len_ld)*100)}% Wrote {out_path}',end='')
