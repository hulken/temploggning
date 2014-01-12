<?php

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

	public function update($id, $name) {
		$query = "UPDATE sensors SET name='$name' WHERE sensor_id=$id;";
		$result = mysql_query($query);
		if($result == FALSE) {
			return '{ error: ' +  mysql_error() + '}';	
		} else {
			return '{}';
		}
		
	}
}

?>