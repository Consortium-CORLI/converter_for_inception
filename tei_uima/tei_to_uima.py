import os
import re
import time

path = 'TEI'
allow_dependencies = True

######################################################

xml_tag_pattern = '^<\\?xml[^\\?]*\\?>'
xml_tag_regex = re.compile(xml_tag_pattern)

"""
# uima_annotation_pattern = '(<([^:]+):([^\\s/<>]+)[^<>]*>)'
uima_annotation_pattern = '(<([^:\\?]+):([^\\s/<>]+)[^<>]*>)'
uima_annotation_regex = re.compile(uima_annotation_pattern)

uima_sofa_pattern = '<cas:Sofa[^<>]*sofaString="([^"]*)"[^<>]>'
uima_sofa_regex = re.compile(uima_sofa_pattern)


xml_attribute_pattern = '\\s([^=]+)="([^"]*)"'
xml_attribute_regex = re.compile(xml_attribute_pattern)
"""

# w_pattern = '<w[^<>]*(\\sid="(w_([^<>"]+)_([0-9]+))")?[^<>]*>([\\w\\W]*?)</w>'
# w_pattern = '<w[^<>]*(\\sid="(w_([^<>"]+)_([0-9]+))"){0,1}[^<>]*>([\\w\\W]*?)</w>'
# w_pattern = '<w(\\sid="(w_([^<>"]+)_([0-9]+))")>([\\w\\W]*?)</w>'
w_pattern = '<w[^<>]*?(\\sid="(w_([^<>"]+)_([0-9]+))"){0,1}[^<>]*>([\\w\\W]*?)</w>'
w_regex = re.compile(w_pattern)

# txm_form_pattern = '<txm:form[^<>]*>([^<>]*)</txm:form>'
txm_form_pattern = '<txm:form[^<>]*>([^<]*)</txm:form>'
txm_form_regex = re.compile(txm_form_pattern)

txm_ana_pattern = '<txm:ana[^<>]*\\sresp="([^"]*)"[^<>]*\\stype="#{0,1}([^"_]+)(_[^"]+)"[^<>]*>([^<>]*)</txm:ana>'
# txm_ana_pattern = '<txm:ana[^<>]*\\sresp="([^"]*)"[^<>]*\\stype="#{0,1}([^"_]+)(_[^"]+)"[^<>]*>([^<]*)</txm:ana>'
txm_ana_regex = re.compile(txm_ana_pattern)

xml_special_chars = [
    ['&amp;','&'],
    ['&gt;','>'],
    ['&lt;','<'],
    ['&quot;','"'],
    ['&apos;','\'']#,
    # ['&amp;','&']
]

list_of_no_space_before = ['.',',']
# list_of_no_space_after = ['"']

tab = '\t'

quote = '"'

unix_time = int(time.time() * 1000)

