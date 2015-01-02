##Temperature logging
Logger for sensor data from 1-wire and tellstick to mysql
Note: There's also a REST API available (See web\data\README.md for information)

###Tellstic Duo
Add the following lines to your /etc/apt/sources.list:

```deb http://download.telldus.com/debian/ stable main```

Download and add Telldus public key for apt-secure

```wget http://download.telldus.se/debian/telldus-public.key -O- | sudo apt-key add -```

Update the repository
```sudo apt-get update```

To install telldus-core, do
```sudo apt-get install telldus-core```

Download Switch King Server
```wget http://www.switchking.se/sv/downloads?download=91%3Aserver-setup-linux-v3.2.1 -O SwitchKing.Server.Linux.3.2.1.0.zip```

Unpack
```unzip SwitchKing.Server.Linux.3.2.1.0.zip -d ./switchking_server```

Install mono
```sudo apt-get install monodevelop```



###Common setup
##### Python
Make sure to have python 2.7 installed

```apt-get install python```

##### Install pip
```apt-get install python-pip```

##### Requriments
Make sure the correct python libraries are installed  
```pip install mysql-connector-python```  
```pip install configobj```

###Using Tellstick
Uses **tdsens.py**

Make sure the correct python libraries are installed

```pip install oauth```


Change the variables PUBLIC_KEY and PRIVATE_KEY in the file tdsens.py


I think that tdsens.py will attempt to create the settings files automatgically when running the following the first time:
```python tdsens.py --info```

I've modified the tdsens script a bit in order be less chatty and to return data as python data objects in order to collaborate better with LogTellstickToDatabase.py, but normally you shall be able to run the following commands without any errors:
```python tdsens.py --info``	`  
\# This command lists all of the sensors in the tellstick account. For example: (Note that it does not print anything to output due to the reasons mentioned above)
        984901 Paviljongen
        984910 Utanför sovrummet
        984693 Ute
        984703 Växthuset

```python tdsens.py --list```  
\# This command lists all of the devices in the tellstick account. 
	
**For example:**
	
	Number of devices: 6  
		320497  1_Utebelysning  ON
        320498  2_pump  OFF
        315338  3_Pannrum       OFF
        321475  4_x     OFF
        321476  5_x     OFF
        321477  6_x     OFF

If the configuration files is not properly created automagically, please try the following.  
Make sure to create the settings file:  
```mkdir ~/.config/Telldus``` 
```touch ~/config/Telldus/tdtool.conf```

This is the content of the file: (Without the prepending tabs)  

	requestToken = None
	requestTokenSecret = None
	token = <value_of_token>
	tokenSecret = <value_of_token_secret>


###Using 1-wire
Uses owsens.py

Make sure the owpython library is installed (http://owfs.sourceforge.net/owpython.html) 
For raspberry pi installation follow instructions found here http://www.raspberrypi.org/forums/viewtopic.php?t=27379&p=505250


###Logging LogToDatabase.py

Rename logoToDatabase-sample.conf to logoToDatabase.conf and review the mysql host settings.
Most important is to change the type of logger_type!  
And also database: host, user, password, database
    
Run the script (Prerequisites: The database table schema (v4) need to be in place before running the script. The script also need to be runneble with: chmod +x LogToDatabase.py)  
```./LogToDatabase.py```
    
If everyting works properly, I recommend to create a CRON-job to run the collection of the sensor values periodically in order to store them to yor database. I'm fetching values every 5th minute (The script does not update the database unless the read datetime from tellstick have changed. The API only updates the value every 10 minute currently):  
```0-59/5 * * * *  xenon   /home/xenon/data_logger/LogToDatabase.py```
     
If running the CRON-job in for instance Ubuntu you might need to define the absolute path on line 21 in LogToDatabase.py eg: "config = ConfigObj('/home/user/data_logger/logToDatabase.conf')", also the CRON could be defined without a user:  
```*/5 * * * * /home/user/data_logger/LogToDatabase.py >/dev/null 2>&1```




