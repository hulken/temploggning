<?php
include_once("settings.php");

$arr = Array();

{	
	//$sensor = $_GET['sensor'];
	$groupby = "";
	$from = 0;
	
	if(isset($_GET['from']) && isset($_GET['to'])) {
		$from = $_GET['from'];
		$period = (($_GET['to'] - $_GET['from']) * 0.016666666666666666 * 0.016666666666666666 * 0.041666666666666664);
	}
	
	if(isset($_GET['period'])) {
		$period = $_GET['period'];
		
		if($period === 'latest'){
			$period = 10000;
		}
	} else if(!isset($period)){
		$period = 1;
	}
	
	if($period >= 7) {
		$d = "%Y-%m-%d %H";
		
		if($period >= 365) {
			$d = "%Y-%m";
		} else if($period >= 60) {
			$d = "%Y %u";
		} else if($period >= 30) {
			$d = "%Y-%m-%d";
		}
		$groupby = "GROUP BY " .
					"DATE_FORMAT(date, '" . $d . "') ";
	}
	
	if(isset($_GET['from']) && isset($_GET['to'])) {
		$where = "FROM_UNIXTIME(" . $_GET['from'] . ") <= date && FROM_UNIXTIME(" . $_GET['to'] . ") > date ";
	} else {
		$where = "DATE_SUB(CURDATE(),INTERVAL " . $period ." DAY) <= date ";
	}
		
	$order = "date ASC";
	
    // Set back the period properly in order to not mess up the jsoncache
    if (isset($_GET['period']) && $period == 10000) {
        $period = 0;
    }
    
	//Try to read from cache
	//if(isset($_GET['usecache']) && $_GET['usecache'] == "true") 
	//{
	//	$outStr = readCache($sensor, $from, $period);
	//}
	
	if(!isset($outStr) || !$outStr) 
	{
		if(isset($_GET['period']) && $_GET['period'] == 'latest') {
            $query = "SELECT UNIX_TIMESTAMP(i.date) AS date, i.sensor_id, temp, s.name, s.color FROM readings r"
                        . " RIGHT JOIN ("
                        . " SELECT MAX(date) AS date, sensor_id FROM readings GROUP BY sensor_id ORDER BY date DESC"
                        . " ) AS i ON i.date = r.date AND i.sensor_id = r.sensor_id"
                        . " RIGHT JOIN sensors s ON s.sensor_id = r.sensor_id"
                        . " ORDER BY sensor_id, date ASC";
		}
		else {
            if ($period >= 7) {
                $query = "SELECT UNIX_TIMESTAMP(MIN(date)) AS date, AVG(temp) AS temp FROM readings WHERE $where $groupby ORDER BY $order";
            }
            else {
                //$query = "SELECT UNIX_TIMESTAMP(date) AS date, temp AS temp FROM readings WHERE $where $groupby ORDER BY $order";
                $query = "SELECT UNIX_TIMESTAMP(i.date) AS date, i.sensor_id, temp, s.name, s.color FROM readings r"
                        . " RIGHT JOIN ("
                        . " SELECT date, sensor_id FROM readings $where ORDER BY date DESC"
                        . " ) AS i ON i.date = r.date AND i.sensor_id = r.sensor_id"
                        . " RIGHT JOIN sensors s ON s.sensor_id = r.sensor_id"
                        . " ORDER BY sensor_id, date ASC";
            }
		}

		if (isset($_GET['debug'])) {
			echo $query . "<br /><br />";
		}
					 
		$result = mysql_query($query) or die(mysql_error().' '.sqlerr(__FILE__, __LINE__));
		
        $lastId = -1;
        $collection = array();
        $lastName;
        $lastColor;
        
		while($row = mysql_fetch_array($result)) 
		{
            if (intval($row['sensor_id']) != $lastId) {                
                if (isset($arr)) {
                    if ($lastId >= 0) {
                        array_push($collection, array($lastId, $lastName, $lastColor, $arr));
                    }
                    
                    unset($arr);
                    $arr = array();
                }
                
                $lastId = intval($row['sensor_id']);
            }
            
			array_push($arr, array((intval($row['date']) * 1000), floatval($row['temp'])));
            $lastName = $row['name'];
            $lastColor = $row['color'];
		}
		
        array_push($collection, array($lastId, $lastName, $lastColor, $arr));
        
		$outStr = json_encode($collection);
        
		//if(isset($_GET['usecache']) && $_GET['usecache'] == "true") 
		//{
		//	writeCache($sensor, $from, $period, $outStr);
		//}
		
		mysql_free_result($result);
		mysql_close($connection);
	}
	
}// else {
//	$result = mysql_query("SELECT name, color FROM sensors ORDER BY name") or die(mysql_error().' '.sqlerr(__FILE__, __LINE__));
//	
//	while($row = mysql_fetch_array($result)) {
//	  array_push($arr,Array('name' => $row['name'], 'color' => $row['color']));
//	}
//	
//	$outStr = json_encode($arr);
//	
//	mysql_free_result($result);
//	mysql_close($connection);
//}

echo $outStr;

function getWhereStatementLatest($sensor_name, $where, $isLatest) {
	if (Settings::DB_SCHEMA_VERSION == 1)
	{
		return " WHERE date = (SELECT MAX(date) FROM sensors AND name = $sensor_name)";
	}
	else 
	{
		$sensor_id = getSensorIdFromSensorName($sensor_name);
		
		if (strlen($where) > 0)
			$where .= " AND ";
		else
			$where = " WHERE ";
			
		$where .= "`sensor_id` = $sensor_id ";
        
        if ($isLatest) {
            $where .= "GROUP BY date ";
        }

        $where .= "ORDER BY date DESC LIMIT 1";
		
		return $where;
	}
}

function getSensorIdFromSensorName($sensor_name) {
	$result = mysql_query("SELECT sensor_id FROM sensors WHERE name = '$sensor_name' ORDER BY name") or die(mysql_error().' '.sqlerr(__FILE__, __LINE__));
	$num		= mysql_numrows($result);

	if ($num <= 0)
	{
		die("Sensor with id $sensor_name could not be found ".mysql_error());
	}
	
	return mysql_result($result, 0, "sensor_id");
}

function getCacheFileName($sensor, $from, $period) {
	return 'cacheData/' . md5($sensor) . '_' . $from . '_' . $period;
}

function getCacheFileNameSufix($period) {
	if($period > 300) {
		return date("ym");
	} else if($period >= 60) {
		return date("yW");
	} else if($period >= 30) {
		return date("ymd");
	}
}

function readCache($sensor, $from, $period) {
	$fileName = getCacheFileName($sensor, $from, $period) . '_' . getCacheFileNameSufix($period);
	
	if (file_exists("$fileName")) {
		return file_get_contents($fileName);
	}
	
	return false;
}

function writeCache($sensor, $from, $period, $data) {
	$fileNamePrefix = getCacheFileName($sensor, $from, $period);
	$fileName = getCacheFileName($sensor, $from, $period) . '_' . getCacheFileNameSufix($period);
	
	if (!file_exists($fileName) && $period > 7) {
		delfiles($fileNamePrefix . '*');
		file_put_contents("$fileName", $data);
	}
}

function delfiles($str) 
{ 
    foreach (glob($str) as $fn) { 
        unlink($fn); 
    } 
} 
?>