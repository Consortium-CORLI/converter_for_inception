<?php
    /*
    $raw_zip = file_get_contents('php://input');

    $sha3_224_hash = hash('sha3-224',$raw_zip . time());
    
    // echo $raw_json;
    // $path = sys_get_temp_dir() . '/tmp_inception_converter' . '/current_inception_export_to_reconvert.zip'; 
    // $path = sys_get_temp_dir() . '/tmp_inception_converter' . '/' . $sha3_224_hash . '/current_inception_export_to_reconvert.zip'; 
    mkdir(sys_get_temp_dir() . '/tmp_inception_converter' . '/' . $sha3_224_hash); 
    $path = sys_get_temp_dir() . '/tmp_inception_converter' . '/' . $sha3_224_hash . '/current_inception_export_to_reconvert.zip'; 
    $file = fopen($path,'w');
    fwrite($file,$raw_zip);
    fclose($file);
    echo '{"token":"' . $sha3_224_hash . '"}';
    http_response_code(200);
    */







    /*
    $raw_json = file_get_contents('php://input');
    $obj = json_decode($raw_json);
    $obj->token = preg_replace('/[^a-zA-Z0-9]/mi','',$obj->token);
    echo $obj->token;
    $path = sys_get_temp_dir() . '/tmp_inception_converter' . '/' . $obj->token . '/current_inception_export_to_reconvert.zip';
    $zip_file = fopen($path,'w');
    fwrite($zip_file,$obj->zip);
    fclose($zip_file);
    http_response_code(200);
    */











    $raw_zip = file_get_contents('php://input');

    // $sha3_224_hash = hash('sha3-224',$raw_zip . time());
    $token = hash('sha3-224',$raw_zip . time());
    mkdir('/sites' . '/corliweb' . '/tmp' . '/tmp_inception_converter' . '/' . $token);
    
    // echo $raw_json;
    // $path = sys_get_temp_dir() . '/tmp_inception_converter' . '/current_inception_export_to_reconvert.zip'; 
    // $path = sys_get_temp_dir() . '/tmp_inception_converter' . '/' . $sha3_224_hash . '/current_inception_export_to_reconvert.zip'; 
    // mkdir(sys_get_temp_dir() . '/tmp_inception_converter' . '/' . $sha3_224_hash); 
    // $path = sys_get_temp_dir() . '/tmp_inception_converter' . '/' . $sha3_224_hash . '/current_inception_export_to_reconvert.zip'; 
    // $path_token_memory = sys_get_temp_dir() . '/tmp_inception_converter' . '/token_memory.json';

/*
    $path_token_memory = '/sites' . '/corliweb' . '/tmp' . '/tmp_inception_converter' . '/token_memory.json';
    $token_file = fopen($path_token_memory,'r');
    $raw_json = fread($token_file,filesize($path_token_memory));
    fclose($token_file);
    $token = json_decode($raw_json)->token;
    $token = preg_replace('/\.+/mi','.',$token);
*/
    // $path = sys_get_temp_dir() . '/tmp_inception_converter' . '/' . $token . '/current_inception_export_to_reconvert.zip'; 
    $path = '/sites' . '/corliweb' . '/tmp' . '/tmp_inception_converter' . '/' . $token . '/current_inception_export_to_reconvert.zip';
    $file = fopen($path,'w');
    fwrite($file,$raw_zip);
    fclose($file);












    $shell_command = '';
    if(substr(PHP_OS,0,3) == 'WIN'){
        $shell_command = 'cd ' . sys_get_temp_dir() . '/tmp_inception_converter' . '/' . $token . ' && python3 ../export8_vALT.py';
    }else{
        // $shell_command = 'cd ' . sys_get_temp_dir() . '/tmp_inception_converter' . '/' . $token . ' ; python3 ../export8_vALT.py';
        // $shell_command = 'cd ' . sys_get_temp_dir() . '/tmp_inception_converter' . '/' . $token . ' ; source /sites/corliweb/www/python_venv_convinception/bin/activate ; export PYTHONIOENCODING=UTF-8 ; export LANG=fr_FR.UTF-8 ; python3 /sites/corliweb/www/web_main/export8_vALT.py';
	$shell_command = 'cd ' . '/sites' . '/corliweb' . '/tmp' . '/tmp_inception_converter' . '/' . $token . ' ; source /sites/corliweb/www/python_venv_convinception/bin/activate ; export PYTHONIOENCODING=UTF-8 ; export LANG=fr_FR.UTF-8 ; env python3 /sites/corliweb/www/web_main/export8_vALT_autover.py';
    }
    shell_exec($shell_command);






    $zip = new ZipArchive();
    // $zip->open('./reconverted.zip', ZIPARCHIVE::CREATE);
    // $zip->open(sys_get_temp_dir() . '/tmp_inception_converter' . '/' . $token . '/reconverted.zip', ZIPARCHIVE::CREATE);
    $zip->open('/sites' . '/corliweb' . '/tmp' . '/tmp_inception_converter' . '/' . $token . '/reconverted.zip',ZIPARCHIVE::CREATE);
    $zip->addEmptyDir('source');
    
    $found_files = '';
    $all_files = '';

    // $list_of_generated_files = scandir('.');
    // $list_of_generated_files = scandir(sys_get_temp_dir() . '/tmp_inception_converter' . '/' . $token);
    $list_of_generated_files = scandir('/sites' . '/corliweb' . '/tmp' . '/tmp_inception_converter' . '/' . $token);
    $i_limit = count($list_of_generated_files);
    for($i = 0 ; $i < $i_limit ; $i += 1){
        if(preg_match('/^inception_export_[0-9]{4}\-[0-9]{1,2}\-[0-9]{1,2}(_[0-9]+)?_file[0-9]+(_.*)?\.xml$/mi',$list_of_generated_files[$i])){
            // $zip->addFile('./' . $list_of_generated_files[$i], 'source/' . $list_of_generated_files[$i]);
            // $zip->addFile(sys_get_temp_dir() . '/tmp_inception_converter' . '/' . $token . '/' . $list_of_generated_files[$i], 'source/' . $list_of_generated_files[$i]);
            $zip->addFile('/sites' . '/corliweb' . '/tmp' . '/tmp_inception_converter' . '/' . $token . '/' . $list_of_generated_files[$i], 'source/' . $list_of_generated_files[$i]);
            $found_files = $found_files . $list_of_generated_files[$i] . ', ';
        }
        $all_files = $all_files . $list_of_generated_files[$i] . ', ';
    }
    // $zip->addFromString('exportedproject.json',json_encode($project,JSON_PRETTY_PRINT));
    $zip->close();

















    echo '{"token":"' . $token . '", "found_files":"' . $found_files . '", "all_files":"' . $all_files . '"}';
    http_response_code(200);
?>
