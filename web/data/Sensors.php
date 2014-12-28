<?php
use Respect\Validation\Validator as v;

class Sensors {
		
	public function __construct()
    {

	}

	public function read() {
		$query = 'SELECT * FROM sensors;';
		$result = mysql_query($query) or die(mysql_error().' '.sqlerr(__FILE__, __LINE__));
		$sensors = array();
		while( $row = mysql_fetch_assoc( $result)){
 		   array_push($sensors,$row);
		}
		return json_encode($sensors);
	}

	public function update($sensor_id, $name, $id, $color) {
		$query = "UPDATE sensors SET name='$name', id='$id', color='$color' WHERE sensor_id=$sensor_id;";
		$result = mysql_query($query);
		if($result == FALSE) {
			return '{ error: ' +  mysql_error() + '}';	
		} else {
			return '{}';
		}
		
	}

	public function log($sensor_id, $value)
	{
		// Input validation
		if (!v::numeric()->validate($value)) {
			return '{ error: "Invalid input (value)"}';
		}

		if (!v::numeric()->positive()->validate($value)) {
			return '{ error: "Invalid input (sensor_id)"}';
		}

		// Insert information into database
		$query = "INSERT INTO readings (sensor_id, temp, date) VALUES ($sensor_id, $value, '" . date("Y-m-d H:i:s") . "');";
		$result = mysql_query($query) or die(mysql_error().' '.sqlerr(__FILE__, __LINE__));
		
		if ($result == FALSE) {
			return '{ error: ' +  mysql_error() + '}';	
		} else {
			return '{}';
		}
	}
}

?>