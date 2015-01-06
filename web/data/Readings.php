<?php
use Respect\Validation\Validator as v;

class Readings {
  public function __construct() {

  }

  public function read() {
    $arr = array();

    $groupby = "";
    $from = 0;
    $calculatedPeriod = false;

    $dbTimeZone = Settings::DATABASE_TIME_ZONE;
    $webTimeZone = Settings::WEB_TIME_ZONE;

    if (isset($_GET['from']) && isset($_GET['to'])) {
      $from = $_GET['from'];
      $period = (($_GET['to'] - $_GET['from']) * (1/60) * (1/60) * (1/24));
      $calculatedPeriod = true;

      if (!v::numeric()->positive()->validate($period)) {
        http_response_code(500);
        die('{ "error": "Invalid interval selected" }');
      }
    }

    if (!$calculatedPeriod) {
      if (isset($_GET['period'])) {
        $period = $_GET['period'];

        if ($period === 'latest' || $period === 'statistics-minmax') {
          $period = 10000;
        }
      }
      else if (!isset($period)) {
          $period = 1;
        }
    }

    if ($period >= 1) {
      if ($period >= 1825) {
        $d = "%Y-%m"; // Group by month
      }
      if ($period >= 120) {
        $d = "%Y %u"; // Group by week
      }
      else if ($period >= 30) {
          $d = "%Y-%m-%d"; // Group by day
        }
      else if ($period >= 7) {
          $d = "%Y-%m-%d %H"; // Group by hour
        }
      else {
        $d = "%Y-%m-%d %H-%i"; // Group by minute
      }

      $groupby = "r.sensor_id, DATE_FORMAT(r.date, '" . $d . "') ";
    }

    if (isset($_GET['from']) && isset($_GET['to'])) {
      $where = "r.date BETWEEN FROM_UNIXTIME(" . $_GET['from'] . ") AND FROM_UNIXTIME(" . $_GET['to'] . ") ";
    } else {
      $where = "DATE_SUB(NOW(),INTERVAL " . $period ." DAY) <= r.date ";
    }

    $order = "date ASC";

    // Set back the period properly in order to not mess up the jsoncache
    if (isset($_GET['period']) && $period == 10000) {
      $period = 0;
    }

    //Try to read from cache
    if (isset($_GET['usecache']) && $_GET['usecache'] == "true") {
      $outStr = $this->readCache($from, $period);
    }

    if (!isset($outStr) || !$outStr) {
      if (isset($_GET['period']) && $_GET['period'] == 'latest') { // Latest readings
        $query = "SELECT UNIX_TIMESTAMP(i.date) AS date, i.sensor_id, ROUND(r.temp, 1) AS temp, s.name, s.color, s.sensor_type FROM readings r"
          . " RIGHT JOIN ("
          . " SELECT MAX(date) AS date, sensor_id FROM readings GROUP BY sensor_id"
          . ") AS i ON i.date = r.date AND i.sensor_id = r.sensor_id"
          . " RIGHT JOIN sensors s ON s.sensor_id = r.sensor_id"
          . " WHERE s.hidden = false"
          . " ORDER BY s.name, s.sensor_type, date ASC";
      }
      else if (isset($_GET['period']) && $_GET['period'] == 'statistics-avg-hour') { // List of statistics readings hourperday
          $query = "SELECT EXTRACT(HOUR FROM CONVERT_TZ(r.date,'$dbTimeZone','$webTimeZone'))+1 AS date, ROUND(AVG(r.temp), 1) AS temp, s.sensor_id, s.name, s.color, s.sensor_type FROM readings r"
            . " LEFT JOIN sensors s ON r.sensor_id = s.sensor_id"
            . " WHERE s.hidden = false"
            . " GROUP BY r.sensor_id, date"
            . " ORDER BY s.sensor_type, s.name, date ASC";
        }
      else if (isset($_GET['period']) && $_GET['period'] == 'statistics-avg-weekday') { // List of statistics readings dayperweek
          $query = "SELECT WEEKDAY(CONVERT_TZ(r.date,'$dbTimeZone','$webTimeZone'))+1 AS date, ROUND(AVG(r.temp), 1) AS temp, s.sensor_id, s.name, s.color, s.sensor_type FROM readings r"
            . " LEFT JOIN sensors s ON r.sensor_id = s.sensor_id"
            . " WHERE s.hidden = false"
            . " GROUP BY r.sensor_id, date"
            . " ORDER BY s.sensor_type, s.name, date ASC";
        }
      else if (isset($_GET['period']) && $_GET['period'] == 'statistics-avg-month') { // List of statistics readings dayyear
          $query = "SELECT EXTRACT(MONTH FROM CONVERT_TZ(r.date,'$dbTimeZone','$webTimeZone')) AS date, ROUND(AVG(r.temp), 1) AS temp, s.sensor_id, s.name, s.color, s.sensor_type FROM readings r"
            . " LEFT JOIN sensors s ON r.sensor_id = s.sensor_id"
            . " WHERE s.hidden = false"
            . " GROUP BY r.sensor_id, date"
            . " ORDER BY s.sensor_type, s.name, date ASC";
        }
      else { // List of readings
        $query = "SELECT UNIX_TIMESTAMP(r.date) AS date, ROUND(AVG(r.temp), 1) AS temp, s.sensor_id, s.name, s.color, s.sensor_type FROM readings r"
          . " LEFT JOIN sensors s ON r.sensor_id = s.sensor_id"
          . " WHERE $where AND s.hidden = false"
          . " GROUP BY $groupby"
          . " ORDER BY s.sensor_type, s.name, r.date ASC";
      }

      if (isset($_GET['debug'])) {
        echo $query . "<br /><br />";
      }

      require_once 'settings.php';
      $db = connect_database();
      $result = $db->query($query) or die($db->error.' '.sqlerr(__FILE__, __LINE__));

      $lastId = -1;
      $collection = array();
      $lastName;
      $lastColor;
      $lastSensorType;
      $containData = false;

      if (isset($_GET['period']) && ($_GET['period'] == 'statistics-minmax')) {
        // TODO
        while ($row = $result->fetch_assoc()) {
          array_push($collection, array($row['sensor_id'], $row['maxval'], $row['minval']));

          $lastName = $row['maxval'];
          $lastColor = $row['minval'];
          $lastSensorType = $row['sensor_id'];
        }

        if (isset($lastId) && isset($lastName) && isset($lastColor)) {
          //array_push($collection, array($lastId, $lastName, $lastColor, $lastSensorType, $arr));
        }
      }
      else {
          while ($row = $result->fetch_assoc()) {
              if (intval($row['sensor_id']) != $lastId) {
                  if (isset($arr)) {
                      if ($lastId >= 0 && $containData) {
                          array_push($collection, array($lastId, utf8_encode($lastName), utf8_encode($lastColor), $lastSensorType, $arr));
                      }

                      unset($arr);
                      $arr = array();
                      $containData = false;
                  }

                  $lastId = intval($row['sensor_id']);
              }

              // We don't want to add seconds for statistics
              if (isset($period) && ($period == 'statistics-avg-hour' || $period == 'statistics-avg-weekday' || $period == 'statistics-avg-month') && intval($row['date']) > 0) {
                  $containData = true;
                  array_push($arr, array((intval($row['date'])), floatval($row['temp'])));
              }
              // Add seconds
              else if (intval($row['date']) > 0) {
                  $containData = true;
                  array_push($arr, array((intval($row['date']) * 1000), floatval($row['temp'])));
              }

              $lastName = $row['name'];
              $lastColor = $row['color'];
              $lastSensorType = $row['sensor_type'];
          }

          if ($lastId >= 0 && $containData) {
              array_push($collection, array($lastId, utf8_encode($lastName), utf8_encode($lastColor), $lastSensorType, $arr));
          }
      }

      $outStr = json_encode($collection);

      if (isset($_GET['usecache']) && $_GET['usecache'] == "true") {
        $this->writeCache($from, $period, $outStr);
      }

      $result->free();
      $db->close();
    }

    return $outStr;
  }

