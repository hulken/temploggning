<?php
use Respect\Validation\Validator as v;

class Sensors {
    
  public function __construct() {

  }

  public function read() {
    header('Content-type: application/json');

    $query = 'SELECT * FROM sensors;';
    require_once 'settings.php';
    $db = connect_database();
    $result = $db->query($query) or die(sqlerr($db->error, __FILE__, __LINE__));
    $sensors = array();

    while ($row = $result->fetch_assoc()) {
       array_push($sensors, $row);
    }

    $db->close();

    return json_encode($sensors);
  }

  public function update($sensor_id, $name, $id, $color) {
    header('Content-type: application/json');

    $query = "UPDATE sensors SET name='$name', id='$id', color='$color' WHERE sensor_id=$sensor_id;";
    require_once 'settings.php';
    $db = connect_database();
    $result = $db->query($query) or die(sqlerr($db->error, __FILE__, __LINE__));
    $db->close();

    if ($result == FALSE) {
      http_response_code(500);
      die('{ "error": "' + $db->error + '" "}');
    } else {
      return '{}';
    }
  }

  public function log($sensor_id, $value)
  {
    header('Content-type: application/json');

    // Input validation
    if (!v::numeric()->validate($value)) {
      http_response_code(500);
      die('{ "error": "Invalid input (value)" }');
    }

    if (!v::numeric()->positive()->validate($value)) {
      http_response_code(500);
      die('{ "error": "Invalid input (sensor_id)" }');
    }

    // Insert information into database
    $query = "INSERT INTO readings (sensor_id, temp, date) VALUES ($sensor_id, $value, '" . date("Y-m-d H:i:s") . "');";
    require_once 'settings.php';
    $db = connect_database();
    $result = $db->query($query) or die(sqlerr($db->error, __FILE__, __LINE__));
    
    $db->close();

    if ($result == FALSE) {
      http_response_code(500);
      die('{ "error": ' +  $db->error + '}'); 
    } else {
      return '{}';
    }
  }
}

?>