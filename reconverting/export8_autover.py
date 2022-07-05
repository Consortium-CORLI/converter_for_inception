import os
import re
import datetime
import zipfile
import json

excluded_tags = ['Token','Dependency','Sentence']

directory_path = 'source/'

encoding = 'utf-8'




#CELLE-CI SEMBLE FONCTIONNER
log_annotation_pattern = '\\{[^\\n]*"annotator":"([^"]*)","created":([0-9]+),"details":\\{("feature":"([^"]*)","value":"([^"]*)")?[^\\n]*"addr":([^"]*),"begin":([^"]*),"end":([^"]*),"type":"([^"]*)","text":"([^"]*)"\\}\\}?,"document_name":"([^"]*)"[^\\n]*"user":"([^"]*)"\\}'
log_annotation_regex = re.compile(log_annotation_pattern)

type_ending_pattern = '\\.([^\\.]+)$'
type_ending_regex = re.compile(type_ending_pattern)

output_str = ''
# output_str += '<?xml version="1.0" encoding="utf-8"?>'
# out_files_count = 0

# def convert_from_uima(full_path,log_path):
def convert_from_uima(full_path):
    
    file = open(full_path,'rt',encoding='utf-8')
    data = file.read()
    file.close()

    custom_list = []

    # custom_pattern = '<custom:([^ ]+) xmi:id="([0-9]+)"(((?: )[^=]+="[^"]*")*)/>'
    # custom_pattern = '<custom:([^ ]+) (xmi:id="[0-9]+")( ([^=]+="[^"]*"))*/>'
    # custom_pattern = '<custom:([^ ]+) (xmi:id="[0-9]+")(( [^=]+="[^"]*")*)/>'
    # custom_pattern = '<custom:([^ ]+) (xmi:id="[0-9]+")(( ([^=])+="([^"]*)")*)/>'
    # custom_pattern = '<custom:([^ ]+) (xmi:id="[0-9]+")(( ([^=])+="([^"]*)")*) begin="([0-9]+)" end="([0-9]+)"(( ([^=])+="([^"]*)")*)/>'
    # custom_pattern = '<custom:([^ ]+) (xmi:id="[0-9]+")(( ([^=])+="([^"]*)")*) begin="([0-9]+)" end="([0-9]+)" sofa="([0-9]+)"/>'
    # custom_pattern = '<custom:([^ ]+) (xmi:id="[0-9]+")(( ([^=]+)="([^"]*)")*) begin="([0-9]+)" end="([0-9]+)" sofa="([0-9]+)"/>'
    # custom_pattern = '<custom:([^ ]+) (xmi:id="[0-9]+")(( [^=]+="[^"]*")*) begin="([0-9]+)" end="([0-9]+)" sofa="([0-9]+)"/>'
    # custom_pattern = '<custom:([^ ]+) (xmi:id="[0-9]+")([^>]*) begin="([0-9]+)" end="([0-9]+)" sofa="([0-9]+)"/>'
    #OK, BUT TRYING OTHER THINGS
    # custom_pattern = '<custom:([^ ]+) xmi:id="([0-9]+)"([^>]*) begin="([0-9]+)" end="([0-9]+)" sofa="([0-9]+)"/>'
    # custom_pattern = '<([^\\:]+):([^ ]+) xmi:id="([0-9]+)"([^>]*) begin="([0-9]+)" end="([0-9]+)" sofa="([0-9]+)"/>'
    # custom_pattern = '<([^\\:]+):([^ ]+) xmi:id="([0-9]+)"([^>]*)([^<>/]*)/>'
    custom_pattern = '<([^\\:]+):([^ ]+) xmi:id="([0-9]+)"([^<>/]*)/>'
    custom_regex = re.compile(custom_pattern)

    attributes_pattern = '([^\\s=]+)="([^"]*)"'
    attributes_regex = re.compile(attributes_pattern)

    custom_result = custom_regex.findall(data)
    # print(custom_result)
    for i in range(len(custom_result)):
        # print(custom_result[i])
        # if custom_result[i][0] == 'cas' or custom_result[i][0] == 'type':
        # if custom_result[i][0] == 'cas' or custom_result[i][0] == 'type' or custom_result[i][1] in excluded_tags:
        if custom_result[i][0] == 'cas' or custom_result[i][0].startswith('type') or custom_result[i][1] in excluded_tags:
            continue
        
        # print(custom_result[i][3])
        other_attributes = attributes_regex.findall(custom_result[i][3])
        # print(other_attributes)
        local_dict = {
            "tag": custom_result[i][1],
            "xmiid": custom_result[i][2],
            # "general_attributes": custom_result[i][3],
            "general_attributes": [j for j in other_attributes]
        }
        for j in range(len(other_attributes)):
            local_dict[other_attributes[j][0]] = other_attributes[j][1]
        if 'begin' in local_dict.keys():
            local_dict['begin'] = int(local_dict['begin'])
        # else:
        #     print(custom_result[i][:])
        if 'end' in local_dict.keys():
            local_dict['end'] = int(local_dict['end'])
        custom_list.append(local_dict)
        # print(custom_list[-1])

    banned_attributes = ['begin', 'end', 'sofa']
    tags_list = []
    for i in range(len(custom_list)):
        if custom_list[i]["begin"] != custom_list[i]["end"]:
            tags_list.append({
                "tag_type": custom_list[i]["tag"],
                # "tag": f'<{custom_list[i]["tag"]}{custom_list[i]["general_attributes"].rstrip(" ")}>',
                # "tag": f'<{custom_list[i]["tag"]}{"".join([" "+j+"=\""+custom_list[i]["general_attributes"][j]+"\"" for j in custom_list[i]["general_attributes"].keys() if j not in banned_attributes])}>',
                "tag": f'<{custom_list[i]["tag"]}',
                "position": custom_list[i]["begin"],
                "end": custom_list[i]["end"],
                "opening": True,
                "alone": False,
                "xmiid": int(custom_list[i]["xmiid"])
            })
            tags_list[-1]['tag'] += "".join([" "+j[0]+"=\""+j[1]+"\"" for j in custom_list[i]["general_attributes"] if j[0] not in banned_attributes]) +'>'
            tags_list.append({
                "tag_type": custom_list[i]["tag"],
                # "tag": f'</{custom_list[i]["tag"]}>',
                "tag": f'</{re.findall("^([^ ]+)",custom_list[i]["tag"])[0]}>',
                "position": custom_list[i]["end"],
                "opening": False,
                "alone": False,
                "xmiid": int(custom_list[i]["xmiid"])
            })
        else:
            tags_list.append({
                "tag_type": custom_list[i]["tag"],
                # "tag": f'<{custom_list[i]["tag"]}{custom_list[i]["general_attributes"].rstrip(" ")}/>',
                # "tag": f'<{custom_list[i]["tag"]}{"".join([" "+j+"=\""+custom_list[i]["general_attributes"][j]+"\"" for j in custom_list[i]["general_attributes"].keys() if j not in banned_attributes])}>',
                "tag": f'<{custom_list[i]["tag"]}',
                "position": custom_list[i]["begin"],
                "end": custom_list[i]["end"],
                "opening": True,
                "alone": True,
                "xmiid": int(custom_list[i]["xmiid"])
            })
            # tags_list[-1]['tag'] += "".join([" "+j[0]+"=\""+j[1]+"\"" for j in custom_list[i]["general_attributes"] if j[0] not in banned_attributes]) +'>'
            tags_list[-1]['tag'] += "".join([" "+j[0]+"=\""+j[1]+"\"" for j in custom_list[i]["general_attributes"] if j[0] not in banned_attributes]) +'/>'


    open_tags_list = []
    len_tags_list = len(tags_list)
    for i in range(len_tags_list):
        local_min = 1e12
        local_min_index = -1
        for j in range(i,len(tags_list)):
            # if tags_list[j]["position"] >= local_max:
            if tags_list[j]["position"] < local_min:
                local_min = tags_list[j]["position"]
                local_min_index = j
            elif tags_list[j]["position"] == local_min:
                #CELA DEVRAIT FONCTIONNER, MAIS PEUT-ÊTRE CHOSES À CORRIGER CONCERNANT LES BALISES EN <lb/> ETC., CF. "alone"
                if tags_list[j]["opening"] and tags_list[local_min_index]["opening"]:
                    
                    #REMPLACE EN >=
                    if tags_list[j]["end"] >= tags_list[local_min_index]["end"]:
                        local_min = tags_list[j]["position"]
                        local_min_index = j
                    
                    
                elif (not tags_list[j]["opening"]) and (not tags_list[local_min_index]["opening"]):
                    if tags_list[j]["tag_type"] == open_tags_list[-1]:
                        local_min = tags_list[j]["position"]
                        local_min_index = j
                    
                    
                
                else:
                    if not tags_list[j]["opening"]:
                    # if tags_list[j]["opening"]:
                        local_min = tags_list[j]["position"]
                        local_min_index = j
                
        if not tags_list[local_min_index]["alone"]:
            if tags_list[local_min_index]["opening"]:
                open_tags_list.append(tags_list[local_min_index]["tag_type"])
            else:
                open_tags_list.pop()
        # tags_list.insert(0,tags_list.pop(local_min_index))
        tags_list.insert(i,tags_list.pop(local_min_index))
        # print(local_max_index, local_max)
    
    # VERIFICATION ET CORRECTION

    # print(tags_list)

    # sofa_pattern = '<cas:Sofa (xmi:id="[0-9]+")(( [^=]+="[^"]*")*)/>'
    sofa_pattern = '<cas:Sofa xmi:id="([0-9]+)" sofaNum="([0-9]+)" sofaID="(.*)" sofaString="(.*)"/>'
    sofa_regex = re.compile(sofa_pattern)

    sofa_result = sofa_regex.findall(data)

    sofa_list = []

    # print(sofa_result)
    for i in range(len(sofa_result)):
        # print(i)
        sofa_list.append({
            "xmiid": sofa_result[i][0],
            "sofaNum": sofa_result[i][1],
            "sofaID": sofa_result[i][2],
            "sofaString": sofa_result[i][3]
        })
        # print(sofa_list[-1])

    # print(f'len(sofa_list): {len(sofa_list)}')

    xml_str = sofa_list[0]["sofaString"][:]

    # print(xml_str[113:140])

    #!! CELA POURRA POSER DES PROBLEMES SELON SI CONTIENT DEJA DES ECHAPPEMENTS DE BASE OU NON ; TOUT DEPEND AUSSI DE QUELS ECHAPPEMENTS INCEPTION FAIT
    xml_str = re.sub('&#10;','\n',xml_str)
    # xml_str = re.sub('&quot;','"',xml_str) #TOUJOURS UTILE SI ON VEUT, MAIS FAIT AUTREMENT ENSUITE
    # xml_str = re.sub('&amp;','&',xml_str)

    # print(xml_str[113:140])

    sum = 0

    special_chars_escaped = ['&gt;','&lt;','&amp;','&apos;','&quot;','&#9;']
    special_chars_replacement = []
    count = 0
    while len(special_chars_replacement) != len(special_chars_escaped) and count < 1e7:
        if chr(count) not in xml_str:
            special_chars_replacement.append(chr(count))
        count += 1
    
    for i in range(len(special_chars_escaped)):
        xml_str = re.sub(special_chars_escaped[i],special_chars_replacement[i],xml_str)
    
    # print(special_chars_escaped)
    # print(special_chars_replacement)

    previous_index = 0

    amp_encountered_count = 0
    gt_encountered_count = 0

    for i in range(len(tags_list)):
        # xml_str.insert(tags_list[i]['tag'],tags_list[i]["position"])

        #FONCTIONNE, MAIS IL FAUT PRENDRE EN COMPTE LES &amp;
        xml_str = f'{xml_str[:tags_list[i]["position"]+sum]}{tags_list[i]["tag"]}{xml_str[tags_list[i]["position"]+sum:]}'
        # xml_str = f'{xml_str[:tags_list[i]["position"]+sum+amp_encountered_count*4]}{tags_list[i]["tag"]}{xml_str[tags_list[i]["position"]+sum+amp_encountered_count*4:]}'
        # xml_str = f'{xml_str[:tags_list[i]["position"]+sum+amp_encountered_count*4+gt_encountered_count*3]}{tags_list[i]["tag"]}{xml_str[tags_list[i]["position"]+sum+amp_encountered_count*4+gt_encountered_count*3:]}'
        previous_index = tags_list[i]["position"]+sum + len(tags_list[i]['tag'])
        sum += len(tags_list[i]['tag'])
    

    for i in range(len(special_chars_escaped)):
        xml_str = re.sub(special_chars_replacement[i],special_chars_escaped[i],xml_str)

    # print(xml_str)

    # print(f'count: {count}')
    return xml_str









