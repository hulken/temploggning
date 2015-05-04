<?php //# Settings for database connection

function connect_database() {
    // Basic settings
    $sql_engine = "MySQL";
    $sql_server = "localhost";
    $sql_user = "temploggning";
    $sql_passw  = "temploggning";
    $sql_database = "temploggning";

    // Setup connection
    $connection = new mysqli($sql_server, $sql_user, $sql_passw, $sql_database);

    if ($connection->connect_errno > 0) {
        die('Unable to connect to database [' . $connection->connect_error . ']');
    }

    return $connection;
}

class Settings {
    // Database schema version
    const DB_SCHEMA_VERSION = 4;
    const CACHE_DIR = 'cacheData/'; // Note: This must end with a forward-slash in unix and backward slash in windows
    const DATABASE_TIME_ZONE = "+00:00"; // Change to eg "UTC" (will only work if MySQL time zone support are installed http://dev.mysql.com/doc/refman/5.5/en/time-zone-support.html)
    const WEB_TIME_ZONE = "+00:00"; // Change to eg "Europe/Stockholm" (will only work if MySQL time zone support are installed http://dev.mysql.com/doc/refman/5.5/en/time-zone-support.html)
}

function sqlerr($error, $file = '', $line = '') {
    print("<table border=0 bgcolor=blue align=left cellspacing=0 cellpadding=10 style='background: blue'>" .
        "<tr><td class=embedded><font color=white><h1>SQL Error</h1>\n" .
        "<b>" . $error . ($file != '' && $line != '' ? "<p>in $file, line $line</p>" : "") . "</b></font></td></tr></table>");
    die;
}
