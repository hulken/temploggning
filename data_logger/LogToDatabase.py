#!/usr/bin/env python
# -*- coding: utf-8 -*-
def module_exists(module_name):
    try:
        mod = __import__(module_name)
    except ImportError:
        return False
    else:
        return True

import datetime;
import time;
import sys, getopt, httplib, urllib, json, os
if module_exists('oauth'):
    import oauth.oauth as oauth
import StringIO
import mysql.connector
from configobj import ConfigObj

# Read config
config = ConfigObj('logToDatabase.conf')
if(config is not None):
    # Select logger type
    if(config["logger_type"] == "tellstick"):
        import tdsens
        logger = tdsens
    elif(config["logger_type"] == "1wire"):
        import owsens
        logger = owsens

    # Get all sensors from API
    logger.readSettings()
    response = logger.listSensors()

    db = mysql.connector.connect(host=config["db"]["host"], user=config["db"]["user"], password=config["db"]["password"], database=config["db"]["database"], buffered=True)

    for sensor in response['sensor']:
        id = sensor['id']
        name = sensor['name']
        
    	#print id + " " + name.decode('utf-8')
        cursor = db.cursor()
        
        # Check if the sensor exists in the database
        cursor.execute("SELECT sensor_id FROM sensors WHERE id = '" + id + "'")
        db_rows = cursor.fetchone()
        
        sensor_db_id = 0;
        
        if (db_rows is not None and len(db_rows) > 0):
            sensor_db_id = db_rows[0]
            data = (name, id)
            cursor.execute("UPDATE sensors SET name = %s WHERE sensor_id = %s", data)
        else:
            data = (id,  name, "#000000")
            cursor.execute("INSERT INTO sensors (id, name, color) VALUES (%s, %s, %s)", data)
            cursor.execute("SELECT sensor_id FROM sensors WHERE id = '" + id + "'")
            db_rows = cursor.fetchone()
            
            if (db_rows is not None and len(db_rows) > 0):
                sensor_db_id = db_rows[0]
        
        # Get the current sensor information from API
        #reading = subprocess.check_output(["tdsens.py", "-i " + line], shell=True)
        reading = logger.infoSensor(id)    

        lastUpdated = reading['lastUpdated']
        lastUpdatedReadable = datetime.datetime.fromtimestamp(int(lastUpdated)).strftime('%Y-%m-%d %H:%M:%S')

        for data in reading['data']:
                temp = data['value']
                #print "Last Updated: " + lastUpdatedReadable
                #print "Temp: " + temp
                
                lastUpdatedDate = time.strptime(lastUpdatedReadable, "%Y-%m-%d %H:%M:%S")
                
                # Check if the reading already exists
                data2 = (sensor_db_id, lastUpdatedDate)
                cursor.execute("SELECT sensor_id FROM readings WHERE sensor_id = %s AND date = %s", data2)
                db_rows = cursor.fetchone()
                
                if (db_rows is not None and len(db_rows) > 0):
                    continue
                
                data2 = (sensor_db_id, lastUpdatedDate, temp)
                cursor.execute("INSERT INTO readings (sensor_id, date, temp) VALUES (%s, %s, %s)", data2)
                
                # Insert the reading to the database
         
        cursor.close()

    db.close()