#--------------------------------------------------------------------------------------


with zipfile.ZipFile('current_inception_export_to_reconvert.zip','r') as current_zip_file:
    info_list = current_zip_file.infolist()
    for i in info_list:
        if i.filename.startswith('exportedproject') and i.filename.endswith('.json'):
            current_zip_file.extract(i)
            #current_json = open(i.filename,'rt',encoding='utf-8')
            current_json_file = open(i.filename,'rt',encoding='utf-8')
            # current_json = json.load(i.filename)
            current_json = json.load(current_json_file)
            current_json_file.close()
            # desc = current_json.description
            desc = current_json["description"]
            invisible_trace_memory_pattern = '<invisible_trace_memory src="([^"]*)" content="([^"]*)"/>'
            invisible_trace_memory_regex = re.compile(invisible_trace_memory_pattern)
            invisible_trace_memory_list = invisible_trace_memory_regex.findall(desc)
            path_cleaning_pattern = '\\.+'
            path_cleaning_regex = re.compile(path_cleaning_pattern)
            if (not os.path.exists('source')) or (not os.path.is_dir('source')):
                os.mkdir('source')
            for j in invisible_trace_memory_list:
                local_trace_source = 'source/' + path_cleaning_regex.sub('.',j[0]).replace('/','').replace('\\','')
                local_trace_content = j[1].replace('&#10;','\n').replace('&quot;','"')

                current_trace_file = open(local_trace_source,'wt',encoding='utf-8')
                current_trace_file.write(local_trace_content)
                current_trace_file.close()
            break


