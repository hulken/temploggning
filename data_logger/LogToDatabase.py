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

def debug(txt):
    if (_debug == True):
        print txt

# Read config
_debug = False
config = ConfigObj(sys.path[0] + '/logToDatabase.conf')

if(config is not None):
    # Select logger type
    if(config["logger_type"] == "tellstick"):
        import tdsens
        logger = tdsens
    elif(config["logger_type"] == "1wire"):
        import owsens
        logger = owsens

    if (config["debug"] == "true"):
        _debug = True

    # Definition of possible sensor types in the system
    sensor_types = {"temp": 0, "humidity": 1} # First element match name in JSON, second element id of type in the database

    # Get all sensors from API
    logger.readSettings()
    response = logger.listSensors(False)

    db = mysql.connector.connect(host=config["db"]["host"], user=config["db"]["user"], password=config["db"]["password"], database=config["db"]["database"], buffered=True)

    for sensor in response['sensor']:
        id = sensor['id']
        name = sensor['name']
        
        # If the sensor does not have a name, it will not be possible to insert it into the database. Move along and try to parse the next one if this happens.
        if (name is None or name == ""):
            debug("Sensor with id \"" + id + "\" does not have a valid name: \"" + name + "\"")
            continue

    	debug(id + " " + name)
        cursor = db.cursor()
        
        for sensor_type in sensor_types:
            debug(sensor_type + ": " + str(sensor_types[sensor_type]))
            
            # Check if the sensor exists in the database
            debug(str(id) + " " + str(sensor_types[sensor_type]))
            cursor.execute("SELECT sensor_id FROM sensors WHERE id = %s AND sensor_type = %s", (id, int(sensor_types[sensor_type])))
            db_rows = cursor.fetchone()
            
            sensor_db_id = 0;
            
            if (db_rows is not None and len(db_rows) > 0):
                sensor_db_id = db_rows[0]
                cursor.execute("UPDATE sensors SET name = %s WHERE sensor_id = %s", (name, id))
            else:
                cursor.execute("INSERT INTO sensors (id, name, color, sensor_type) VALUES (%s, %s, %s, %s)", (id,  name, "#000000", sensor_types[sensor_type]))
                cursor.execute("SELECT sensor_id FROM sensors WHERE id = %s AND sensor_type = %s", (id, sensor_types[sensor_type]))
                db_rows = cursor.fetchone()
                
                if (db_rows is not None and len(db_rows) > 0):
                    sensor_db_id = db_rows[0]
            
            # Get the current sensor information from API
            #reading = subprocess.check_output(["tdsens.py", "-i " + line], shell=True)
            reading = logger.infoSensor(id, False)    

            lastUpdated = reading['lastUpdated']
            lastUpdatedReadable = datetime.datetime.fromtimestamp(int(lastUpdated)).strftime("%Y-%m-%d %H:%M:%S")

            for data in reading['data']:
                temp = data['value']
                sensorType = data['name']
                
                if (sensor_type != sensorType): # If the received row is not according to the sensor we are working with, go to the next one
                    continue

                debug("Last Updated: " + lastUpdatedReadable)
                debug("Temp: " + temp)
                debug("Sensor type: " + sensorType)
                debug("sensor_type: " + sensor_type)

                lastUpdatedDate = time.strptime(lastUpdatedReadable, "%Y-%m-%d %H:%M:%S")
                
                # Check if the reading already exists
                cursor.execute("SELECT sensor_id FROM readings WHERE sensor_id = %s AND date = %s", (sensor_db_id, lastUpdatedDate))
                db_rows = cursor.fetchone()
                
                if (db_rows is not None and len(db_rows) > 0):
                    debug("Sensor already up to date. Skipping DB insert")
                    continue
                
                # Insert the reading to the database
                debug("Attempting to insert sensor_id: " + str(sensor_db_id) + ", date: " + str(lastUpdatedDate) + ", value: " + str(temp))
                cursor.execute("INSERT INTO readings (sensor_id, date, temp) VALUES (%s, %s, %s)", (sensor_db_id, lastUpdatedDate, temp))
             
        cursor.close()

    db.close()

