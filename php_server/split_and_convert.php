<?php
        $timeout_ms = 86400 * 1000; // ONE DAY
        $tmp_dir = sys_get_temp_dir() . '/tmp_inception_converter';
        if(!is_dir($tmp_dir)){
            mkdir($tmp_dir,0777,false);
        }

        if($_SERVER['REQUEST_METHOD'] == 'POST'){
            // IN PREPARATION OF RESPONSE
            header('Content-type:application/json');

            $raw_json = file_get_contents('php://input');
            $local_sha1_hash = sha1($raw_json . time());
            $dir_path = $tmp_dir . '/' . $local_sha1_hash;
            if(!is_dir($dir_path)){
                mkdir($dir_path,0777,false);
            }
            $dir_path_data = $dir_path . '/data';
            if(!is_dir($dir_path_data)){
                mkdir($dir_path_data,0777,false);
            }
            $data = json_decode($raw_json);

            $i_limit = count($data->source_documents);
            for($i = 0 ; $i < $i_limit ; $i += 1){
                $current_file = fopen($dir_path_data . '/' . $data->source_documents[$i]->name,'wb');
                fwrite($current_file,$data->source_documents[$i]->content);
                fclose($current_file);
            }

            $current_file = fopen($dir_path_data . '/typesystem.xml','wb');
            fwrite($current_file,$data->typesystem_xml);
            fclose($current_file);

            function generate_python_code($tagdefDataSource,$nb_doc,$output_name){
                $header = '# this Python 3 code has been generated on : ' . date('YYYY-MM-DD');

                $imports = '
from cassis import *
import xml.sax
import re
from os import listdir
from os import mkdir
from os.path import exists
';

                $globales = "
TYPESYS_FILE = 'data/typesystem.xml'
CORPUS_FILES_DIRECTORY = 'data/'
CORPUS_FILE = 'data/" . $output_name . "'
file_name_no_extension = re.findall('/([^/]+)\\\\.[^\\\\.]+$',CORPUS_FILE)[0]
OUT_DIR = 'source/'
";

                $defs = "";
                $initCounts = "";
                $i_limit = count($tagdefDataSource);
                for($i = 0 ; $i < $i_limit ; $i += 1){
                    $initCounts = $initCounts . "\t\tself.openedTag[\"" . $tagdefDataSource[$i]->tag . "\"]=0;\n";

                    if($tagdefDataSource[$i]->type == 3){
                        $line = "\t\tself.tagAnnos[\"" . $tagdefDataSource[$i]->tag . "\"] = type_system.get_type('webanno.custom." . $tagdefDataSource[$i]->tag . "');\n";
                        $defs = $defs . $line;
                        if($tagdefDataSource[$i]->type == null || count($tagdefDataSource[$i]->attrs) == 0){
                            $line = "\t\tself.tagsAttrs[\"" . $tagdefDataSource[$i]->tag . "\"] = {}";
                        }else{
                            $line = "\t\tself.tagsAttrs[\"" . $tagdefDataSource[$i]->tag . "\"] = {";
                            $j_limit = count($tagdefDataSource[$i]->attrs);
                            for($j = 0 ; $j < $j_limit ; $j += 1){
                                $str = strval($tagdefDataSource[$i]->attrs[$j]);
                                // $attr = clone($str);
                                $attr = $str . '';
                                if($str == "type"){
                                    $attr = $tagdefDataSource[$i]->tag . "_" . $attr;
                                    $attr = preg_replace("/-/mi","_",$attr);
                                    $attr = preg_replace("/\\./mi","_d_",$attr);
                                    $attr = preg_replace("/:/mi","__",$attr);
                                }
                                $line = $line . "\"" . preg_replace("/[\u{0300}-\u{036f}]/m","",$attr) . "\" : \"" . $tagdefDataSource[$i]->attrs[$j] . "\", ";
                            }
                            // SMALL DIFFERENCE HERE: NOT PUTTING SEMI-COLON IN THE END
                            $line = $line . "}\n";
                            $defs = $defs . $line;
                        }
                    }
                }

                $classe = "
class XML2XMIHandler(xml.sax.ContentHandler):
\tdef __init__(self, type_system, out_dir,ignore_ignorable_whitespace=False):
\t\tself.tagsAttrs = {}
\t\tself.tagAttrLastValues = {}
\t\tself.openedTag = {} ; # to manager possible relative depth constraint for tags
\t\tself.tagAnnos = {}" . "\n" . $defs . "\n" . $initCounts . "
\t\tself.type_system = type_system
\t\tself.out_dir = out_dir
\t\tself.ignore_whitespace = ignore_ignorable_whitespace or False
\t\tself.doc_count = 0
\t\tself.append_heading = True
\t\t# growing text that is being extracted from the xml for one doc
\t\tself.current_document_text = ''
\t\t# cas data structure that holds the current doc (text and annotations)
\t\tself.current_document_cas = None
\t\tself.anno_begin = {}
\t\tself.current_attributes = None
\t\tself.depth = 0
\t\tself.xpath = []
\t\tself.doc_depth = 0
";

                $code = new stdClass();
                $code->startTag = "
\tdef startElement(self, tag, attrs):
\t\tself.depth +=1
\t\tif attrs.getLength()>0:
\t\t\tself.xpath.append(tag + self.attr2str(attrs))
\t\telse:
\t\t\tself.xpath.append(tag)
";
                $code->endTag = "\n\n\t" . "def endElement(self, tag):\n";

                
                $i_limit = count($tagdefDataSource);
                for($i = 0 ; $i < $i_limit ; $i += 1){
                    if($tagdefDataSource[$i]->type == 5){
                        $test = "
\t\tif tag == '" . $tagdefDataSource[$i]->tag . "':
\t\t\treturn
";
                        $code->startTag = $code->startTag . $test;
                    }
                }







                $i_limit = count($tagdefDataSource);
                for($i = 0 ; $i < $i_limit ; $i += 1){
                    if($tagdefDataSource[$i]->type == 0){
                        $c = ($tagdefDataSource[$i]->constraint == "1");

                        $test = "";
                        if($c) {
                            $test = "
\t\tif tag == '" . $tagdefDataSource[$i]->tag . "':
\t\t\tself.openedTag['" . $tagdefDataSource[$i]->tag . "'] += 1
\t\t\t# case of a document boundary tag, possibly with a depth level constraint
\t\t\tif self.openedTag['" . $tagdefDataSource[$i]->tag . "'] == 1:
\t\t\t\tself.current_document_cas = Cas(typesystem=self.type_system)
\t\t\t\treturn;
";
                        } else {
                            $test = "
\t\tif tag == '" . $tagdefDataSource[$i]->tag . "':
\t\t\tself.current_document_cas = Cas(typesystem=self.type_system)
\t\t\tself.current_document_text = ''
\t\t\treturn;
";
                                    
                        }
                        $code->startTag = $code->startTag . $test;




                        $test = "";
                        if($c) {
                            $test = "
\t\tif tag == '" . $tagdefDataSource[$i]->tag . "':
\t\t\tself.openedTag['" . $tagdefDataSource[$i]->tag . "'] -= 1
\t\t\tself.depth -=1
\t\t\t# finish document
\t\t\tif " . ($c?'True':'False') . " and self.openedTag['" . $tagdefDataSource[$i]->tag . "'] == 0:
\t\t\t\tself.doc_count += 1
\t\t\t\tself.write_document()
\t\t\t\tself.current_document_text = ''
\t\t\t\tself.current_document_cas = None
\t\t\tself.xpath.pop()
\t\t\treturn\n\n
";
                          } else {
                            $test = "
\t\tif tag == '" . $tagdefDataSource[$i]->tag . "':
\t\t\tif self.current_document_cas != None:
\t\t\t\tself.doc_count += 1
\t\t\t\tself.write_document()
\t\t\t\tself.current_document_text = ''
\t\t\tself.depth -=1
\t\t\tself.xpath.pop()
\t\t\tself.current_document_cas = None
\t\t\tself.openedTag['" . $tagdefDataSource[$i]->tag . "'] -= 1
\t\t\treturn\n\n
";
                          }
                          // </tag>
                       $code->endTag = $code->endTag . $test;
                    }
                }










                $i_limit = count($tagdefDataSource);
                for($i = 0 ; $i < $i_limit ; $i += 1){
                    if($tagdefDataSource[$i]->type == 0){
                        $c = ($tagdefDataSource[$i]->constraint == "1");

                        $test = '';
        if($c) {
          $test = "
\t\tif tag == '" . $tagdefDataSource[$i]->tag . "':
\t\t\tself.openedTag['" . $tagdefDataSource[$i]->tag . "'] += 1
\t\t\t# case of a document boundary tag, possibly with a depth level constraint
\t\t\tif self.openedTag['" . $tagdefDataSource[$i]->tag . "'] == 1:
\t\t\t\tself.current_document_cas = Cas(typesystem=self.type_system)
\t\t\t\treturn;
";
        } else {
          $test = "
\t\tif tag == '" . $tagdefDataSource[$i]->tag . "':
\t\t\tself.current_document_cas = Cas(typesystem=self.type_system)
\t\t\tself.current_document_text = ''
\t\t\treturn;
";
                  
        }
        $code->startTag = $code->startTag . $test;




        if($c) {
            $test = "
\t\tif tag == '" . $tagdefDataSource[$i]->tag . "':
\t\t\tself.openedTag['" . $tagdefDataSource[$i]->tag . "'] -= 1
\t\t\tself.depth -=1
\t\t\t# finish document
\t\t\tif " . ($c?'True':'False') . " and self.openedTag['" . $tagdefDataSource[$i]->tag . "'] == 0:
\t\t\t\tself.doc_count += 1
\t\t\t\tself.write_document()
\t\t\t\tself.current_document_text = ''
\t\t\t\tself.current_document_cas = None
\t\t\tself.xpath.pop()
\t\t\treturn\n\n"
;
          } else {
            $test = "
\t\tif tag == '" . $tagdefDataSource[$i]->tag . "':
\t\t\tif self.current_document_cas != None:
\t\t\t\tself.doc_count += 1
\t\t\t\tself.write_document()
\t\t\t\tself.current_document_text = ''
\t\t\tself.depth -=1
\t\t\tself.xpath.pop()
\t\t\tself.current_document_cas = None
\t\t\tself.openedTag['" . $tagdefDataSource[$i]->tag . "'] -= 1
\t\t\treturn\n\n
";
          }
          // </tag>
       $code->endTag = $code->endTag . $test;
                    }
                }












                // cas des tags d'annotation
                $i_limit = count($tagdefDataSource);
                for($i = 0 ; $i < $i_limit ; $i += 1){
                    if($tagdefDataSource[$i]->type == 3){
                        $test = "
\t\t#Case of an annotation
\t\tif tag == '" . $tagdefDataSource[$i]->tag . "':
\t\t\tself.processStartTag(tag, attrs)
\t\t\treturn\n
";

$code->startTag = $code->startTag . $test;
                    }
                }



                $code->endTag = $code->endTag . "
\t\tif self.current_document_cas != None and tag in self.tagAnnos:
\t\t\tself.processEndTag(tag)
\t\tself.depth -=1
\t\tself.xpath.pop()
";









                // POTENTIAL PROBLEMS HERE ??
                $commonMethods = "
\tdef attr2str(self,attrs):
\t\tstr = ''
\t\tfor a in attrs.getNames():
\t\t\tstr += ' '
\t\t\tstr += a;
\t\t\tstr += '=\\\"';
\t\t\tstr += attrs.getValue(a);
\t\t\tstr += '\\\"';
\t\treturn str;

\tdef processStartTag(self,tag, attrs):
\t\tself.anno_begin[tag+'@'+str(self.depth)] = len(self.current_document_text)
\t\tself.tagAttrLastValues[tag+'@'+str(self.depth)] = attrs

\tdef processEndTag(self,tag):
\t\tanno_end = len(self.current_document_text)
\t\tself.current_document_cas.sofa_string = self.current_document_text
\t\tif self.anno_begin[tag+'@'+str(self.depth)] < anno_end:
\t\t\tself.anno_begin[tag+'@'+str(self.depth)], anno_end = self.trim_whitespace(self.anno_begin[tag+'@'+str(self.depth)], anno_end, self.current_document_text)
\t\tif self.anno_begin[tag+'@'+str(self.depth)] > anno_end:
\t\t\tprint (\"ERROR on : \" , tag, \"begin=\", self.anno_begin[tag+'@'+str(self.depth)], \"> end=\",anno_end )
\t\t\tself.anno_begin[tag+'@'+str(self.depth)] = -1
\t\t\tself.tagAttrLastValues[tag+'@'+str(self.depth)] = None
\t\t\treturn
\t\tanno = self.tagAnnos[tag](begin=self.anno_begin[tag+'@'+str(self.depth)], end=anno_end)
\t\tif tag in self.tagsAttrs:
\t\t\tfor attribute in self.tagsAttrs[tag].keys():
\t\t\t\tif self.tagAttrLastValues[tag+'@'+str(self.depth)]==None or attribute not in self.tagAttrLastValues[tag+'@'+str(self.depth)]:
\t\t\t\t\tcontinue
\t\t\t\tanno.__setattr__(attribute, self.tagAttrLastValues[tag+'@'+str(self.depth)].getValueByQName(attribute))
\t\tself.current_document_cas.add_annotation(anno)
\t\tself.anno_begin[tag+'@'+str(self.depth)] = -1
\t\tself.tagAttrLastValues[tag+'@'+str(self.depth)] = None

\tdef encode_filename(self):
\t\tfilename = file_name_no_extension + \"_doc\" + str(self.doc_count) + \".xml\"
\t\treturn filename

\tdef write_document(self):
\t\t\"\"\"Write current cas with current text to file with filename \"\"\"
\t\tif len(self.current_document_text.strip())==0:
\t\t\treturn
\t\tfilename = self.encode_filename()
\t\tself.current_document_cas.sofa_string = self.current_document_text
\t\t#print(filename);
\t\t#print(\"v=======sofa_string=========================v\")
\t\t#print(self.current_document_cas.sofa_string);
\t\t#print(\"v======current_document_cas.select_all()====v\")
\t\t#print(self.current_document_cas.select_all() )
\t\t#print(\"v======current_document_cas.typecheck=======v\")
\t\t#print(self.current_document_cas.typecheck() )
\t\t#print(\"v======current_document_cas._find_all_fs()===v\")
\t\t#for fs in self.current_document_cas._find_all_fs():
\t\t#\tprint(fs )
\t\t#print(\"=====================================\")
\t\tself.current_document_cas.to_xmi(self.out_dir + filename, pretty_print=True)
\t\tprint(f'Wrote doc to file {filename}.')
\t\ttraces = open(self.out_dir + filename+\".trace\",'w')
\t\ttraces.write(str(self.doc_count) + \"\\n\" )
\t\tfor t in self.xpath:
\t\t\ttraces.write(t + \"\\n\")
\t\ttraces.close()
\t\t
\t\tfile = open('status.log','wt',encoding='utf-8')
\t\tfile.write(str(int(100*self.doc_count/" . strval($nb_doc) . ")))
\t\tfile.close()
\tdef trim_whitespace(self, begin, end, text):
\t\t\"\"\"move offsets so there is no leading or trailing white-space in the annotation\"\"\"
\t\twhitespace = re.compile(r'\\s')
\t\twhile begin < end and whitespace.match(text[begin]):
\t\t\tbegin += 1
\t\twhile end > begin and whitespace.match(text[end - 1]):
\t\t\tend -= 1
\t\treturn begin, end

\tdef characters(self, content):
\t\tif self.current_document_cas != None:
\t\t\tself.current_document_text += content

\tdef ignorableWhitespace(self, whitespace):
\t\tif self.ignore_whitespace:
\t\t\treturn
\t\tself.current_document_text += whitespace
";

                $main = "
\n\n\n
if not exists(OUT_DIR):
\tmkdir(OUT_DIR)


with open(TYPESYS_FILE, 'rb') as f:
\ttype_system = load_typesystem(f)
\tcontentHandler = XML2XMIHandler(type_system, OUT_DIR)
\tlistdir_CORPUS_FILES_DIRECTORY = listdir(CORPUS_FILES_DIRECTORY)
\tlen_listdir_CORPUS_FILES_DIRECTORY = len(listdir_CORPUS_FILES_DIRECTORY)
\tfor i in listdir_CORPUS_FILES_DIRECTORY:
\t\tif i == 'typesystem.xml' or (not i.endswith('.xml')):
\t\t\tcontinue
\t\txml.sax.parse(CORPUS_FILES_DIRECTORY+i, contentHandler)
";

                $pythonCode = $header . $imports . "\nfile=open('status.log','wt',encoding='utf-8')\nfile.write('0')\nfile.close()\n" . $globales . $classe . $code->startTag . $code->endTag . $commonMethods . $main . "\nfile=open('status.log','wt',encoding='utf-8')\nfile.write('100')\nfile.close()\n";

                return $pythonCode;
            }

            // echo $raw_json;
            // $python_code = $data->python_code;
            $python_code = generate_python_code($data->tagdefDataSource,$data->nb_doc,$data->output_name);
            $path_to_python = $dir_path . '/split_and_convert.py';
            $current_file = fopen($path_to_python,'wb');
            fwrite($current_file,$python_code);
            fclose($current_file);


            function execInBackground($cmd) {
                // console.log('Executing in background ' . $cmd);
                if (substr(php_uname(), 0, 7) == "Windows"){
                    pclose(popen("start /B ". $cmd, "r")); 
                }
                else {
                    exec($cmd . " > /dev/null &");  
                }
            } 

            function startBackgroundProcess(
                $command,
                $stdin = null,
                $redirectStdout = null,
                $redirectStderr = null,
                $cwd = null,
                $env = null,
                $other_options = null
            ) {
                $descriptorspec = array(
                    1 => is_string($redirectStdout) ? array('file', $redirectStdout, 'w') : array('pipe', 'w'),
                    2 => is_string($redirectStderr) ? array('file', $redirectStderr, 'w') : array('pipe', 'w'),
                );
                if (is_string($stdin)) {
                    $descriptorspec[0] = array('pipe', 'r');
                }
                $proc = proc_open($command, $descriptorspec, $pipes, $cwd, $env, $other_options);
                if (!is_resource($proc)) {
                    throw new \Exception("Failed to start background process by command: $command");
                }
                if (is_string($stdin)) {
                    fwrite($pipes[0], $stdin);
                    fclose($pipes[0]);
                }
                if (!is_string($redirectStdout)) {
                    fclose($pipes[1]);
                }
                if (!is_string($redirectStderr)) {
                    fclose($pipes[2]);
                }
                return $proc;
            }

            

            $shell_command = '';
            if(substr(PHP_OS,0,3) == 'WIN'){
                $shell_command = 'cd ' . $dir_path . ' && start /B python3 split_and_convert.py > out.log';
            }else{
                $shell_command = 'cd ' . $dir_path . ' ; python3 split_and_convert.py &';
            }
            startBackgroundProcess($shell_command);

            echo '{"token":"' . $local_sha1_hash .'","timeout":' . (time()+$timeout_ms) . '}';

            
            $dir_path = sys_get_temp_dir() . '/tmp_inception_converter' . '/' . $local_sha1_hash . '/source';
            $json_config_file = fopen(sys_get_temp_dir() . '/tmp_inception_converter' . '/' . $local_sha1_hash . '/config.json','w');
            // CHANGING THE JSON FILE HERE ?
            // fwrite($raw_json,strlen($raw_json));
            fwrite($json_config_file,$raw_json);
            fclose($json_config_file);

            http_response_code(200);
        }else{
            http_response_code(405);
        }
?>