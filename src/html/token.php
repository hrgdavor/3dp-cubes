<?php


$CLIENT_ID = 'e6bd1aaa69a9630cdd56';
$CLIENT_SECRET = '0652f4eb5fa9e7f3f573e906bcff0653294692ed';

header('Access-Control-Allow-Origin: *');

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL,"https://github.com/login/oauth/access_token");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept: application/json'));
curl_setopt($ch, CURLOPT_POSTFIELDS,
            "code=".$_GET['code']."&client_id=".$CLIENT_ID."&client_secret=".$CLIENT_SECRET);

// In real life you should use something like:
// curl_setopt($ch, CURLOPT_POSTFIELDS, 
//          http_build_query(array('postvar1' => 'value1')));

// Receive server response ...
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$resp =  curl_exec($ch);

if($resp) echo $resp;
else echo curl_error($ch);

curl_close ($ch);

