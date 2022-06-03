<?php
    $raw_json = file_get_contents('php://input');
    $data = json_decode($raw_json);
    $data->token = preg_replace('/[^a-zA-Z0-9]/mi','',$data->token);
    // $path_to_file = sys_get_temp_dir() . '/tmp_inception_converter' . '/' . $data->token . '/project_archive.zip';
    $path_to_file = '/sites' . '/corliweb' . '/tmp' . '/tmp_inception_converter' . '/' . $data->token . '/project_archive.zip';
    $path_to_file = preg_replace('/\.+/mi','.',$path_to_file);

    if(preg_match('/\.zip$/mi',$path_to_file) && is_file($path_to_file)){
        header("Content-Type:application/zip");
        header('Content-Disposition:attachment;filename="project_archive.zip"');
        header("Content-Length:" . filesize($path_to_file));
        readfile($path_to_file);

        // function recursive_cleaning($local_path){
        //     if(is_file($local_path)){
        //         unlink($local_path);
        //     }elseif(is_dir($local_path)){
        //         $local_content = scandir($local_path);
        //         $dir_to_remove = true;
        //         $i_limit = count($local_content);
        //         for($i = 0 ; $i < $i_limit ; $i += 1){
        //             if(preg_match('/.*\.trace$/mi',$local_content[$i])){
        //                 $dir_to_remove = false;
        //             }else{
        //                 recursive_cleaning($local_path . '/' . $local_content[$i]);
        //             }
        //         }
        //         if($dir_to_remove){
        //             rmdir($local_path);
        //         }
        //     }
        // }

        // recursive_cleaning('/sites' . '/corliweb' . '/tmp' . '/tmp_inception_converter' . '/' . $data->token . '/data');

        $path_cleaning = '/sites' . '/corliweb' . '/tmp' . '/tmp_inception_converter' . '/' . $data->token . '/';
        unlink($path_cleaning . 'config.json');
        unlink($path_cleaning . 'status.log');
        unlink($path_cleaning . 'err.log');
        unlink($path_cleaning . 'out.log');
        unlink($path_cleaning . 'split_and_convert.py');
        unlink($path_cleaning . 'project_archive.zip');

        
        $path_cleaning = '/sites' . '/corliweb' . '/tmp' . '/tmp_inception_converter' . '/' . $data->token . '/data' . '/';
        $path_cleaning_content = scandir($path_cleaning);
        $i_limit = count($path_cleaning_content);
        for($i = 0 ; $i < $i_limit ; $i += 1){
            unlink($path_cleaning . '/' . $path_cleaning_content[$i]);
        }
        rmdir($path_cleaning);

        $path_cleaning = '/sites' . '/corliweb' . '/tmp' . '/tmp_inception_converter' . '/' . $data->token . '/source' . '/';
        $path_cleaning_content = scandir($path_cleaning);
        $i_limit = count($path_cleaning_content);
        for($i = 0 ; $i < $i_limit ; $i += 1){
            if(!(preg_match('/.*\.trace$/mi',$path_cleaning_content[$i]))){
                unlink($path_cleaning . '/' . $path_cleaning_content[$i]);
            }
        }

        http_response_code(200);
    }else{
        http_response_code(404);
    }
?>
