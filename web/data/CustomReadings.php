<?php

class CustomReadings
{
  public function __construct() { }

  public function read() {
    $query = "SELECT t1.sensor_id, t1.name, t1.color, t1.sensor_unit, t1.daydate as maxdaydate,  t1.maxval, t2.daydate as mindaydate, t2.minval, t3.avgvalue"
              ." FROM("
              ."   SELECT apd1.sensor_id, apd1.name, apd1.color, apd1.sensor_unit, apd1.daydate, MAX(apd1.avgvalue) as maxval, apd1.readings"
              ."   FROM ("
              ."     SELECT s.sensor_id, s.name, s.color, s.sensor_unit, Date(r.date) as daydate, AVG(r.temp) as avgvalue, COUNT(*) as readings"
              ."     FROM readings r"
              ."     INNER JOIN sensors s on s.sensor_id = r.sensor_id"
              ."     WHERE s.hidden = false"
              ."     GROUP BY s.sensor_id, Date(r.date)"
              ."     ORDER BY avgvalue desc"
              ."   ) as apd1"
              ."   GROUP BY apd1.sensor_id"
              ." ) as t1"
              ." LEFT JOIN "
              ." ("
              ."   SELECT apd2.sensor_id, apd2.daydate, MIN(apd2.avgvalue) as minval, apd2.readings"
              ."   FROM ("
              ."    SELECT s.sensor_id, Date(r.date) as daydate, AVG(r.temp) as avgvalue, COUNT(*) as readings"
              ."     FROM readings r"
              ."     INNER JOIN sensors s on s.sensor_id = r.sensor_id"
              ."     WHERE s.hidden = false"
              ."     GROUP BY s.sensor_id, Date(r.date)"
              ."     ORDER BY avgvalue asc"
              ."   ) as apd2"
              ."   GROUP BY apd2.sensor_id"
              ." ) as t2 on t2.sensor_id = t1.sensor_id"
              ." LEFT JOIN "
              ." ("
              ."   SELECT s.sensor_id, Date(r.date) as daydate, AVG(r.temp) as avgvalue, COUNT(*) as readings"
              ."   FROM readings r"
              ."   INNER JOIN sensors s on s.sensor_id = r.sensor_id"
              ."   WHERE s.hidden = false and DATE_SUB(NOW(),INTERVAL 24 HOUR) <= r.date "
              ."   GROUP BY s.sensor_id"
              ." ) as t3 on t3.sensor_id = t1.sensor_id ";
    require_once 'settings.php';
    $db = connect_database();
    $result = $db->query($query) or die($db->error . ' ' . sqlerr(__FILE__, __LINE__));
    $sensors = array();

    while ($row = $result->fetch_assoc()) {
       array_push($sensors, $row);
    }

    $db->close();
    
    return json_encode($sensors);
  }
}

?>