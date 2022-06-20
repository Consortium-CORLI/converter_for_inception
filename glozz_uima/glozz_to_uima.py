import os
import re

path = ''

######################################################

# file_name_pattern = '^.*\\.aa$'
# file_name_regex = re.compile(file_name_pattern)

xml_tag_pattern = '^<\\?xml[^\\?]*\\?>'
xml_tag_regex = re.compile(xml_tag_pattern)

# unit_pattern = '<unit[^<>]*>\\b*<metadata[^<>]*>\\b*<author[^<>]*>[^<>]*</author>\\b*<creation\\-date[^<>]*>[^<>]*</creation\\-date>\\b*</metadata></unit>'
# unit_pattern = '<unit[^<>]*>[\\b\\B]*?</unit>'
# unit_pattern = '<unit[^<>]*>.*?</unit>'
# unit_pattern = '(<unit[^<>]*(id="([^"]*)")?[^<>]*>[\\w\\W]*?</unit>)'
unit_pattern = '(<unit[^<>]*(id="([^"]*)"){0,1}[^<>]*>[\\w\\W]*?</unit>)'
# unit_regex = re.compile(unit_pattern,'s')
unit_regex = re.compile(unit_pattern)

unit_id_pattern = '(?<=\\<unit id=")[^"]*(?=")'
unit_id_regex = re.compile(unit_id_pattern)

relation_pattern = '(<relation[^<>]*(id="([^"]*)")?[^<>]*>[\\w\\W]*?</relation>)'
relation_regex = re.compile(relation_pattern)

schema_pattern = '(<schema[^<>]*(id="([^"]*)")?[^<>]*>[\\w\\W]*?</schema>)'
schema_regex = re.compile(schema_pattern)

# start_pattern = '<start[^<>]*>[\\w\\W]*?index="([0-9])*"[\\w\\W]*?</start>'
start_pattern = '<start[^<>]*>[\\w\\W]*?index="([0-9]*)"[\\w\\W]*?</start>'
start_regex = re.compile(start_pattern)

# end_pattern = '<end[^<>]*>[\\w\\W]*?index="([0-9])*"[\\w\\W]*?</end>'
end_pattern = '<end[^<>]*>[\\w\\W]*?index="([0-9]*)"[\\w\\W]*?</end>'
end_regex = re.compile(end_pattern)

term_pattern = '<term[^<>]*id="([^"]*)"[^<>]*>[\\w\\W]*?</term>'
term_regex = re.compile(term_pattern)

embedded_unit_pattern = '<embedded\\-unit[^<>]*id="([^"]*)"[^<>]*>[\\w\\W]*?</embedded\\-unit>'
embedded_unit_regex = re.compile(embedded_unit_pattern)

author_pattern = '<author[^<>]*>([\\w\\W]*?)</author>'
author_regex = re.compile(author_pattern)

creation_date_pattern = '<creation\\-date[^<>]*>([\\w\\W]*?)</creation\\-date>'
creation_date_regex = re.compile(creation_date_pattern)

type_pattern = '<type[^<>]*>\\s*([\\w\\W]*?)\\s*</type>'
type_regex = re.compile(type_pattern)

feature_pattern = '<feature[^<>]*name="([^"]*)"[^<>]*>\\s*([\\w\\W]*?)\\s*</feature>'
feature_regex = re.compile(feature_pattern)

