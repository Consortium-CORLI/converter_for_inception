<?php
    if($_SERVER['REQUEST_URI'] == '/split_and_convert'){
        $timeout_ms = 86400 * 1000; // ONE DAY
        $tmp_dir = sys_get_temp_dir() . '/tmp_inception_converter';
        // $tmp_dir = 'tmp';
        if(!is_dir($tmp_dir)){
            mkdir($tmp_dir,0777,false);
            // if(!mkdir($new_dir,0777,false)){
            //     die('Could not create ' . $new_dir);
            // }else{
            //     echo('Successfully created ' . $new_dir);
            // }
        }// else{
        //     // echo($new_dir . ' already exists, no creation needed');
        //     echo("$new_dir already exists, no creation needed");
        // }

        // $hash = sha1(date('YYYY-MM-DD-HH-mm-ss') . $new_dir);
        // echo $hash;

        // echo $_SERVER['REQUEST_URI'];
        // echo '\n';
        // echo 'test';
        // for($i = 0 ; $i < $_SERVER['argc'] ; $i += 1){
        //     echo $_SERVER['argv'][$i];
        // }
        // echo $_SERVER['argc'];
        // echo $_SERVER['argv'];

        if($_SERVER['REQUEST_METHOD'] == 'POST'){
            // $name = $_POST['fname'];
            // echo $name;

            // $data = json_decode(file_get_contents('php://input'));
            // echo $data->name;

            // IN PREPARATION OF RESPONSE
            header('Content-type:application/json');

            $raw_json = file_get_contents('php://input');
            $local_sha1_hash = sha1($raw_json . time());
            $dir_path = $tmp_dir . '/' . $local_sha1_hash;
            // $dir_path = $tmp_dir . '\\' . $local_sha1_hash;
            if(!is_dir($dir_path)){
                mkdir($dir_path,0777,false);
            }
            $dir_path_data = $dir_path . '/data';
            if(!is_dir($dir_path_data)){
                mkdir($dir_path_data,0777,false);
            }
            // echo $raw_json;
            $data = json_decode($raw_json);
            // $data->name = preg_replace('/\s/mi','-',$data->name);
            // echo $data->mode;

            // $current_file = fopen($dir_path_data . '/' . $data->source_documents[0]->name,'w');
            // fwrite($current_file,$data->source_documents[0]->content);
            // fclose($current_file);

            // $i_limit = $data->source_documents->length;
            $i_limit = count($data->source_documents);
            // echo $i_limit;
            for($i = 0 ; $i < $i_limit ; $i += 1){
                // $current_file = fopen($dir_path_data . '/' . $data->source_documents[$i]->name,'w');
                $current_file = fopen($dir_path_data . '/' . $data->source_documents[$i]->name,'wb');
                // $text = utf8_encode("aé!");
                // $text = "\xEF\xBB\xBF".$text;
                // $text = "\xEF\xBB\xBF".$data->source_documents[$i]->content;
                // echo $data->source_documents[$i]->content;
                fwrite($current_file,$data->source_documents[$i]->content);
                // fwrite($current_file,$text);
                // fwrite($current_file,utf8_encode($data->source_documents[$i]->content));
                // fwrite($current_file,utf8_decode($data->source_documents[$i]->content));
                fclose($current_file);
            }

            $current_file = fopen($dir_path_data . '/typesystem.xml','wb');
            fwrite($current_file,$data->typesystem_xml);
            fclose($current_file);

            function generate_python_code($tagdefDataSource,$nb_doc,$output_name){
                // $output = '';
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

                    // if($tagdefDataSource[$i] == 3){
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
                                // $line = $line . "\"" . preg_replace("/[\u0300-\u036f]/g","",Normalizer($str,Normalizer::FORM_D)) . "\" : \"" . $tagdefDataSource[$i]->attrs[$j] . "\", ";
                                // $line = $line . "\"" . preg_replace("/[\u0300-\u036f]/g","",normalizer_normalize($str,Normalizer::FORM_D)) . "\" : \"" . $tagdefDataSource[$i]->attrs[$j] . "\", ";
                                // $line = $line . "\"" . preg_replace("/[\u0300-\u036f]/g","",Normalizer::normalize($str,Normalizer::FORM_D)) . "\" : \"" . $tagdefDataSource[$i]->attrs[$j] . "\", ";
                                // $line = $line . "\"" . preg_replace("/[\u0300-\u036f]/g","",normalizer_normalize($str,Normalizer::FORM_D)) . "\" : \"" . $tagdefDataSource[$i]->attrs[$j] . "\", ";
                                // CHANGED SOMETHING HERE AS IT WOULDN'T WORK OTHERWISE, BUT WILL IT MAKE A DIFFERENCE IN COMPARISON TO THE JS VERSION?
                                // $line = $line . "\"" . preg_replace("/[\u0300-\u036f]/g","",$str) . "\" : \"" . $tagdefDataSource[$i]->attrs[$j] . "\", ";
                                // $line = $line . "\"" . preg_replace("/[\u0300-\u036f]/m","",$str) . "\" : \"" . $tagdefDataSource[$i]->attrs[$j] . "\", ";
                                // $line = $line . "\"" . preg_replace("/[\u{0300}-\u{036f}]/m","",$str) . "\" : \"" . $tagdefDataSource[$i]->attrs[$j] . "\", ";
                                $line = $line . "\"" . preg_replace("/[\u{0300}-\u{036f}]/m","",$attr) . "\" : \"" . $tagdefDataSource[$i]->attrs[$j] . "\", ";
                            }
                            // SMALL DIFFERENCE HERE: NOT PUTTING SEMI-COLON IN THE END
                            // $line = $line . "\"" . "}\n";
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
                    // if($tagdefDataSource[$i] == 5){
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
                    // if($tagdefDataSource[$i] == 0){
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
                    // if($tagdefDataSource[$i] == 0){
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
                    // if($tagdefDataSource[$i] == 3){
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

            



            // $python_code_output = shell_exec('python3 ' . $path_to_python);
            // $shell_command = 'cd ' . $dir_path . ' ; python3 split_and_convert.py';
            // $shell_command = 'cd ' . $dir_path . ' && python3 split_and_convert.py';
            // $shell_command = 'cd ' . $dir_path . ' && python3 split_and_convert.py && echo 1 > status.log';
            // $shell_command = 'cd ' . $dir_path . ' && python3 split_and_convert.py ; echo 1 > status.log';
            // $shell_command = 'cd ' . $dir_path . ' && python3 split_and_convert.py'; / BACKUP
            $shell_command = '';
            if(substr(PHP_OS,0,3) == 'WIN'){
                // $shell_command = 'cd ' . $dir_path . ' && start /B python3 split_and_convert.py';
                $shell_command = 'cd ' . $dir_path . ' && start /B python3 split_and_convert.py > out.log';
            }else{
                $shell_command = 'cd ' . $dir_path . ' ; python3 split_and_convert.py &';
            }
            // $shell_command = 'cd ' . $dir_path . ' && python3 split_and_convert.py';
            // echo $shell_command;
            // $python_code_output = shell_exec($shell_command);
            // $open_process = proc_open($shell_command);
            // execInBackground($shell_command);
            // $p = popen($shell_command,"r") // HERE ?
            // pclose($p);
            // $p = proc_open($shell_command,"r") // HERE ?
            // proc_close($p);
            // proc_close(proc_open($shell_command,array(),0)); // HERE ?
            startBackgroundProcess($shell_command);
            // proc_close($p);
            // $python_code_output = shell_exec('echo "test echo"');
            // $python_code_output = shell_exec('dir');
            // echo $python_code;
            // echo $python_code_output;

            // header('Content-type:application/json');
            // echo(substr(php_name(),0,7));
            // echo PHP_OS;
            echo '{"token":"' . $local_sha1_hash .'","timeout":' . (time()+$timeout_ms) . '}';
            // echo 'céline';
            // echo utf8_encode('céline');
            // echo utf8_decode('céline');

            
            $dir_path = sys_get_temp_dir() . '/tmp_inception_converter' . '/' . $local_sha1_hash . '/source';
            // $dir_path = sys_get_temp_dir() . '/tmp_inception_converter' . '/' . $local_sha1_hash . '/source';
            $json_config_file = fopen(sys_get_temp_dir() . '/tmp_inception_converter' . '/' . $local_sha1_hash . '/config.json','w');
            // CHANGING THE JSON FILE HERE ?
            // fwrite($raw_json,strlen($raw_json));
            fwrite($json_config_file,$raw_json);
            fclose($json_config_file);

            http_response_code(200);
        }else{
            http_response_code(405);
        }

        
    }else if($_SERVER['REQUEST_URI'] == '/check_status'){
        $raw_json = file_get_contents('php://input');
        // echo $raw_json;
        try{
            
            $data = json_decode($raw_json);
            // echo $raw_json;
            $dir_path = sys_get_temp_dir() . '/tmp_inception_converter' . '/' . $data->token;

            // header("Content-type:application/json");
            // header("Content-type:application/json");

            if(!is_dir($dir_path)){
                echo '{"status":"unavailable"}';
            }else{
                $log_path = $dir_path . '/status.log';
                if(!is_file($log_path)){
                    // echo '{"status":"in process"}';
                    echo '{"status":"in process","progress":0}';
                }else{
                    $current_file = fopen($log_path,'r');
                    $log_status = fread($current_file,3); // 3 is for up to 100, but it stops before if it doesn't have 3 chars
                    fclose($current_file);
                    if($log_status == '100' || $log_status == 100){
                        echo '{"status":"complete"}';
                        /*
                        $path_to_config = $dir_path . '/config.json';
                        $saved_json_file = fopen($path_to_config,'r');
                        // $saved_json = fread($saved_json_file,filesize($saved_json_file));
                        $saved_json = fread($saved_json_file,filesize($path_to_config));
                        fclose($saved_json_file);
                        $saved_json = json_decode($saved_json);
                        $saved_json->source_documents = [];
                        $current_time = time();
                        $list_of_generated_files = scandir($dir_path . '/source');
                        $i_limit = count($list_of_generated_files);
                        for($i = 0 ; $i < $i_limit ; $i += 1){
                            if(preg_match('/\.xml$/mi',$list_of_generated_files[$i])){
                                
                                // $saved_json->source_documents[count($saved_json->source_documents)] = {
                                //     "name": $list_of_generated_files[$i],
                                //     "format": "xml",
                                //     "state": "NEW",
                                //     "timestamp": null,
                                //     "created": $current_time,
                                //     "updated": $current_time
                                // };
                                
                                $local_obj = new stdClass();
                                $local_obj->name = $list_of_generated_files[$i];
                                // $local_obj->format = 'xml';
                                $local_obj->format = 'xmi-xml1.1';
                                $local_obj->state = 'NEW';
                                $local_obj->timestamp = null;
                                $local_obj->created = $current_time;
                                $local_obj->updated = $current_time;

                                array_push($saved_json->source_documents,$local_obj);
                            }
                        }
                        $default_layers_file = fopen('default_layers.json','r');
                        $default_layers = fread($default_layers_file,filesize('default_layers.json'));
                        fclose($default_layers_file);
                        $saved_json->layers = json_decode($default_layers)->layers;
                        // echo json_encode($saved_json->tagdefDataSource);
                        // echo json_encode($saved_json);
                        $i_limit = count($saved_json->tagdefDataSource);
                        for($i = 0 ; $i < $i_limit ; $i += 1){
                            if($saved_json->tagdefDataSource[$i]->type == 3){
                                // echo $saved_json->layers;
                                $local_obj = clone ($saved_json->layers[0]);
                                $local_obj->name = $saved_json->tagdefDataSource[$i]->tag;
                                $j_limit = count($local_obj->features);
                                for($j = 0 ; $j < $j_limit ; $j += 1){
                                    $local_obj->features[$j]->name = $saved_json->tagdefDataSource[$i]->tag;
                                    $local_obj->features[$j]->uiName = $saved_json->tagdefDataSource[$i]->tag;
                                    $local_obj->features[$j]->description = $saved_json->tagdefDataSource[$i]->tag . ' tag';
                                    $local_obj->features[$j]->project_name = $saved_json->name;
                                }
                                $local_obj->uiName = $saved_json->tagdefDataSource[$i]->tag;
                                $local_obj->project_name = $saved_json->name;
                                array_push($saved_json->layers,$local_obj);
                            }
                        }
                        $saved_json->slug = null;
                        $saved_json->description = null;
                        $saved_json->mode = "ANNOTATION";
                        $saved_json->disableExport = false;
                        $saved_json->script_direction = 'LTR';
                        $saved_json->created = $current_time;
                        $saved_json->updated = $current_time;
                        $saved_json->anonymous_curation = false;
                        $saved_json->{'default-preferences'} = [];
                        $saved_json->knowledge_bases = [];
                        $saved_json->external_search = [];
                        // $cw = new stdClass();
                        // TO COMPLETE HERE ?
                        // $saved_json->curation_workflow = $cw;
                        $saved_json->curation_workflow = '{
                            "id" : 30,
                            "project" : {
                              "id" : 30,
                              "name" : "project1652950264205",
                              "slug" : "project1652950264205",
                              "description" : null,
                              "mode" : "annotation",
                              "version" : 1,
                              "disableExport" : false,
                              "scriptDirection" : "LTR",
                              "created" : 1652950922,
                              "updated" : 1652950922,
                              "state" : "ANNOTATION_IN_PROGRESS",
                              "anonymousCuration" : false
                            },
                            "mergeStrategy" : "completeAgreementNonStacked",
                            "mergeStrategyTraits" : null
                          }'
                        $saved_json->project_users = [];
                        $saved_json->recommenders = [];
                        $saved_json->gazeteers = [];
                        $wm = new stdClass();
                        $wm->traits = null;
                        $wm->type = 'matrix';
                        $saved_json->workload_manager = $wm; 
                        unset($saved_json->python_code);
                        unset($saved_json->typesystem_xml);
                        unset($saved_json->target_doc_count);
                        unset($saved_json->tagdefDataSource);
                        unset($saved_json->tags_roles);
                        $saved_json = json_encode($saved_json, JSON_PRETTY_PRINT);
                        $saved_json_file = fopen($path_to_config,'w');
                        fwrite($saved_json_file,$saved_json);
                        fclose($saved_json_file);
                        */

                        $path_to_config = $dir_path . '/config.json';
                        $saved_json_file = fopen($path_to_config,'r');
                        // $saved_json = fread($saved_json_file,filesize($saved_json_file));
                        $saved_json = fread($saved_json_file,filesize($path_to_config));
                        fclose($saved_json_file);
                        $saved_json = json_decode($saved_json);

                        $project_template = fopen('project_template.json','r');
                        $project = fread($project_template,filesize('project_template.json'));
                        fclose($project_template);
                        $project = json_decode($project);

                        $project->source_documents = [];
                        // $project->name = $saved_json->project_name;
                        $project->name = $saved_json->name;
                        $current_time = time();
                        $list_of_generated_files = scandir($dir_path . '/source');
                        $i_limit = count($list_of_generated_files);
                        for($i = 0 ; $i < $i_limit ; $i += 1){
                            if(preg_match('/\.xml$/mi',$list_of_generated_files[$i])){
                                
                                // $saved_json->source_documents[count($saved_json->source_documents)] = {
                                //     "name": $list_of_generated_files[$i],
                                //     "format": "xml",
                                //     "state": "NEW",
                                //     "timestamp": null,
                                //     "created": $current_time,
                                //     "updated": $current_time
                                // };
                                
                                $local_obj = new stdClass();
                                $local_obj->name = $list_of_generated_files[$i];
                                // $local_obj->format = 'xml';
                                $local_obj->format = 'xmi-xml1.1';
                                $local_obj->state = 'NEW';
                                $local_obj->timestamp = null;
                                $local_obj->created = $current_time;
                                $local_obj->updated = $current_time;

                                // array_push($saved_json->source_documents,$local_obj);
                                array_push($project->source_documents,$local_obj);
                            }
                        }

                        $i_limit = count($saved_json->tagdefDataSource);
                        for($i = 0 ; $i < $i_limit ; $i += 1){
                            if($saved_json->tagdefDataSource[$i]->type == 3){
                                // echo $saved_json->layers;
                                $local_obj = clone ($project->layers[0]);
                                // $local_obj->name = $saved_json->tagdefDataSource[$i]->tag;
                                $local_obj->name = 'webanno.custom.' . $saved_json->tagdefDataSource[$i]->tag;
                                
                                $local_obj->features = [];
                                
                                // $j_limit = count($local_obj->features);
                                $j_limit = count($saved_json->tagdefDataSource[$i]->attrs);
                                for($j = 0 ; $j < $j_limit ; $j += 1){
                                    /*
                                    // $local_obj->features[$j]->name = $saved_json->tagdefDataSource[$i]->tag;
                                    $local_obj->features[$j]->name = 'webanno.custom.' . $saved_json->tagdefDataSource[$i]->tag;
                                    $local_obj->features[$j]->uiName = $saved_json->tagdefDataSource[$i]->tag;
                                    $local_obj->features[$j]->description = $saved_json->tagdefDataSource[$i]->tag . ' tag';
                                    */

                                    /*
                                    $local_obj->features[$j]->name = $saved_json->tagdefDataSource[$i]->attrs[$j];
                                    $local_obj->features[$j]->uiName = $saved_json->tagdefDataSource[$i]->attrs[$j];
                                    $local_obj->features[$j]->description = $saved_json->tagdefDataSource[$i]->attrs[$j];
                                    $local_obj->features[$j]->type = 'uima.cas.String';

                                    $local_obj->features[$j]->project_name = $saved_json->name;
                                    */

                                    // $loop_obj = new stdClass();
                                    $loop_obj = clone ($project->layers[0]->features[0]);

                                    $loop_obj->name = $saved_json->tagdefDataSource[$i]->attrs[$j];
                                    $loop_obj->uiName = $saved_json->tagdefDataSource[$i]->attrs[$j];
                                    $loop_obj->description = $saved_json->tagdefDataSource[$i]->attrs[$j];
                                    $loop_obj->type = 'uima.cas.String';

                                    $loop_obj->project_name = $saved_json->name;

                                    array_push($local_obj->features,$loop_obj);
                                }
                                
                                
                                // $local_obj->features = [];
                                
                                // unset($local_obj->features);
                                $local_obj->uiName = $saved_json->tagdefDataSource[$i]->tag;
                                // $local_obj->project_name = $saved_json->name;
                                // array_push($saved_json->layers,$local_obj);
                                $local_obj->project_name = $project->name;
                                $local_obj->built_in = false;
                                $local_obj->allow_stacking = true;
                                $local_obj->cross_sentence = true;
                                $local_obj->anchoring_mode = "CHARACTERS";
                                $local_obj->overlap_mode = "ANY_OVERLAP";
                                $local_obj->lock_to_token_offset = false;
                                $local_obj->multiple_tokens = true; // true ?
                                array_push($project->layers,$local_obj);














                                $local_obj = clone ($project->tag_sets[0]);
                                // $local_obj->name = $saved_json->tagdefDataSource[$i]->tag;
                                $local_obj->name = 'webanno.custom.' . $saved_json->tagdefDataSource[$i]->tag;
                                $local_obj->description = $saved_json->tagdefDataSource[$i]->tag;
                                $local_obj->language = 'mul';
                                $tag_obj = new stdClass();
                                // $tag_obj->tag_name = $saved_json->tagdefDataSource[$i]->tag;
                                $tag_obj->tag_name = 'webanno.custom.' . $saved_json->tagdefDataSource[$i]->tag;
                                $tag_obj->tag_description = $saved_json->tagdefDataSource[$i]->tag;
                                $local_obj->tags = array($tag_obj);
                                $local_obj->create_tag = false;
                                array_push($project->tag_sets,$local_obj);
                            }
                        }
                        
                        // REMOVED FOR TESTING
                        $i_limit = count($project->layers);
                        for($i = 0 ; $i < $i_limit ; $i += 1){
                            $project->layers[$i]->project_name = $project->name;
                            // $project->layers[$i]->project_name = $saved_json->name;
                            $j_limit = count($project->layers[$i]->features);
                            for($j = 0 ; $j < $j_limit ; $j += 1){
                                // $project->layers[$i]->features[$j]->project_name = $saved_json->name;
                                $project->layers[$i]->features[$j]->project_name = $project->name;
                            }
                        }
                        



                        $project->created = $current_time;
                        $project->updated = $current_time;
                        $project->curation_workflow->project->name = $project->name;
                        $project->curation_workflow->project->slug = $project->slug;
                        $project->curation_workflow->project->created = $project->created;
                        $project->curation_workflow->project->updated = $project->updated;














                        $zip = new ZipArchive();
                        $zip->open($dir_path . '/project_archive.zip', ZIPARCHIVE::CREATE);
                        $zip->addEmptyDir('source');
                        
                        $list_of_generated_files = scandir($dir_path . '/source');
                        $i_limit = count($list_of_generated_files);
                        for($i = 0 ; $i < $i_limit ; $i += 1){
                            if(preg_match('/\.xml$/mi',$list_of_generated_files[$i])){
                                $zip->addFile($dir_path .'/source/' . $list_of_generated_files[$i], 'source/' . $list_of_generated_files[$i]);
                            }
                        }
                        // $zip->addFile($dir_path . '/source/config.json', 'source/config.json');
                        // $zip->addFromString('config.json',$saved_json);
                        // $zip->addFromString('config.json',json_encode($project,JSON_PRETTY_PRINT));
                        $zip->addFromString('exportedproject.json',json_encode($project,JSON_PRETTY_PRINT));
                        $zip->close();

                    }else{
                        // echo '{"status":"error","message":"' . $log_status . '"}';
                       echo '{"status":"in process","progress":' . $log_status . '}';
                    }
                }
            }
            
            http_response_code(200);
        }catch(Exception $e){
            http_response_code(500);
        }
    }else if($_SERVER['REQUEST_URI'] == '/download_project'){
        header("Content-type:application/zip");
        header("Content-Transfer-Encoding: Binary"); // ?
        header("Content-disposition:attachment;filename=project_archive.zip");
        $raw_json = file_get_contents('php://input');
        $data = json_decode($raw_json);
        $data->token = preg_replace('/[^a-zA-Z0-9]/mi','',$data-token);
        header("Content-length:" . filesize(sys_get_temp_dir() . '/tmp_inception_converter' . '/' . $data->token . 'project_archive.zip'));
        // $dir_path = 'tmp/' . $data->token . '/target';
        /*
        $dir_path = 'tmp/' . $data->token . '/source';
        $json_config_file = fopen('tmp/' . $data->token . '/config.json','w');
        // fwrite($raw_json,strlen($raw_json));
        fwrite($json_config_file,$raw_json);
        fclose($json_config_file);
        */
        /*
        $zip = new ZipArchive();
        $zip_path = 'tmp/' . $data->token . '/project_archive.zip';
        $zip->open($zip_path, ZIPARCHIVE::CREATE);
        $files_list = scandir($dir_path);
        $xml_files_list = array();
        $i_limit = count($files_list);
        for($i = 0 ; $i < $i_limit ; $i += 1){
            $current_file_name = $files_list[$i];
            // $current_file_extension = substr($current_file_name,count($current_file_name)-5,4);
            // $current_file_extension = substr($current_file_name,strlen($current_file_name)-5,4);
            // echo 'file extension: ' . $current_file_extension . '\n';
            // $current_file_extension = substr($current_file_name,strlen($current_file_name)-4,4);
            // if($current_file_extension == '.xml'){
            // if(preg_match('/\\.xml$/i',$current_file_name)){
            if(preg_match("/\\.xml\$/i",$current_file_name)){
                $xml_files_list[count($xml_files_list)] = $current_file_name;
                // echo 'found: ' . $current_file_name . "\n";
                // $zip.addFile($dir_path,$current_file_name);
                $zip->addFile($dir_path,$current_file_name);
            }
            // echo $current_file_name . "\n";
        }
        $zip->close();
        // echo $zip;
        // echo file_get_contents($zip_path);
        readfile($zip_path);
        */
        readfile(sys_get_temp_dir() . '/tmp_inception_converter' . '/' . $data->token . '/project_archive.zip');
        // readfile('tmp/' . $data->token . '/project_archive.zip');
        // http_response_code(200);

        /*
        function recursive_clearning($origin_dir_path){
            $origin_dir_path = preg_replace('/\.+/mi','.',$origin_dir_path);
            $current_dir = opendir($origin_dir_path);
            $sub_content = scandir($origin_dir_path);
            $i_limit = count($sub_content);
            for($i = 0 ; $i < $i_limit ; $i += 1){
                // $new_path = $origin_dir_path . '/' . $sub_content[$i];
                $new_path = $origin_dir_path . "\\" . $sub_content[$i];
                if(is_file($new_path)){
                    unlink($new_path);
                }else{
                    recursive_clearning($new_path);
                }
            }
            rmdir($origin_dir_path);
        }

        recursive_clearning('tmp' . "\\" . $data->token);
        // $tmp_dirs = scandir()
        */


        
        http_response_code(200);
        // exit;
    }else{
    // }else if(preg_match('/download_project\.php$/',$_SERVER['REQUEST_URI'])){
        /*
        // WORKS, BUT TRYING WITH GET
        header("Content-type:application/zip");
        header("Content-disposition:attachment;filename=project_archive.zip");
        header("Content-length:" . filesize('tmp/6431b5d169dca95a1ad716ec06868828bf61a749/project_archive.zip'));
        readfile('tmp/6431b5d169dca95a1ad716ec06868828bf61a749/project_archive.zip');
        exit;
        // http_response_code(404);
        */
        /*
        // $path_to_file = $_SERVER['REQUEST_URI'];
        $path_to_file = sys_get_temp_dir() . '/tmp_inception_converter' . $_SERVER['REQUEST_URI'];
        $path_to_file = preg_replace('/\.+/mi','.',$path_to_file);
        // $path_to_file = substr($path_to_file,1);
        // echo $path_to_file;
        */

        $raw_json = file_get_contents('php://input');
        $data = json_decode($raw_json);
        $path_to_file = sys_get_temp_dir() . '/tmp_inception_converter' . '/' . $data->token . '/project_archive.zip';
        $path_to_file = preg_replace('/\.+/mi','.',$path_to_file);

        if(preg_match('/\.zip$/mi',$path_to_file) && is_file($path_to_file)){
            // header("Content-type:application/zip");
            header("Content-Type:application/zip");
            // header("Content-disposition:attachment;filename=project_archive.zip");
            // header('Content-disposition:attachment;filename="project_archive.zip"');
            header('Content-Disposition:attachment;filename="project_archive.zip"');
            // header("Content-length:" . filesize($path_to_file));
            header("Content-Length:" . filesize($path_to_file));
            readfile($path_to_file);
            // exit;
            http_response_code(200);



            /*
            function recursive_clearning($origin_dir_path){
                $origin_dir_path = preg_replace('/\.+/mi','.',$origin_dir_path);
                $current_dir = opendir($origin_dir_path);
                $sub_content = scandir($origin_dir_path);
                $i_limit = count($sub_content);
                for($i = 0 ; $i < $i_limit ; $i += 1){
                    // $new_path = $origin_dir_path . '/' . $sub_content[$i];
                    $new_path = $origin_dir_path . "\\" . $sub_content[$i];
                    if(is_file($new_path)){
                        unlink($new_path);
                    }else{
                        recursive_clearning($new_path);
                    }
                }
                rmdir($origin_dir_path);
            }

            // recursive_clearning('tmp' . "\\" . $data->token);
            recursive_clearning(sys_get_temp_dir() . '/tmp_inception_converter' . '/' . $data->token);
            // $tmp_dirs = scandir()
            */
            // http_response_code(200);
        }else{
            http_response_code(404);
        }
    }
?>