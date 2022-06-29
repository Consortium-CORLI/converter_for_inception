import os
import re

path = 'source'

######################################################

# file_name_pattern = '^.*\\.aa$'
# file_name_regex = re.compile(file_name_pattern)

xml_tag_pattern = '^<\\?xml[^\\?]*\\?>'
xml_tag_regex = re.compile(xml_tag_pattern)

urs_pattern = '(<(unit|relation|schema)[^<>]*(id=[\'"]([^\'"]*)[\'"]){0,1}[^<>]*>[\\w\\W]*?</(unit|relation|schema)>)'
urs_regex = re.compile(urs_pattern)

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

xml_special_chars = [
    ['&amp;','&'],
    ['&gt;','>'],
    ['&lt;','<'],
    ['&quot;','"'],
    ['&apos;','\'']
]

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

    s_out = f'{xml_tag_regex.findall(d_aa)[0]}\n<xmi:XMI xmlns:pos="http:///de/tudarmstadt/ukp/dkpro/core/api/lexmorph/type/pos.ecore" xmlns:tcas="http:///uima/tcas.ecore" xmlns:xmi="http://www.omg.org/XMI" xmlns:cas="http:///uima/cas.ecore" xmlns:tweet="http:///de/tudarmstadt/ukp/dkpro/core/api/lexmorph/type/pos/tweet.ecore" xmlns:morph="http:///de/tudarmstadt/ukp/dkpro/core/api/lexmorph/type/morph.ecore" xmlns:type="http:///de/tudarmstadt/ukp/clarin/webanno/api/type.ecore" xmlns:dependency="http:///de/tudarmstadt/ukp/dkpro/core/api/syntax/type/dependency.ecore" xmlns:type6="http:///de/tudarmstadt/ukp/dkpro/core/api/semantics/type.ecore" xmlns:type9="http:///de/tudarmstadt/ukp/dkpro/core/api/transform/type.ecore" xmlns:type8="http:///de/tudarmstadt/ukp/dkpro/core/api/syntax/type.ecore" xmlns:type3="http:///de/tudarmstadt/ukp/dkpro/core/api/metadata/type.ecore" xmlns:type10="http:///org/dkpro/core/api/xml/type.ecore" xmlns:type4="http:///de/tudarmstadt/ukp/dkpro/core/api/ner/type.ecore" xmlns:type5="http:///de/tudarmstadt/ukp/dkpro/core/api/segmentation/type.ecore" xmlns:type2="http:///de/tudarmstadt/ukp/dkpro/core/api/coref/type.ecore" xmlns:type7="http:///de/tudarmstadt/ukp/dkpro/core/api/structure/type.ecore" xmlns:constituent="http:///de/tudarmstadt/ukp/dkpro/core/api/syntax/type/constituent.ecore" xmlns:chunk="http:///de/tudarmstadt/ukp/dkpro/core/api/syntax/type/chunk.ecore" xmlns:custom="http:///webanno/custom.ecore" xmi:version="2.0">\n<cas:NULL xmi:id="0"/>'

    xmi_id_current = 2

    cas_view = ''

    # UNITS

    urs_units = urs_regex.findall(d_aa)
    print(f'Found {len(urs_units)} URS units')
    urs_healthy_count = 0
    urs_unit_count = 0
    urs_relation_count = 0
    urs_schema_count = 0
    for j in urs_units:
        # if j[2] == j[5]:
        if j[1] == j[4]:
            urs_healthy_count += 1
            # if j[2] == 'unit':
            if j[1] == 'unit':
                urs_unit_count += 1
            # elif j[2] == 'relation':
            elif j[1] == 'relation':
                urs_relation_count += 1
            # elif j[2] == 'schema':
            elif j[1] == 'schema':
                urs_schema_count += 1
        else:
            # print(j[2],j[5])
            print(j[1],j[4])
    print(f'{urs_healthy_count} healthy units\n{urs_unit_count} <unit> ... </unit>\n{urs_relation_count} <relation> ... </relation>\n{urs_schema_count} <schema> ... </schema>')

    # exit()

    # units_list = unit_regex.findall(d_ac)
    units_list = unit_regex.findall(d_aa)
    # print(units_list)
    # print(len(units_list))
    for j in urs_units:
        if j[1] == 'unit':
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

            namespace = 'custom'
            # type_lower = type.lower()
            # if type_lower == 'lemma':
            if type in ['Token','Lemma']:
                namespace = 'type5'
            # elif type_lower == 'namedentity':
            elif type == 'NamedEntity':
                namespace = 'type4'
            elif type == 'POS':
                namespace = 'pos'
            elif type == 'MorphologicalFeatures':
                namespace = 'morph'
            
            # s_out = f'{s_out}\n<custom:unit_{type} xmi:id="{xmi_id_current}" id="{id}" begin="{start}" end="{end}" author="{author}" creation_date="{creation_date}"'
            # s_out = f'{s_out}\n<custom:{type} xmi:id="{xmi_id_current}" id="{id}" begin="{start}" end="{end}" author="{author}" creation_date="{creation_date}"'
            # s_out = f'{s_out}\n<{namespace}:{type} xmi:id="{xmi_id_current}" id="{id}" begin="{start}" end="{end}" author="{author}" creation_date="{creation_date}"'
            s_out = f'{s_out}\n<{namespace}:{type} xmi:id="{xmi_id_current}" sofa="1" begin="{start}" end="{end}"'
            for k in feature_list:
                if k[0] not in ['sofa','author','creation_date']:
                    s_out = f'{s_out} {k[0]}="{k[1]}"'
            s_out = f'{s_out}/>'

            if len(cas_view) > 0:
                cas_view = f'{cas_view} '
            cas_view = f'{cas_view}{xmi_id_current}'
            xmi_id_current += 1
        elif j[1] == 'relation':
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

            if type == 'undefined':
                try:
                    if term_list[0] == term_list[1]:
                        type = 'ROOT'
                    else:
                        type = 'Dependency'
                except:
                    pass
            
            # s_out = f'{s_out}\n<custom:relation_{type} xmi:id="{xmi_id_current}" id="{id}" author="{author}" creation_date="{creation_date}"'
            s_out = f'{s_out}\n<dependency:{type} xmi:id="{xmi_id_current}"'
            if len(id) > 0:
                s_out = f'{s_out} id="{id}"'
            """
            s_out = f'{s_out} author="{author}" creation_date="{creation_date}"'
            """
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
        elif j[1] == 'schema':
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










    """
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

        if type == 'undefined':
            try:
                if term_list[0] == term_list[1]:
                    type = 'ROOT'
                else:
                    type = 'Dependency'
            except:
                pass
        
        # s_out = f'{s_out}\n<custom:relation_{type} xmi:id="{xmi_id_current}" id="{id}" author="{author}" creation_date="{creation_date}"'
        s_out = f'{s_out}\n<dependency:{type} xmi:id="{xmi_id_current}" id="{id}" author="{author}" creation_date="{creation_date}"'
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
    """











    # s_out = ''
    # s_out = f'{s_out}{xml_tag_regex.findall(d_ac)[0]}\n'
    # s_out = f'{s_out}{xml_tag_regex.findall(d_aa)[0]}\n'

    # HERE ADD ALL THE TAGS

    # HERE ADD THE TEXT ITSELF

    linefeed = "\n"

    for j in xml_special_chars:
        d_ac = d_ac.replace(j[1],j[0])

    # s_out = f'{s_out}\n<cas:Sofa xmi:id="1" sofaNum="1" sofaID="_InitialView" sofaString="{d_ac.replace("\n"," ")}"/>'
    s_out = f'{s_out}\n<cas:Sofa xmi:id="1" sofaNum="1" sofaID="_InitialView" sofaString="{d_ac.replace(linefeed," ")}"/>'

    # HERE ADD THE cas:View

    s_out = f'{s_out}\n<cas:View sofa="1" members="{cas_view}"/>'

    s_out = f'{s_out}\n</xmi:XMI>'

    # print(s_out)

    # path_out = f'{path}/__{i[:-3]}.xml'
    path_out = f'{path}/__test__{i[:-3]}.xml'
    f = open(path_out,'wt',encoding='utf-8')
    f.write(s_out)
    f.close()
    print(f'Wrote {path_out}',end='\r')