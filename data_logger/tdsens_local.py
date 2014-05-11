#!/usr/bin/env python
# -*- coding: utf-8 -*-
import datetime;
import time;
from tellcore.telldus import TelldusCore
import sys, getopt, httplib, urllib, json, os    
from pprint import pprint

def _getSensors():
  tdc = TelldusCore()
  return tdc.sensors()

def listSensors(debug):
  # Get sensor list
  response = _getSensors()

  # Parse senors
  parsedSensors = { 'sensor': [] }
  if debug:
    print 'listSensors:'
  for sensor in response:
    if debug:
      try:
          print '-------'
          pprint(vars(sensor))
          print '-------'
      except:
          pass

    datatype = 'none'
    if sensor.datatypes == 3:
      datatype = 'temp'

    if datatype != 'none':
      parsedSensors['sensor'].append({'id': str(sensor.id), 'name': str(sensor.id), 'sensor_type': datatype })
  
  return parsedSensors

def infoSensor(sensorId, debug):
  if(debug):
    print 'INFO SENSOR: ' + sensorId
  # Get sensor list
  response = _getSensors()

  parsedInfo = { 'lastUpdated': int(time.time()), 'data': [] }
  for sensor in response:
    if str(sensor.id) == sensorId:
      parsedInfo['data'].append({
        'value': sensor.temperature().value, 
        'name': 'temp'
      })

      if(debug):
        print str(sensor.id) + ', TEMP: ' + str(sensor.temperature().value)

  return parsedInfo

def readSettings():
  pass

def main(argv):
  pass

if __name__ == "__main__":
  main(sys.argv[1:])