if not os.path.exists('UIMA') or os.path.isfile('UIMA'):
    os.mkdir('UIMA')

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

    s_out = f'{xml_tag_regex.findall(d)[0]}\n{tab*depth}<xmi:XMI xmlns:pos="http:///de/tudarmstadt/ukp/dkpro/core/api/lexmorph/type/pos.ecore" xmlns:tcas="http:///uima/tcas.ecore" xmlns:xmi="http://www.omg.org/XMI" xmlns:cas="http:///uima/cas.ecore" xmlns:tweet="http:///de/tudarmstadt/ukp/dkpro/core/api/lexmorph/type/pos/tweet.ecore" xmlns:morph="http:///de/tudarmstadt/ukp/dkpro/core/api/lexmorph/type/morph.ecore" xmlns:type="http:///de/tudarmstadt/ukp/clarin/webanno/api/type.ecore" xmlns:dependency="http:///de/tudarmstadt/ukp/dkpro/core/api/syntax/type/dependency.ecore" xmlns:type6="http:///de/tudarmstadt/ukp/dkpro/core/api/semantics/type.ecore" xmlns:type9="http:///de/tudarmstadt/ukp/dkpro/core/api/transform/type.ecore" xmlns:type8="http:///de/tudarmstadt/ukp/dkpro/core/api/syntax/type.ecore" xmlns:type3="http:///de/tudarmstadt/ukp/dkpro/core/api/metadata/type.ecore" xmlns:type10="http:///org/dkpro/core/api/xml/type.ecore" xmlns:type4="http:///de/tudarmstadt/ukp/dkpro/core/api/ner/type.ecore" xmlns:type5="http:///de/tudarmstadt/ukp/dkpro/core/api/segmentation/type.ecore" xmlns:type2="http:///de/tudarmstadt/ukp/dkpro/core/api/coref/type.ecore" xmlns:type7="http:///de/tudarmstadt/ukp/dkpro/core/api/structure/type.ecore" xmlns:constituent="http:///de/tudarmstadt/ukp/dkpro/core/api/syntax/type/constituent.ecore" xmlns:chunk="http:///de/tudarmstadt/ukp/dkpro/core/api/syntax/type/chunk.ecore" xmlns:custom="http:///webanno/custom.ecore" xmi:version="2.0">\n<cas:NULL xmi:id="0"/>'

    xmi_id_current = 2

    sofa = ''

    view = ''

    w_list = w_regex.findall(d)

    tags_list = []

    open_tags = {}

    for j in w_list:
        # print(j)
        # print(j[1],j[2],j[3])
        local_form = txm_form_regex.findall(
            # j[0]
            j[4]
        )[0]

        if (local_form not in list_of_no_space_before) and (len(sofa) > 0):
        # if (local_form not in list_of_no_space_before) and (local_begin > 0):
            sofa = f'{sofa} '

        local_begin = len(sofa)
        
        sofa = f'{sofa}{local_form}'

        local_end = len(sofa)

        tags_list.append({
            "namespace":"type5",
            "tag_type":"Token",
            "attrs":{
                "xml:id":str(xmi_id_current),
                "sofa":"1",
                "begin":str(local_begin),
                "end":str(local_end)
            }
        })
        current_token_index_in_tags_list = len(tags_list)-1
        if len(view) > 0:
            view = f'{view} '
        view = f'{view}{str(xmi_id_current)}'
        xmi_id_current += 1








        # attr_memory = {}

        current_token_annotations = {}

        txm_ana = txm_ana_regex.findall(j[4])
        for k in txm_ana:
            local_namespace = None
            k_1_lower = k[1].lower()
            if k_1_lower == 'lemma':
                local_namespace = 'type5'
                # tags_list[current_token_index_in_tags_list]["attrs"]["lemma"] = str(xmi_id_current)
            elif k_1_lower == 'namedentity':
                local_namespace = 'type4'
            elif k_1_lower == 'pos':
                local_namespace = 'pos'
                # tags_list[current_token_index_in_tags_list]["attrs"]["pos"] = str(xmi_id_current)
            elif k_1_lower == 'morphologicalfeatures':
                local_namespace = 'morph'
                # tags_list[current_token_index_in_tags_list]["attrs"]["morph"] = str(xmi_id_current)
            elif k_1_lower == 'root' or k_1_lower == 'dependency':
                local_namespace = 'dependency'
            
            if local_namespace != None:
                # s_out = f'{s_out}\n<{local_namespace}:{tag_type}'
                """
                tags_list.append({
                    "namespace":local_namespace,
                    "tag_type":k[1],
                    "attrs":{
                        "xml:id":str(xmi_id_current),
                        "sofa":"1",
                        "begin":str(local_begin),
                        "end":str(local_end)
                    }
                })
                """

                if k[1] not in current_token_annotations.keys():
                    current_token_annotations[k[1]] = {
                        "namespace":local_namespace,
                        "tag_type":k[1],
                        "attrs":{
                            "xml:id":str(xmi_id_current),
                            "sofa":"1",
                            "begin":str(local_begin),
                            "end":str(local_end)
                        }
                    }

                    if k_1_lower == 'lemma':
                        # local_namespace = 'type5'
                        tags_list[current_token_index_in_tags_list]["attrs"]["lemma"] = str(xmi_id_current)
                    # elif k_1_lower == 'namedentity':
                    #     local_namespace = 'type4'
                    elif k_1_lower == 'pos':
                        # local_namespace = 'pos'
                        tags_list[current_token_index_in_tags_list]["attrs"]["pos"] = str(xmi_id_current)
                    elif k_1_lower == 'morphologicalfeatures':
                        # local_namespace = 'morph'
                        tags_list[current_token_index_in_tags_list]["attrs"]["morph"] = str(xmi_id_current)

                    if len(view) > 0:
                        view = f'{view} '
                    view = f'{view}{str(xmi_id_current)}'
                    xmi_id_current += 1

                if k[2].startswith('_attr_'):
                    local_attr_name = k[2][6:]
                    current_token_annotations[k[1]]["attrs"][local_attr_name] = k[3]

                # xmi_id_current += 1

            """
            if local_namespace == None:
                local_namespace = 'custom'
                if k[1] in attr_memory.keys()
                # ...
                xmi_id_current += 1
            """

            """
            if local_namespace == None:
                local_namespace = 'custom'
                if k[1] not in open_tags.keys():
            """
        for k in current_token_annotations.keys():
            tags_list.append(current_token_annotations[k])

    for j in tags_list:
        for k in j["attrs"].keys():
            for m in xml_special_chars:
                j["attrs"][k] = j["attrs"][k].replace(m[1],m[0])
        s_out = f'{s_out}\n<{j["namespace"]}:{j["tag_type"]}{"".join([" "+k+"="+quote+j["attrs"][k]+quote for k in j["attrs"].keys()])}/>'
    
    for m in xml_special_chars:
        sofa = sofa.replace(m[1],m[0])
    sofa = sofa.replace('\n','&#10;')

    s_out = f'{s_out}\n<cas:Sofa xmi:id="1" sofaNum="1" sofaID="_InitialView" sofaString="{sofa}"/>'

    s_out = f'{s_out}\n<cas:View sofa="1" members="{view}"/>'

    s_out = f'{s_out}\n</xmi:XMI>'

    # print(s_out)
    
    # print(f'{i}, sofa:\n{sofa}')
    

    out_path = f'UIMA/{i}'
    f = open(out_path,'wt',encoding='utf-8')
    # f.write(current_file_out_str)
    f.write(s_out)
    f.close()
    print(f'Wrote {out_path}',end='\r')
