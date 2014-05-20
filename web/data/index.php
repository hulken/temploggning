<?php
include_once 'Slim/Slim.php';
include_once 'settings.php';
include_once 'Readings.php';
include_once 'CustomReadings.php';
include_once 'Sensors.php';
include_once 'WeatherForecast.php';

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

// WeatherForecast
// -------------------
$api->get('/weatherforecast/:source', function ($source) {
    $weatherForecast = new WeatherForecast();
    switch ($source) {
        case 'all':
            echo($weatherForecast->all($_GET['lat'],$_GET['lng'],$_GET['place']));
            break;
        case 'smhi':
            echo($weatherForecast->smhi($_GET['lat'],$_GET['lng']));
            break;
        case 'yr':
            echo($weatherForecast->yr($_GET['place']));
            break;
    }
});
// -------------------

$api->run();

?>