# list_dir = os.listdir(directory_path)
list_dir = os.listdir('source')

references_dict = {}
for a in range(len(list_dir)):
    # if os.path.isfile(directory_path+list_dir[a]) and list_dir[a].endswith('.xml'):
    # if os.path.isfile('source/'+list_dir[a]) and list_dir[a].endswith('.xml'):
    if os.path.isfile('source/'+list_dir[a]) and list_dir[a].endswith('.xml.trace'):
        # references_dict[list_dir[a].replace('.xml','')] = {
        references_dict[list_dir[a].replace('.xml.trace','')] = {
            # 'xml_uri': list_dir[a],
            'xml_uri': list_dir[a].replace('.trace',''),
            # 'xml_trace_uri': f'{list_dir[a]}.trace'
            'xml_trace_uri': list_dir[a]
        }

err = False
# for a in references_dict.keys():
#     #ADDED directory_path
#     if (not os.path.exists(directory_path+references_dict[a]['xml_uri'])) or (not os.path.exists(directory_path+references_dict[a]['xml_trace_uri'])):
#         err = True
#         break

if err:
    print(references_dict)
    print('[ERROR] XML and their traces not correctly detected')
else:

    # <> ON PARCOURT LE ZIP
    # pattern_zip = '[0-9]+\\.zip$'
    pattern_zip = 'current_inception_export_to_reconvert\\.zip$'
    regex_zip = re.compile(pattern_zip)
    current_dir_list = os.listdir('.')
    # print(current_dir_list)
    for i in range(len(current_dir_list)):
        if len(regex_zip.findall(current_dir_list[i])) > 0 and os.path.isfile(current_dir_list[i]):
            # print(f'Processing {current_dir_list[i]}')
            zip_out_dir = '__' + current_dir_list[i]
            with zipfile.ZipFile(current_dir_list[i],'r') as current_zip_file:
                current_zip_file.extractall(zip_out_dir)

            annotation_files_path = zip_out_dir + '/annotation'
            annotation_files_list = os.listdir(annotation_files_path)
            
            source_files_path = zip_out_dir + '/source'
            source_files_list = os.listdir(source_files_path)

            path_list = []
            for j in range(len(source_files_list)):
                index = -1
                try:
                    index = annotation_files_list.index(source_files_list[j])
                except:
                    pass
                # if source_files_list[j] not in annotation_files_list:
                # if index > 0:
                if index < 0:
                    path_list.append(source_files_path + '/' + source_files_list[j])
                    
                else:
                    # path_list.append(annotation_files_path + '/' + annotation_files_list[index])
                    sub_zip_path = annotation_files_path + '/' + source_files_list[j]
                    sub_zip_list_dir = os.listdir(sub_zip_path)
                    local_zip_path = sub_zip_path + '/__local_zip'
                    with zipfile.ZipFile(sub_zip_path + '/' + sub_zip_list_dir[0],'r') as current_zip_file:
                        current_zip_file.extractall(local_zip_path)
                    sub_zip_files = os.listdir(local_zip_path)
                    found = False
                    for k in range(len(sub_zip_files)):
                        if sub_zip_files[k].endswith('.xmi'):
                            path_list.append(local_zip_path + '/' + sub_zip_files[k])
                            found = True
                            break
                    if not found:
                        print('ERROR IN PATHING TO RETRIEVE .xmi FILE')
                

                # print(source_files_list[j])
                # references_dict[source_files_list[j].replace('\\.[^\\.]+$','')]['xml_uri'] = path_list[-1]
                # references_dict[source_files_list[j].replace('\\..+$','')]['xml_uri'] = path_list[-1]
                references_dict[re.sub('\\.[^\\.]+$','',source_files_list[j])]['xml_uri'] = path_list[-1]

            # print(path_list)


    # </>






























    # print(references_dict)













    # output_str = ''
    # output_str += '<?xml version="1.0" encoding="utf-8"?>'

    # local_depth = 0

    index_pattern = '^[0-9]+'
    index_regex = re.compile(index_pattern)

    trace_files = []
    for a in references_dict.keys():
        local_uri = references_dict[a]['xml_trace_uri']
        #ADDED directory_path
        local_file = open(directory_path+local_uri)
        local_data = local_file.read()
        regex_result = index_regex.findall(local_data)
        index = int(regex_result[0])
        tree = local_data.split('\n')[1:]
        tree = [tree[i] for i in range(len(tree)) if tree[i] != '']
        # print(tree)

        
        print('Converting:',references_dict[a]['xml_uri'])
        inner_content = 'DEFAULT_INNER_CONTENT'
        # try:
            # inner_content = convert_from_uima(directory_path + references_dict[a]['xml_uri'],log_uri)
            # inner_content = convert_from_uima(directory_path + references_dict[a]['xml_uri'])
            # print(f'Convertin')
        inner_content = convert_from_uima(references_dict[a]['xml_uri'])
        # except:
            # print('ERROR: couldn\'t properly convert file')
        trace_files.append({
            'index':index,
            'tree':tree,
            'xml_uri':references_dict[a]['xml_uri'],
            'xml_trace_uri':references_dict[a]['xml_trace_uri'],
            # 'inner_content':'TESTING'
            # 'inner_content':convert_from_uima(directory_path + references_dict[a]['xml_uri'],log_uri)
            'inner_content':inner_content
        })
        local_file.close()
    
    
    #SORTING
    len_trace_files = len(trace_files)
    for a in range(len_trace_files-1): #MADE A CORRECTION HERE BY ADDING THE -1, AS IF THERE ARE n ELEMENTS, IT REQUIRES n-1 LOOPS
        maximum = -1
        maximum_index = -1
        for b in range(len(trace_files)-a):
            if trace_files[b]['index'] > maximum:
                maximum = trace_files[b]['index']
                maximum_index = b
        # trace_files.append(trace_files[maximum_index])
        # trace_files.pop(maximum_index)
        # print(maximum,maximum_index)
        # trace_files.append(trace_files.pop(maximum_index))
        trace_files.insert(len_trace_files-1-a,trace_files.pop(maximum_index))

    # print(trace_files)

    document_structure = {
        # trace_files[0]['tree'][0]: {}
    }

    for a in range(len(trace_files)):
        obj = document_structure
        local_len = len(trace_files[a]['tree'])
        for b in range(local_len-1):
            if trace_files[a]['tree'][b] not in obj.keys():
                obj[trace_files[a]['tree'][b]] = {}
            obj = obj[trace_files[a]['tree'][b]]
        if '__tags_list__' not in obj.keys():
            obj['__tags_list__'] = []
        obj['__tags_list__'].append({'tag':trace_files[a]['tree'][-1],'inner_content':trace_files[a]['inner_content']})
        # obj['__tags_list__'].append({'tag':re.sub('([^\\s]+).*','\\1',trace_files[a]['tree'][-1]),'tag_and_attrs':trace_files[a]['tree'][-1],'inner_content':trace_files[a]['inner_content']})
    
    # print(document_structure)
    # print(document_structure['WIKIDISAGREE']['CHIROPRATIQUE'])


    







    # exit()












    # to_be_closed = []
    local_depth = 0
    # out_files_count = 0
    def recursive_xml_building(output_str,obj,local_depth):
        if local_depth == 0:
            out_files_count = 0
        # print(obj.keys())
        for a in obj.keys():
            # if a != '__children_nodes__':
            if a != '__tags_list__':
                if local_depth == 0:
                    # output_str = ''
                    # output_str += '<?xml version="1.0" encoding="utf-8"?>'
                    output_str = '<?xml version="1.0" encoding="utf-8"?>'
                #CREATING INITIAL TAG
                output_str += '\n'
                output_str += '\t' * local_depth
                output_str += '<'
                output_str += a
                output_str += '>'

                #INCREMENT local_depth
                local_depth += 1

                #RECURSIVE PROCESS
                output_str = recursive_xml_building(output_str,obj[a],local_depth)

                #DECREMENT local_depth
                local_depth -= 1

                #CREATING CLOSING TAG
                # output_str += '\n'
                output_str += '\t' * local_depth
                output_str += '</'
                # output_str += a
                output_str += re.findall('^([^ ]+)',a)[0]
                output_str += '>'




                #CREATE FILE
                if local_depth == 0:
                    now = datetime.datetime.now()
                    output_uri = 'inception_export_' + str(now.year) + '-' + str(now.month) + '-' + str(now.day) + '_file' + str(out_files_count) + '.xml'
                    a = 0
                    while os.path.exists(output_uri):
                        # 'inception_export_' + str(now.year) + '-' + str(now.month) + '-' + str(now.day) + '_' + str(a) + '.xml'
                        output_uri = 'inception_export_' + str(now.year) + '-' + str(now.month) + '-' + str(now.day) + '_' + str(a) + '_file' + str(out_files_count) + '.xml'
                        a += 1
                    output_file = open(output_uri,'xt',encoding=encoding)
                    output_file.write(output_str)
                    output_file.close()
                    print(f'File created: {output_uri}')
                    out_files_count += 1
                    output_str = ''
            else:
                for b in range(len(obj[a])):
                # for b in range(len(obj[])):
                    #CREATING INITIAL TAG
                    output_str += '\n'
                    output_str += '\t' * local_depth
                    output_str += '<'
                    # output_str += separating_tag
                    output_str += obj[a][b]['tag']
                    output_str += '>'

                    #INCREMENT local_depth
                    local_depth += 1

                    #RECURSIVE PROCESS
                    # recursive_xml_building(obj)
                    # output_str += '\n'
                    # output_str += '\t' * local_depth
                    # print(obj[a][b])
                    output_str += obj[a][b]['inner_content']
                    # output_str += re.sub('\\n','\n'+'\t'*(local_depth+1),obj[a][b]['inner_content'])
                    # output_str += 'testing'
                    # output_str += obj[a]['inner_content']

                    #DECREMENT local_depth
                    local_depth -= 1

                    #CREATING CLOSING TAG
                    # output_str += '\n'
                    output_str += '\t' * local_depth
                    output_str += '</'
                    # output_str += separating_tag
                    output_str += re.findall('^([^ ]+)',obj[a][b]['tag'])[0]
                    output_str += '>'
        return output_str

    # output_str = recursive_xml_building(output_str,document_structure,local_depth)
    output_str = recursive_xml_building('',document_structure,local_depth)
    # print(output_str)

    """
    now = datetime.datetime.now()
    output_uri = 'inception_export_' + str(now.year) + '-' + str(now.month) + '-' + str(now.day) + '.xml'
    a = 0
    while os.path.exists(output_uri):
        # 'inception_export_' + str(now.year) + '-' + str(now.month) + '-' + str(now.day) + '_' + str(a) + '.xml'
        output_uri = 'inception_export_' + str(now.year) + '-' + str(now.month) + '-' + str(now.day) + '_' + str(a) + '.xml'
        a += 1
    output_file = open(output_uri,'xt',encoding=encoding)
    output_file.write(output_str)
    output_file.close()
    print(f'File created: {output_uri}')
    """

# convert_from_uima('C:\\Users\\Louis\\Documents\\universite\\MASTER\\M1\\S2\\STAGE\\corpus-extrait-corli_test\\corpus\\target\\doc1.xml')
