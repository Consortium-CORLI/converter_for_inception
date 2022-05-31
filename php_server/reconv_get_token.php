<?php
    $raw_json = file_get_contents('php://input');
    $data = json_decode($raw_json);
    $data->token = preg_replace('/[^a-zA-Z0-9]/mi','',$data->token);
    $obj = new stdClass();
    $obj->token = $data->token;
    // $path = sys_get_temp_dir() . '/tmp_inception_converter' . '/token_memory.json';
    $path = '/sites' . '/corliweb' . '/tmp' . '/tmp_inception_converter' . '/token_memory.json';
    $file = fopen($path,'w');
    fwrite($file,json_encode($obj));
    fclose($file);
    http_response_code(200);
?>