ld = os.listdir(path)
for i in ld:
    if not i.endswith('.aa'):
        continue
    lp = f'{path}/{i}'
    if not os.path.isfile(lp):
        continue
    ac_path = f'{lp[:-1]}c'
    if not os.path.exists(ac_path):
        print(f'[ERROR] Could not find matching *.ac file for {lp}')
        continue
    print(i,end='\r')
    f_aa = open(lp,'rt',encoding='utf-8')
    d_aa = f_aa.read()
    f_aa.close()

    
    f_ac = open(ac_path,'rt',encoding='utf-8')
    d_ac = f_ac.read()
    f_ac.close()

    s_out = f'{xml_tag_regex.findall(d_aa)[0]}\n<xmi:XMI xmlns:xmi="http://www.omg.org/XMI" xmlns:cas="http:///uima/cas.ecore" xmlns:custom="http:///webanno/custom.ecore" xmi:version="2.0">\n<cas:NULL xmi:id="0"/>'

    xmi_id_current = 2

    cas_view = ''

    # UNITS

    # units_list = unit_regex.findall(d_ac)
    units_list = unit_regex.findall(d_aa)
    # print(units_list)
    # print(len(units_list))
    for j in units_list:
        start = 'undefined'
        end = 'undefined'
        author = 'undefined'
        creation_date = 'undefined'
        type = 'undefined'
        feature_list = []
        id = j[2]
        if len(id) == 0:
            try:
                id = unit_id_regex.findall(j[0])[0]
            except:
                pass
        try:
            start = start_regex.findall(j[0])[0]
        except:
            pass
        try:
            end = end_regex.findall(j[0])[0]
        except:
            pass
        try:
            author = author_regex.findall(j[0])[0]
        except:
            pass
        try:
            creation_date = creation_date_regex.findall(j[0])[0]
        except:
            pass
        try:
            type = type_regex.findall(j[0])[0]
        except:
            pass
        feature_list = feature_regex.findall(j[0])
        
        s_out = f'{s_out}\n<custom:unit_{type} xmi:id="{xmi_id_current}" id="{id}" begin="{start}" end="{end}" author="{author}" creation_date="{creation_date}"'
        for k in feature_list:
            s_out = f'{s_out} {k[0]}="{k[1]}"'
        s_out = f'{s_out}/>'

        if len(cas_view) > 0:
            cas_view = f'{cas_view} '
        cas_view = f'{cas_view}{xmi_id_current}'
        xmi_id_current += 1
    













    # RELATIONS

    # units_list = unit_regex.findall(d_ac)
    relations_list = relation_regex.findall(d_aa)
    # print(len(relations_list))
    # print(units_list)
    # print(len(units_list))
    for j in relations_list:
        term_list = []
        author = 'undefined'
        creation_date = 'undefined'
        type = 'undefined'
        feature_list = []
        id = j[2]
        
        term_list = term_regex.findall(j[0])
        try:
            author = author_regex.findall(j[0])[0]
        except:
            pass
        try:
            creation_date = creation_date_regex.findall(j[0])[0]
        except:
            pass
        try:
            type = type_regex.findall(j[0])[0]
        except:
            pass
        feature_list = feature_regex.findall(j[0])
        
        s_out = f'{s_out}\n<custom:relation_{type} xmi:id="{xmi_id_current}" id="{id}" author="{author}" creation_date="{creation_date}"'
        for k in feature_list:
            s_out = f'{s_out} {k[0]}="{k[1]}"'
        term_count = 0
        for k in term_list:
            s_out = f'{s_out} term{str(term_count)}="{k}"'
            term_count += 1
        s_out = f'{s_out}/>'

        if len(cas_view) > 0:
            cas_view = f'{cas_view} '
        cas_view = f'{cas_view}{xmi_id_current}'
        xmi_id_current += 1
    










    # SCHEMA

    # units_list = unit_regex.findall(d_ac)
    schemas_list = relation_regex.findall(d_aa)
    # print(len(schemas_list))
    # print(units_list)
    # print(len(units_list))
    for j in schemas_list:
        embedded_unit_list = []
        author = 'undefined'
        creation_date = 'undefined'
        type = 'undefined'
        feature_list = []
        id = j[2]
        
        embedded_unit_list = embedded_unit_regex.findall(j[0])
        try:
            author = author_regex.findall(j[0])[0]
        except:
            pass
        try:
            creation_date = creation_date_regex.findall(j[0])[0]
        except:
            pass
        try:
            type = type_regex.findall(j[0])[0]
        except:
            pass
        feature_list = feature_regex.findall(j[0])
        
        s_out = f'{s_out}\n<custom:schema_{type} xmi:id="{xmi_id_current}" id="{id}" author="{author}" creation_date="{creation_date}"'
        for k in feature_list:
            s_out = f'{s_out} {k[0]}="{k[1]}"'
        embedded_unit_count = 0
        for k in term_list:
            s_out = f'{s_out} embedded_unit{str(embedded_unit_count)}="{k}"'
            embedded_unit_count += 1
        s_out = f'{s_out}/>'

        if len(cas_view) > 0:
            cas_view = f'{cas_view} '
        cas_view = f'{cas_view}{xmi_id_current}'
        xmi_id_current += 1











    # s_out = ''
    # s_out = f'{s_out}{xml_tag_regex.findall(d_ac)[0]}\n'
    # s_out = f'{s_out}{xml_tag_regex.findall(d_aa)[0]}\n'

    # HERE ADD ALL THE TAGS

    # HERE ADD THE TEXT ITSELF

    linefeed = "\n"

    # s_out = f'{s_out}\n<cas:Sofa xmi:id="1" sofaNum="1" sofaID="_InitialView" sofaString="{d_ac.replace("\n"," ")}"/>'
    s_out = f'{s_out}\n<cas:Sofa xmi:id="1" sofaNum="1" sofaID="_InitialView" sofaString="{d_ac.replace(linefeed," ")}"/>'

    # HERE ADD THE cas:View

    s_out = f'{s_out}\n<cas:View sofa="1" members="{cas_view}"/>'

    s_out = f'{s_out}\n</xmi:XMI>'

    # print(s_out)

    path_out = f'{path}/__{i[:-3]}.xml'
    f = open(path_out,'wt',encoding='utf-8')
    f.write(s_out)
    f.close()
    print(f'Wrote {path_out}',end='\r')