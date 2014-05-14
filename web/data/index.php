<?php
include_once 'Slim/Slim.php';
include_once 'settings.php';
include_once 'Readings.php';
include_once 'CustomReadings.php';
include_once 'Sensors.php';

// Initiate Slim framework
\Slim\Slim::registerAutoloader();

$api = new \Slim\Slim();

// Readings
// -------------------
$api->get('/readings', function () {
    $readings = new Readings();
    echo($readings->read());
});
// -------------------

// CustomReadings
// -------------------
$api->get('/customreadings', function () {
    $customreadings = new CustomReadings();
    echo($customreadings->read());
});
// -------------------

$app = \Slim\Slim::getInstance();
// Sensors
// -------------------
$api->get('/sensors', function () {
	$sensors = new Sensors();
    echo($sensors->read());
});

$api->put('/sensor/:id', function ($id) use ($api) {
	$sensors = new Sensors();
	$request = $api->request();
	$json = json_decode($request->getBody());
	if(isset($json->name)) {
    	echo($sensors->update($id, $json->name, $json->id, $json->color));
    }
});
// -------------------

$api->run();

?>