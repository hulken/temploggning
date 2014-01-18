#!/usr/bin/env python
# -*- coding: utf-8 -*-
import datetime;
import time;
import ow;
import sys, getopt, httplib, urllib, json, os    

def _getSensors():
  # Connect to owserver
  ow.init('localhost:4304')
  # Get sensor list
  response = ow.Sensor('/').sensorList()
  # ow clean up
  #ow.finish()
  return response

def listSensors():
  # Get sensor list
  response = _getSensors()

  # Parse senors
  parsedSensors = { 'sensor': [] }
  for sensor in response:
    
    #print '-------'
    #print sensor.address
    #print sensor.crc8
    #print sensor.family
    #print sensor.id
    #print sensor.locator
    #print sensor.power
    #print sensor.r_address
    #print sensor.r_id
    #print sensor.r_locator
    #print sensor.temperature
    #print sensor.temphigh
    #print sensor.templow
    #print '-------'

    if(sensor.type in ['DS18B20', 'DS18S20']):
      parsedSensors['sensor'].append({'id': sensor.address, 'name': sensor.id, 'sensor_type': 'temp' })
  

  return parsedSensors

def infoSensor(sensorId):
  # Get sensor list
  response = _getSensors()
  parsedInfo = { 'lastUpdated': int(time.time()), 'data': [] }
  for sensor in response:
    if(sensor.address == sensorId):
      parsedInfo['data'].append({'value': sensor.temperature })

  return parsedInfo

def readSettings():
  pass

def main(argv):
  pass

if __name__ == "__main__":
  # config = ConfigObj(os.environ['HOME'] + '/.config/Telldus/tdtool.conf')
  main(sys.argv[1:])