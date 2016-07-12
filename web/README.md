###Setup configuration:
Rename config-sample.js to config.js.
In data rename settings-sample.php to settings.php. 
And change the configurations to match your environment.

###To configure the REST-services:

1. Change ``AllowOverride None`` to ``AllowOverride All`` in your websites Apache configuration.
If your running default Apache-site edit ``/etc/apache2/sites-enabled/000-default``

DocumentRoot /var/www
<Directory />
Options FollowSymLinks
AllowOverride All
</Directory>
<Directory /var/www/>
Options Indexes FollowSymLinks MultiViews
AllowOverride All
Order allow,deny
allow from all
</Directory>

ScriptAlias /cgi-bin/ /usr/lib/cgi-bin/
<Directory "/usr/lib/cgi-bin">
AllowOverride None
Options +ExecCGI -MultiViews +SymLinksIfOwnerMatch
Order allow,deny
Allow from all
</Directory>


2. Enable mod_rewrite ``sudo a2enmod rewrite``

###Usage example of Log-API:
```
PUT http://server/temploggning/data/log/22 HTTP/1.1
Content-Type:application/json
Host:server

{"value":125}
```


- Parameter after /id/ identifies the sensor
- Value in JSON-data represents what to log