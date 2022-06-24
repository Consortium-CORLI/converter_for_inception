<?php
    $raw_json = file_get_contents('php://input');
    try{
        
        $data = json_decode($raw_json);
        // $dir_path = sys_get_temp_dir() . '/tmp_inception_converter' . '/' . $data->token;
	$dir_path = '/sites' . '/corliweb' . '/tmp' . '/tmp_inception_converter' . '/' . $data->token;

        if(!is_dir($dir_path)){
            echo '{"status":"unavailable"}';
        }else{
            $log_path = $dir_path . '/status.log';
            if(!is_file($log_path)){
                echo '{"status":"in process","progress":0}';
            }else{
                $current_file = fopen($log_path,'r');
                $log_status = fread($current_file,3); // 3 is for up to 100, but it stops before if it doesn't have 3 chars
                fclose($current_file);
                if($log_status == '100' || $log_status == 100){
                    echo '{"status":"complete"}';

                    $path_to_config = $dir_path . '/config.json';
                    $saved_json_file = fopen($path_to_config,'r');
                    $saved_json = fread($saved_json_file,filesize($path_to_config));
                    fclose($saved_json_file);
                    $saved_json = json_decode($saved_json);

                    $project_template = fopen('project_template.json','r');
                    $project = fread($project_template,filesize('project_template.json'));
                    fclose($project_template);
                    $project = json_decode($project);

                    $project->source_documents = [];
                    $project->name = $saved_json->name;
                    $current_time = time();
                    $list_of_generated_files = scandir($dir_path . '/source');
                    $i_limit = count($list_of_generated_files);
                    for($i = 0 ; $i < $i_limit ; $i += 1){
                        if(preg_match('/\.xml$/mi',$list_of_generated_files[$i])){
                            
                            $local_obj = new stdClass();
                            $local_obj->name = $list_of_generated_files[$i];
                            // $local_obj->format = 'xml';
                            $local_obj->format = 'xmi-xml1.1';
                            $local_obj->state = 'NEW';
                            $local_obj->timestamp = null;
                            $local_obj->created = $current_time;
                            $local_obj->updated = $current_time;

                            array_push($project->source_documents,$local_obj);
                        }
                    }

                    $i_limit = count($saved_json->tagdefDataSource);
                    for($i = 0 ; $i < $i_limit ; $i += 1){
                        if($saved_json->tagdefDataSource[$i]->type == 3){
                            $local_obj = clone ($project->layers[0]);
                            $local_obj->name = 'webanno.custom.' . $saved_json->tagdefDataSource[$i]->tag;
                            
                            $local_obj->features = [];
                            
                            // $j_limit = count($local_obj->features);
                            $j_limit = count($saved_json->tagdefDataSource[$i]->attrs);
                            for($j = 0 ; $j < $j_limit ; $j += 1){
                                $loop_obj = clone ($project->layers[0]->features[0]);

                                // $loop_obj->name = $saved_json->tagdefDataSource[$i]->attrs[$j];
                                $loop_obj->name = preg_replace('/[^a-zA-Z0-9_]/mi','_',$saved_json->tagdefDataSource[$i]->attrs[$j]);
                                $loop_obj->uiName = $saved_json->tagdefDataSource[$i]->attrs[$j];
                                $loop_obj->description = $saved_json->tagdefDataSource[$i]->attrs[$j];
                                $loop_obj->type = 'uima.cas.String';

                                $loop_obj->project_name = $saved_json->name;

                                array_push($local_obj->features,$loop_obj);
                            }
                            
                            $local_obj->uiName = $saved_json->tagdefDataSource[$i]->tag;
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
                            $local_obj->name = 'webanno.custom.' . $saved_json->tagdefDataSource[$i]->tag;
                            $local_obj->description = $saved_json->tagdefDataSource[$i]->tag;
                            $local_obj->language = 'mul';
                            $tag_obj = new stdClass();
                            $tag_obj->tag_name = 'webanno.custom.' . $saved_json->tagdefDataSource[$i]->tag;
                            $tag_obj->tag_description = $saved_json->tagdefDataSource[$i]->tag;
                            $local_obj->tags = array($tag_obj);
                            $local_obj->create_tag = false;
                            array_push($project->tag_sets,$local_obj);
                        }
                    }
                    
                    $i_limit = count($project->layers);
                    for($i = 0 ; $i < $i_limit ; $i += 1){
                        $project->layers[$i]->project_name = $project->name;
                        $j_limit = count($project->layers[$i]->features);
                        for($j = 0 ; $j < $j_limit ; $j += 1){
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
                    $zip->addFile($dir_path . '/data' . '/typesystem.xml','typesystem.xml');
                    $zip->addFile('/sites' . '/corliweb' . '/www' . '/web_main' . '/stanza_parse.py','stanza_parse.py');
                    $zip->addFile('/sites' . '/corliweb' . '/www' . '/web_main' . '/glozz_to_uima.py','glozz_to_uima.py');
                    $zip->addFile('/sites' . '/corliweb' . '/www' . '/web_main' . '/uima_to_glozz.py','uima_to_glozz.py');
                    $zip->addFile('/sites' . '/corliweb' . '/www' . '/web_main' . '/segmentation_check3.py','segmentation_check.py');
                    $zip->addFromString('exportedproject.json',json_encode($project,JSON_PRETTY_PRINT));
                    $zip->close();

                }else{
                   echo '{"status":"in process","progress":' . $log_status . '}';
                }
            }
        }
        
        http_response_code(200);
    }catch(Exception $e){
        http_response_code(500);
    }
?>