  public function getCacheFileName($from, $period) {
    return Settings::CACHE_DIR . $from . '_' . $period;
  }

  public function getCacheFileNameSufix($period) {
    if ($period > 300) {
      return date("ym");
    }
    else if ($period >= 60) {
        return date("yW");
      }
    else if ($period >= 30) {
        return date("ymd");
      }
  }

  public function readCache($from, $period) {
    $fileName = $this->getCacheFileName($from, $period) . '_' . $this->getCacheFileNameSufix($period);

    if (file_exists("$fileName")) {
      return file_get_contents($fileName);
    }

    return false;
  }

  public function writeCache($from, $period, $data) {
    // Try to create the directory first
    if (!is_dir(Settings::CACHE_DIR)) {
      $currentErrorReporting = ini_get('display_errors');

      ini_set('display_errors', '0');

      if (!mkdir(Settings::CACHE_DIR)) { // We probably don't have access to create the directory
        ini_set('display_errors', $currentErrorReporting);

        return;
      }

      ini_set('display_errors', $currentErrorReporting);
    }

    $fileNamePrefix = $this->getCacheFileName($from, $period);
    $fileName = $this->getCacheFileName($from, $period) . '_' . $this->getCacheFileNameSufix($period);

    if (!file_exists($fileName) && $period > 7) {
      $this->delfiles($fileNamePrefix . '*');
      file_put_contents("$fileName", $data);
    }
  }

  public function delfiles($str) {
    foreach (glob($str) as $fn) {
      unlink($fn);
    }
  }
}

?>
