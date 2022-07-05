<?php
    $raw_json = file_get_contents('php://input');
    $data = json_decode($raw_json);
    $data->token = preg_replace('/[^a-zA-Z0-9]/mi','',$data->token);
    // $path_to_file = sys_get_temp_dir() . '/tmp_inception_converter' . '/' . $data->token . '/reconverted.zip';
    $path_to_file = '/sites' . '/corliweb' . '/tmp' . '/tmp_inception_converter' . '/' . $data->token . '/reconverted.zip';
    $path_to_file = preg_replace('/\.+/mi','.',$path_to_file);

    if(preg_match('/\.zip$/mi',$path_to_file) && is_file($path_to_file)){
        header("Content-Type:application/zip");
        header('Content-Disposition:attachment;filename="project_archive.zip"');
        header("Content-Length:" . filesize($path_to_file));
        readfile($path_to_file);

        function recursive_cleaning($local_path){
            if(is_file($local_path)){
                unlink($local_path);
            }elseif(is_dir($local_path)){
                $local_content = scandir($local_path);
                $dir_to_remove = true;
                $i_limit = count($local_content);
                for($i = 0 ; $i < $i_limit ; $i += 1){
/*
                    if(preg_match('/.*\.trace$/mi',$local_content[$i])){
                        $dir_to_remove = false;
                    }else{
*/
			if(!(preg_match('/^\..*/mi',$local_content[$i]))){
                        	recursive_cleaning($local_path . '/' . $local_content[$i]);
			}
/*
                    }
*/
                }
                if($dir_to_remove){
                    rmdir($local_path);
                }
            }
        }

        /*recursive_cleaning('/sites' . '/corliweb' . '/tmp' . '/tmp_inception_converter' . '/' . $data->token . '/__current_inception_export_to_reconvert.zip');*/
        recursive_cleaning('/sites' . '/corliweb' . '/tmp' . '/tmp_inception_converter' . '/' . $data->token);

        /*$path_cleaning = '/sites' . '/corliweb' . '/tmp' . '/tmp_inception_converter' . '/' . $data->token . '/';*/
        // if(!(file_exists($path_cleaning . 'reconv_err.log'))){
	// 	$f_err = fopen('/sites' . '/corliweb' . '/tmp' . '/tmp_inception_converter' . '/' . $data->token . '/' . 'f_err.log','a');
	// 	fwrite($f_err,'cannot find file ' . $path_cleaning . 'reconv_err.log');
	// 	fclose($f_err);
	// }
	// $f_log = fopen('/sites' . '/corliweb' . '/tmp' . '/tmp_inception_converter' . '/' . $data->token . '/' . 'f_log.log','a');
	// fwrite($f_log,$path_cleaning . 'reconv_err.log' . "\n");
	// fclose($f_log);
	
	// THINGS TO REENABLE HERE
/*
	unlink($path_cleaning . 'reconv_err.log');
        unlink($path_cleaning . 'reconv_out.log');
        unlink($path_cleaning . 'current_inception_export_to_reconvert.zip');
        unlink($path_cleaning . 'reconverted.zip');

        $path_cleaning_content = scandir($path_cleaning);
        $i_limit = count($path_cleaning_content);
        for($i = 0 ; $i < $i_limit ; $i += 1){
            $local_path = $path_cleaning . $path_cleaning_content[$i];
            if(is_file($local_path)){
                unlink($local_path);
            }
        }
*/
        http_response_code(200);
    }else{
        http_response_code(404);
    }
?>
