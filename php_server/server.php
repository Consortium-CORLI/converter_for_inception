<?php
    if($_SERVER['REQUEST_URI'] == '/split_and_convert'){
        $timeout_ms = 86400 * 1000; // ONE DAY
        $tmp_dir = 'tmp';
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
            // $dir_path = $tmp_dir . '/' . $local_sha1_hash;
            $dir_path = $tmp_dir . '\\' . $local_sha1_hash;
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

            // echo $raw_json;
            $python_code = $data->python_code;
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

            
            $dir_path = 'tmp/' . $local_sha1_hash . '/source';
            $json_config_file = fopen('tmp/' . $local_sha1_hash . '/config.json','w');
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
            $dir_path = 'tmp/' . $data->token;

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
        header("Content-disposition:attachment;filename=project_archive.zip");
        $raw_json = file_get_contents('php://input');
        $data = json_decode($raw_json);
        header("Content-length:" . filesize('tmp/' . $data->token . 'project_archive.zip'));
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
        readfile('tmp/' . $data->token . '/project_archive.zip');
        http_response_code(200);
        // exit;
    }else{
        /*
        // WORKS, BUT TRYING WITH GET
        header("Content-type:application/zip");
        header("Content-disposition:attachment;filename=project_archive.zip");
        header("Content-length:" . filesize('tmp/6431b5d169dca95a1ad716ec06868828bf61a749/project_archive.zip'));
        readfile('tmp/6431b5d169dca95a1ad716ec06868828bf61a749/project_archive.zip');
        exit;
        // http_response_code(404);
        */
        $path_to_file = $_SERVER['REQUEST_URI'];
        $path_to_file = preg_replace('/\.+/mi','.',$path_to_file);
        $path_to_file = substr($path_to_file,1);
        // echo $path_to_file;

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
        }else{
            http_response_code(404);
        }
    }
?>