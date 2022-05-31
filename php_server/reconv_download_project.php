<?php
    $raw_json = file_get_contents('php://input');
    $data = json_decode($raw_json);
    // $path_to_file = sys_get_temp_dir() . '/tmp_inception_converter' . '/' . $data->token . '/reconverted.zip';
    $path_to_file = '/sites' . '/corliweb' . '/tmp' . '/tmp_inception_converter' . '/' . $data->token . '/reconverted.zip';
    $path_to_file = preg_replace('/\.+/mi','.',$path_to_file);

    if(preg_match('/\.zip$/mi',$path_to_file) && is_file($path_to_file)){
        header("Content-Type:application/zip");
        header('Content-Disposition:attachment;filename="project_archive.zip"');
        header("Content-Length:" . filesize($path_to_file));
        readfile($path_to_file);
        http_response_code(200);
    }else{
        http_response_code(404);
    }
?>
