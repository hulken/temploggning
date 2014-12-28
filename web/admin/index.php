<!DOCTYPE html>
<html lang="se">
  <head>
    
    <title>Temperaturer</title>
<!-- META TAGS START -->
    <meta charset="utf-8">
    <meta http-equiv="Content-Language" content="sv">
    <meta http-equiv="cleartype" content="on">
    <meta http-equiv="imagetoolbar" content="no">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="description" content="Temperature logging visualization client">
    <meta name="author" content="Martin Hultman, Martin Engström and Markus Karlsson 2013">
<!-- META TAGS END -->

<!-- STYLES START -->
    <link href="../lib/bootstrap/css/bootstrap.min.css" rel="stylesheet">
    <link href="../lib/bootstrap/css/bootstrap-theme.min.css" rel="stylesheet">
    <link href="../lib/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css" rel="stylesheet">
    <link href="../resources/style.css" rel="stylesheet">
<!-- STYLES END -->

<!-- HTML5 shim START, for IE6-8 support of HTML5 elements -->
    <!--[if lt IE 9]>
      <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->
<!-- HTML5 shim END -->

  </head>

  <body>
<!-- NAVBAR START -->
    <div class="navbar navbar-inverse navbar-static-top">
      <div class="container">
        <div class="navbar-header">
          <a class="navbar-brand" href="#">Administrera</a>

          <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
        </div>
       
        <div class="navbar-collapse collapse" id="nav-collapse">
          <ul class="nav navbar-nav">
            <li class="nav-opt"><a href="#sensor_names">Sensorer</a></li>
          </ul>
        </div>
      </div>
    </div>
<!-- NAVBAR END -->

<!-- MODAL START -->
    <div id="loading" class="modal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-body text-center">
            <img src="../resources/loader.gif"/>
            <p></p>
            <p>Laddar...</p>
          </div>
        </div>
      </div>
    </div>

    <div id="error" class="modal">
      <div class="modal-dialog">
        <div class="modal-content alert-danger">
           <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            <h4 class="modal-title">Fel</h4>
          </div>
          <div class="modal-body text-center">
          </div>
        </div>
      </div>
    </div>
<!-- MODAL END -->    

<!-- MAIN CONTAINER START -->    
    <div class="container" id="container">
      <div id="sensors-list"></div>
    </div> 
<!-- MAIN CONTAINER END -->    

	<script src="../lib/jquery-1.10.2.min.js"></script>
	<script src="../lib/jquery.jeditable.min.js"></script>
	<script src="../lib/bootstrap/js/bootstrap.min.js"></script>
    <script src="../lib/TempChart.js"></script>
    <script src="../lib/TempChart/DataHandler.js"></script>
    <script src="../lib/TempChart/Administrator.js"></script>

	<script>
      var tempChart = null;

      $(function() {

          // Init new TempChart
          tempChart = new TempChart({
            DATA_URL: '../data/',
            DEBUG: true
          });

          tempChart.initAdministrator();

      });
    </script>

  </body>
</html>