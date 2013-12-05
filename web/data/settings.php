<?php ## Fil med mycket viktiga inställningar som krävs för att kunna kommunicera med databasen

// Viktiga inställningar
$sql_engine	= "MySQL";
$sql_server = "localhost";
$sql_user	= "temploggning";
$sql_passw	= "temploggning";
$sql_database = "temploggning";

// Koppla upp anslutningen
$connection = mysql_connect($sql_server, $sql_user, $sql_passw) or die (mysql_error());
@mysql_select_db("$sql_database") or die( "Unable to select database");

class Settings
{
	// Database schema version
	const DB_SCHEMA_VERSION = 3;
    const CACHE_DIR = 'cacheData/'; // Note: This must end with a forward-slash in unix and backward slash in windows
}

function sqlerr($file = '', $line = '')
{
  print("<table border=0 bgcolor=blue align=left cellspacing=0 cellpadding=10 style='background: blue'>" .
    "<tr><td class=embedded><font color=white><h1>SQL Error</h1>\n" .
  "<b>" . mysql_error() . ($file != '' && $line != '' ? "<p>in $file, line $line</p>" : "") . "</b></font></td></tr></table>");
  die;
}