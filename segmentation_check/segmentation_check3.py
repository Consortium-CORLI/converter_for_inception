import os
import re

path = '.'

############################################################

annotation_pattern = '(<(\\S+)[^<>]*/>)'
annotation_regex = re.compile(annotation_pattern)

begin_pattern = '\\sbegin="([^"]*)"'
begin_regex = re.compile(begin_pattern)

end_pattern = '\\send="([^"]*)"'
end_regex = re.compile(end_pattern)

############################################################

csv_table = [
    ['id','full_path','document_name','tag_A','tag_A_begin','tag_A_end','tag_B','tag_B_begin','tag_B_end']
]

total_overlap_count = 0
files_with_overlap_count = 0

ld = os.listdir(path)
for i in ld:
    lp = f'{path}/{i}'
    # if (not os.path.isfile(lp)) or (not i.endswith('.xml')):
    if (not os.path.isfile(lp)) or not (i.endswith('.xml') or i.endswith('.xmi')):
        continue
    # print(i)
    f = open(lp,'rt',encoding='utf-8')
    d = f.read()
    f.close()

    annotations_list = annotation_regex.findall(d)

    # print(annotations_list)

    # annotations_list = [[j[1],begin_regex.findall(j[0])[0],end_regex.findall(j[0])[0]] for j in annotations_list]
    
    __annotations_list = []
    for j in annotations_list:
        begin = begin_regex.findall(j[0])
        if len(begin) == 0:
            continue
        end = end_regex.findall(j[0])
        if len(end) == 0:
            continue
        __annotations_list.append([j[1],begin[0],end[0]])
    
    n = sum(range(len(__annotations_list)))
    # print(n)
    count_to_n = 0

    m = 32

    overlap_count = 0

    len_annotations_list = len(__annotations_list)
    for j in range(len_annotations_list):
        # print(f'[{"="*int((count_to_n/n)*m)}{" "*(m-int((count_to_n/n)*m))}] {i} {overlap_count} overlaps',end='\r')
        for k in range(j,len_annotations_list):
            """
            a = __annotations_list[j][1]
            b = __annotations_list[j][2]
            c = __annotations_list[k][1]
            d = __annotations_list[k][2]
            """
            a = int(__annotations_list[j][1])
            b = int(__annotations_list[j][2])
            c = int(__annotations_list[k][1])
            d = int(__annotations_list[k][2])
            # if annotations_list[j][0] <= annotations_list[j][1] and annotations_list[j][1] < annotations_list[k][0]
            """
            if a <= b and b <= c and c <= d:
                continue
            if a <= b and d <= a and c <= d:
                continue
            if a <= c and a <= d and c <= d and a <= b and d <= b:
                continue
            if c <= a and c <= b and a <= b and c <= d and b <= d:
                continue
            print(f'Overlap between {a}:{b} <{__annotations_list[j][0]}> and {c}:{d} <{__annotations_list[k][0]}>')
            """
            """
            c_is_in = (a <= c and c <= b)
            d_is_in = (a <= d and d <= b)
            if not (c_is_in == d_is_in):
            """
            
            c_has_same_frontier = (a == c or c == b)
            d_has_same_frontier = (a == d or d == b)
            c_is_strictly_in = (a < c and c < b)
            d_is_strictly_in = (a < d and d < b)
            # count_to_n += 1
            if count_to_n < n:
                count_to_n += 1
            if c_has_same_frontier or d_has_same_frontier:
                continue
            else:
                if c_is_strictly_in == d_is_strictly_in:
                    continue
                else:
                    overlap_count += 1
                    csv_table.append([
                        str(len(csv_table)),
                        lp,
                        i,
                        __annotations_list[j][0],
                        str(a),
                        str(b),
                        # __annotations_list[k][1],
                        __annotations_list[k][0],
                        str(c),
                        str(d)
                    ])
                    # print(f'Overlap between {a}:{b} <{__annotations_list[j][0]}> and {c}:{d} <{__annotations_list[k][0]}>')

        print(f'[{"="*int((count_to_n/n)*m)}{" "*(m-int((count_to_n/n)*m))}] {int(count_to_n/n*100)}% {i} -> {overlap_count} overlaps',end='\r')
    print('')
    if overlap_count > 0:
        total_overlap_count += overlap_count
        files_with_overlap_count += 1

print(f'{"-"*64}\nGlobal number of overlaps: {total_overlap_count}\nNumber of files with overlaps: {files_with_overlap_count}')

output_index = 0
output_uri = f'overlaps_{output_index}.csv'
while os.path.exists(output_uri):
    output_index += 1
    output_uri = f'overlaps_{output_index}.csv'
csv_table = ['\t'.join(i) for i in csv_table]
csv_table = '\n'.join(csv_table)
f = open(output_uri,'wt',encoding='utf-8')
f.write(csv_table)
f.close()
print(f'Wrote {output_uri}')