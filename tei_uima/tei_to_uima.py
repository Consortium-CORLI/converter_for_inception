import os
import re
import time
from math import log2, ceil

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

# txm_ana_pattern = '<txm:ana[^<>]*\\sresp="([^"]*)"[^<>]*\\stype="#{0,1}([^"_]+)(_[^"]+)"[^<>]*>([^<>]*)</txm:ana>'
txm_ana_pattern = '<txm:ana[^<>]*\\sresp="([^"]*)"[^<>]*\\stype="#{0,1}(_{0,1}[^"_]+)(_{0,1}[^"]*)"[^<>]*>([^<>]*)</txm:ana>' #MADE A CHANGE TO FIT begin, end AND xml_id #ALSO ADDED POSSIBLE UNDERSCORE IN BEGINNING OF NAME TO PREVENT _begin ETC. FROM NOT BEING DETECTED
# txm_ana_pattern = '<txm:ana[^<>]*\\sresp="([^"]*)"[^<>]*\\stype="#{0,1}([^"_]+)(_[^"]+)"[^<>]*>([^<]*)</txm:ana>'
txm_ana_regex = re.compile(txm_ana_pattern)

txm_ana_begin_pattern = '<txm:ana[^<>]*\\stype="#begin"[^<>]*>([0-9]+)</txm:ana>'
txm_ana_begin_regex = re.compile(txm_ana_begin_pattern)

txm_ana_end_pattern = '<txm:ana[^<>]*\\stype="#end"[^<>]*>([0-9]+)</txm:ana>'
txm_ana_end_regex = re.compile(txm_ana_end_pattern)

txm_ana_xml_id_pattern = '<txm:ana[^<>]*\\stype="#xm[li][:_]id"[^<>]*>([0-9]+)</txm:ana>'
txm_ana_xml_id_regex = re.compile(txm_ana_xml_id_pattern)

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

def return_begin(x) -> int:
    return int(x["attrs"]["begin"])

def return_xml_id(x) -> int:
    # return int(x["xml:id"] or x["xmi:id"])
    try:
        if "xmi:id" in x["attrs"].keys():
            return int(x["attrs"]["xmi:id"])
        elif "xml:id" in x["attrs"].keys():
            return int(x["attrs"]["xml:id"])
        elif "xmi_id" in x["attrs"].keys():
            return int(x["attrs"]["xmi_id"])
        elif "xml_id" in x["attrs"].keys():
            return int(x["attrs"]["xml_id"])
        else:
            return -1
    except:
        print(x)
        exit()

