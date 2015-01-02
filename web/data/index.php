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
$api->response->headers->set('Content-type', 'application/json');

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

// Log API
// -------------------
$api->put('/log/:id', function ($sensor_id) use ($api) {
  $sensors = new Sensors();
  $request = $api->request();
  $json = json_decode($request->getBody());

  if (isset($json->value)) {
    echo($sensors->log($sensor_id, $json->value));
  }
  else  {
    echo 'Invalid input (Please provide proper JSON data: value must be set)';
  }
});
// -------------------

// WeatherForecast
// -------------------
$api->get('/weatherforecast/:source', function ($source) {
  $weatherForecast = new WeatherForecast();
  $time_limit=NULL;
  if(isset($_GET['period'])) {
    $period=$_GET['period'];
    if ($period < 1 or $period > 7) {
      echo('[]');
      return;
    } else {
      $time_limit = ((time() + ($period*0.5)*24*60*60)*1000);
    }
  }
  else {
    echo('[]');
    return;
  }
  switch ($source) {
    case 'all':
      echo($weatherForecast->all($_GET['lat'],$_GET['lng'],$_GET['place'],$time_limit));
      break;
    case 'smhi':
      echo($weatherForecast->smhi($_GET['lat'],$_GET['lng'],$time_limit));
      break;
    case 'yr':
      echo($weatherForecast->yr($_GET['place'],$time_limit));
      break;
  }
});
// -------------------

$api->run();

?>
