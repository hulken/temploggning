#!/usr/bin/env python
# -*- coding: utf-8 -*-
import datetime;
import time;
import ow;
import sys, getopt, httplib, urllib, json, os

def printUsage():
  print("Usage: %s [ options ]" % sys.argv[0])       

def listSensors():
  ow.init('localhost:4304')
  response = ow.Sensor('/').sensorList()
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
      parsedSensors['sensor'].append({'id': sensor.address, 'name': sensor.id})
  return parsedSensors

def infoSensor(sensorId):
  ow.init('localhost:4304')
  response = ow.Sensor('/').sensorList()
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