# def binary_search_begin_end(i_list,i_target):
def binary_search(i_list,i_target,i_key):
    l = 0
    r = len(i_list)
    max_iter = ceil(log2(r))
    count_iter = 0
    result = None
    while count_iter < max_iter and result == None:
        m = int(l + ((r-l)/2))
        local_value = i_key(i_list[m])
        if local_value == i_target:
            result = m
            break
        elif local_value < i_target:
            l = m
        elif local_value > i_target:
            r = m
        count_iter += 1
    return result    

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

    w_list = list(w_regex.findall(d))

    # for j in w_list:


    tags_list = []

    open_tags = {}

    for j in w_list:
        # print(j)
        # print(j[1],j[2],j[3])
        local_form = None
        local_begin = None
        local_end = None
        local_xml_id = None
        try:
            local_form = txm_form_regex.findall(
                # j[0]
                j[4]
            )[0]

            local_begin = txm_ana_begin_regex.findall(j[4])[0]
            local_end = txm_ana_end_regex.findall(j[4])[0]
            local_xml_id = txm_ana_xml_id_regex.findall(j[4])[0]
        except:
            print(local_begin,local_end,local_xml_id)
            continue


        tags_list.append({
            "namespace":"type5",
            "tag_type":"Token",
            "form":local_form,
            "attrs":{
                # "xml:id":str(xmi_id_current),
                # "xml:id":str(local_xml_id),
                "xmi:id":str(local_xml_id),
                "sofa":"1",
                "begin":str(local_begin),
                "end":str(local_end),
                "order":"0"
            }
        })
        
        current_token_index_in_tags_list = len(tags_list)-1
        
        

        # attr_memory = {}

        current_token_annotations = {}

        txm_ana = txm_ana_regex.findall(j[4])
        for k in txm_ana:
            local_namespace = None
            # local_ana_xmi_id = None
            # try:
            #     local_ana_xmi_id = txm_ana_xml_id_regex.findall(k[0])[0]
            # except:
            #     continue

            local_ana_xmi_id = None

            k_1_lower = k[1].lower()
            # if k_1_lower == 'lemma':
            if k[1] == 'Lemma':
                local_namespace = 'type5'
                # tags_list[current_token_index_in_tags_list]["attrs"]["lemma"] = str(xmi_id_current)
                for m in txm_ana:
                    if m[1] == 'lemma' and m[2] == '':
                        local_ana_xmi_id = m[3]
                        tags_list[current_token_index_in_tags_list]["attrs"]["lemma"] = m[3]
                        break
            # elif k_1_lower == 'namedentity':
            elif k[1] == 'NamedEntity':
                local_namespace = 'type4'
            # elif k_1_lower == 'pos':
            elif k[1] == 'POS':
                local_namespace = 'pos'
                # tags_list[current_token_index_in_tags_list]["attrs"]["pos"] = str(xmi_id_current)
                for m in txm_ana:
                    if m[1] == 'pos' and m[2] == '':
                        local_ana_xmi_id = m[3]
                        tags_list[current_token_index_in_tags_list]["attrs"]["pos"] = m[3]
                        break
            # elif k_1_lower == 'morphologicalfeatures':
            elif k[1] == 'MorphologicalFeatures':
                local_namespace = 'morph'
                # tags_list[current_token_index_in_tags_list]["attrs"]["morph"] = str(xmi_id_current)
                for m in txm_ana:
                    if m[1] == 'morph' and m[2] == '':
                        local_ana_xmi_id = m[3]
                        tags_list[current_token_index_in_tags_list]["attrs"]["morph"] = m[3]
                        break
            # elif k_1_lower == 'root' or k_1_lower == 'dependency':
            elif k[1] == 'ROOT' or k[1] == 'Dependency':
                local_namespace = 'dependency'
            
            if local_namespace != None:
                # s_out = f'{s_out}\n<{local_namespace}:{tag_type}'
                
                if k[1] not in current_token_annotations.keys():
                    current_token_annotations[k[1]] = {
                        "namespace":local_namespace,
                        "tag_type":k[1],
                        "attrs":{
                            # "xml:id":str(xmi_id_current),
                            # "xmi:id":None,
                            # "xmi:id":-1,
                            "xmi:id":local_ana_xmi_id if local_ana_xmi_id != None else -1,
                            "sofa":"1",
                            "begin":str(local_begin),
                            "end":str(local_end)
                        },
                        "parent_token":tags_list[current_token_index_in_tags_list]
                    }


                if k[2].startswith('_attr_'):
                    local_attr_name = k[2][6:]
                    current_token_annotations[k[1]]["attrs"][local_attr_name] = k[3]

                # xmi_id_current += 1

        for k in current_token_annotations.keys():
            tags_list.append(current_token_annotations[k])
    
    tags_list.sort(key=return_xml_id)

    current_token = None
    for j in tags_list:
        if j["namespace"] == 'type5' and j["tag_type"] == 'Token':
            sofa = f'{sofa}{" "*(int(j["attrs"]["begin"])-len(sofa))}{j["form"]}'
            current_token = j
        elif int(j["attrs"]["xmi:id"])==-1:
            local_xml_id = int(j["parent_token"]["attrs"]["xmi:id"]) + 1
            local_index_in_tags_list = binary_search(i_list=tags_list,i_target=local_xml_id,i_key=return_xml_id)
            while local_index_in_tags_list != None:
                local_xml_id += 1
                local_index_in_tags_list = binary_search(i_list=tags_list,i_target=local_xml_id,i_key=return_xml_id)

            j["attrs"]["xmi:id"] = local_xml_id

            
            
            print(f'Found: {local_xml_id}',end='\r')
            
            # pass

    tags_list.sort(key=return_xml_id)
    view = ''

    for j in tags_list:
        #FIX FOR ORDER
        if len(view) > 0:
            view = f'{view} '
        view = f'{view}{str(j["attrs"]["xmi:id"])}'
        for k in j["attrs"].keys():
            for m in xml_special_chars:
                j["attrs"][k] = str(j["attrs"][k]).replace(m[1],m[0])
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
