#!/usr/bin/env python
# -*- coding: utf-8 -*-
import datetime;
import time;
import sys, getopt, httplib, urllib, json, os
import oauth.oauth as oauth
from configobj import ConfigObj
#insert your own public_key and private_key
PUBLIC_KEY = 'value'
PRIVATE_KEY = 'value'
TELLSTICK_TURNON = 1
TELLSTICK_TURNOFF = 2
TELLSTICK_BELL = 4
TELLSTICK_DIM = 16
TELLSTICK_UP = 128
TELLSTICK_DOWN = 256
SUPPORTED_METHODS = TELLSTICK_TURNON | TELLSTICK_TURNOFF | TELLSTICK_BELL | TELLSTICK_DIM | TELLSTICK_UP | TELLSTICK_DOWN;

def printUsage():
        print("Usage: %s [ options ]" % sys.argv[0])
        print("")
        print("Options:")
        print("     -[lnfdbvhs] [ --list ] [ --sensor ] [ --info ] [ --help ]")
        print("                      [ --on device ] [ --off device ] [ --bell device ]")
        print("                      [ --dimlevel level --dim device ]")
        print("                      [ --up device --down device ]")
        print("")
        print("       --list (-l short option)")
        print("             List currently configured devices.")
        print("")
        print("       --sensor (-s short option)")
        print("             List all sensors.")
        print("")
        print("       --info (-i short option)")
        print("             Show temp. 'sensor' must be an integer of the sensor-id.")
        print("             Sensor-id and name is outputed with the --sensor option")
        print("")
        print("       --help (-h short option)")
        print("             Shows this screen.")
        print("")
        print("       --on device (-n short option)")
        print("             Turns on device. 'device' must be an integer of the device-id")
        print("             Device-id and name is outputed with the --list option")
        print("")
        print("       --off device (-f short option)")
        print("             Turns off device. 'device' must be an integer of the device-id")
        print("             Device-id and name is outputed with the --list option")
        print("")
        print("       --dim device (-d short option)")
        print("             Dims device. 'device' must be an integer of the device-id")
        print("             Device-id and name is outputed with the --list option")
        print("             Note: The dimlevel parameter must be set before using this option.")
        print("")
        print("       --dimlevel level (-v short option)")
        print("             Set dim level. 'level' should an integer, 0-255.")
        print("             Note: This parameter must be set before using dim.")
        print("")
        print("       --bell device (-b short option)")
        print("             Sends bell command to devices supporting this. 'device' must")
        print("             be an integer of the device-id")
        print("             Device-id and name is outputed with the --list option")
        print("")
        print("       --up device")
        print("             Sends up command to devices supporting this. 'device' must")
        print("             be an integer of the device-id")
        print("             Device-id and name is outputed with the --list option")
        print("")
        print("       --down device")
        print("             Sends down command to devices supporting this. 'device' must")
        print("             be an integer of the device-id")
        print("             Device-id and name is outputed with the --list option")
        print("")
        print("Report bugs to <info.tech@telldus.se>")

def listDevices():
        response = doRequest('devices/list', {'supportedMethods': SUPPORTED_METHODS})
        
        try:
            print response['error']
        except KeyError:
            iosdsdsdtemp = 1

        print("Number of devices: %i" % len(response['device']));
        for device in response['device']:
                if (device['state'] == TELLSTICK_TURNON):
                        state = 'ON'
                elif (device['state'] == TELLSTICK_TURNOFF):
                        state = 'OFF'
                elif (device['state'] == TELLSTICK_DIM):
                        state = "DIMMED"
                elif (device['state'] == TELLSTICK_UP):
                        state = "UP"
                elif (device['state'] == TELLSTICK_DOWN):
                        state = "DOWN"
                else:
                        state = 'Unknown state'
                print("%s\t%s\t%s" % (device['id'], device['name'], state));

def listSensors(debug):
    ignored = 0 #set to 1 to include ignored sensors
    response = doRequest('sensors/list', {'includeIgnored': ignored})
    
    if (debug == True):
        print response

        for sensor in response['sensor']:
            #print("%s %s" % (unicode(sensor['id']).encode(sys.stdin.encoding), unicode(sensor['name']).encode(sys.stdin.encoding)));
            #print("%s %s" % (unicode(sensor['id']).encode('iso-8859-1'), unicode(sensor['name']).encode('iso-8859-1')));
            print("%s %s" % (sensor['id'], sensor['name']));
    else:
        return response

def infoSensor(sensorId, debug):
    response = doRequest('sensor/info', {'id': sensorId})
    lastUpdated = response['lastUpdated']

    lastUpdatedReadable = datetime.datetime.fromtimestamp(int(lastUpdated)).strftime('%Y-%m-%d %H:%M:%S')
   
    if (debug == True):
        print response
        
        for data in response['data']:
            #print("Id: %s %s: %s Last update: %s" % (sensorId, unicode(data['name']).encode(sys.stdin.encoding), unicode(data['value']).encode(sys.stdin.encoding), lastUpdatedReadable));
            print("Id: %s %s: %s Last update: %s" % (sensorId, data['name'], data['value'], lastUpdatedReadable));
    else:
        return response

def doMethod(deviceId, methodId, methodValue = 0):
        response = doRequest('device/info', {'id': deviceId})
        if (methodId == TELLSTICK_TURNON):
                method = 'on'
        elif (methodId == TELLSTICK_TURNOFF):
                method = 'off'
        elif (methodId == TELLSTICK_BELL):
                method = 'bell'
        elif (methodId == TELLSTICK_UP):
                method = 'up'
        elif (methodId == TELLSTICK_DOWN):
                method = 'down'
        if ('error' in response):
                name = ''
                retString = response['error']
        else:
                name = response['name']
                response = doRequest('device/command', {'id': deviceId, 'method': methodId, 'value': methodValue})
                if ('error' in response):
                        retString = response['error']
                else:
                        retString = response['status']
        if (methodId in (TELLSTICK_TURNON, TELLSTICK_TURNOFF)):
                print("Turning %s device %s, %s - %s" % ( method, deviceId, name, retString));
        elif (methodId in (TELLSTICK_BELL, TELLSTICK_UP, TELLSTICK_DOWN)):
                print("Sending %s to: %s %s - %s" % (method, deviceId, name, retString))
        elif (methodId == TELLSTICK_DIM):
                print("Dimming device: %s %s to %s - %s" % (deviceId, name, methodValue, retString))

def doRequest(method, params):
        global config
        consumer = oauth.OAuthConsumer(PUBLIC_KEY, PRIVATE_KEY)
        token = oauth.OAuthToken(config['token'], config['tokenSecret'])
        oauth_request = oauth.OAuthRequest.from_consumer_and_token(consumer, token=token, http_method='GET', http_url="http://api.telldus.com/json/" + method, parameters=params)
        oauth_request.sign_request(oauth.OAuthSignatureMethod_HMAC_SHA1(), consumer, token)
        headers = oauth_request.to_header()
        headers['Content-Type'] = 'application/x-www-form-urlencoded'
        conn = httplib.HTTPConnection("api.telldus.com:80")
        conn.request('GET', "/json/" + method + "?" + urllib.urlencode(params, True).replace('+', '%20'), headers=headers)
        response = conn.getresponse()
        return json.load(response)

def requestToken():
        global config
        consumer = oauth.OAuthConsumer(PUBLIC_KEY, PRIVATE_KEY)
        request = oauth.OAuthRequest.from_consumer_and_token(consumer, http_url='http://api.telldus.com/oauth/requestToken')
        request.sign_request(oauth.OAuthSignatureMethod_HMAC_SHA1(), consumer, None)
        conn = httplib.HTTPConnection('api.telldus.com:80')
        conn.request(request.http_method, '/oauth/requestToken', headers=request.to_header())
        resp = conn.getresponse().read()
        token = oauth.OAuthToken.from_string(resp)
        print 'Open the following url in your webbrowser:\nhttp://api.telldus.com/oauth/authorize?oauth_token=%s\n' % token.key
        print 'After logging in and accepting to use this application run:\n%s --authenticate' % (sys.argv[0])
        config['requestToken'] = str(token.key)
        config['requestTokenSecret'] = str(token.secret)
        saveConfig()

def getAccessToken():
        global config
        consumer = oauth.OAuthConsumer(PUBLIC_KEY, PRIVATE_KEY)
        token = oauth.OAuthToken(config['requestToken'], config['requestTokenSecret'])
        request = oauth.OAuthRequest.from_consumer_and_token(consumer, token=token, http_method='GET', http_url='http://api.telldus.com/oauth/accessToken')
        request.sign_request(oauth.OAuthSignatureMethod_HMAC_SHA1(), consumer, token)
        conn = httplib.HTTPConnection('api.telldus.com:80')
        conn.request(request.http_method, request.to_url(), headers=request.to_header())
        resp = conn.getresponse()
        if resp.status != 200:
                print 'Error retreiving access token, the server replied:\n%s' % resp.read()
                return
        token = oauth.OAuthToken.from_string(resp.read())
        config['requestToken'] = None
        config['requestTokenSecret'] = None
        config['token'] = str(token.key)
        config['tokenSecret'] = str(token.secret)
        print 'Authentication successful, you can now use tdtool'
        saveConfig()
def authenticate():
        try:
                opts, args = getopt.getopt(sys.argv[1:], '', ['authenticate'])
                for opt, arg in opts:
                        if opt in ('--authenticate'):
                                getAccessToken()
                                return
        except getopt.GetoptError:
                pass
        requestToken()

def saveConfig():
        global config
        try:
                os.makedirs(os.environ['HOME'] + '/.config/Telldus')
        except:
                pass
        config.write()

def readSettings():
	global config
	config = ConfigObj(os.environ['HOME'] + '/.config/Telldus/tdtool.conf')

def main(argv):
	readSettings()
	global config
        if ('token' not in config or config['token'] == ''):
                authenticate()
                return
        try:
                opts, args = getopt.getopt(argv, "lsn:f:d:b:v:i:h", ["list", "on=", "off=", "dim=", "bell=", "dimlevel=", "up=", "down=", "help", "sensor", "info="])
        except getopt.GetoptError:
                printUsage()
                sys.exit(2)
        dimlevel = -1
        print opts

	for opt, arg in opts:
                if opt in ("-h", "--help"):
                        printUsage()
                elif opt in ("-l", "--list"):
                        listDevices()
                elif opt in ("-s", "--sensor"):
                        listSensors(True)
                elif opt in ("-i", "--info"):
                        infoSensor(arg, True)
                elif opt in ("-n", "--on"):
                        doMethod(arg, TELLSTICK_TURNON)
                elif opt in ("-f", "--off"):
                        doMethod(arg, TELLSTICK_TURNOFF)
                elif opt in ("-b", "--bell"):
                        doMethod(arg, TELLSTICK_BELL)
                elif opt in ("-d", "--dim"):
                        if (dimlevel < 0):
                                print("Dimlevel must be set with --dimlevel before --dim")
                        else:
                                doMethod(arg, TELLSTICK_DIM, dimlevel)
                elif opt in ("-v", "--dimlevel"):
                        dimlevel = arg
                elif opt in ("--up"):
                        doMethod(arg, TELLSTICK_UP)
                elif opt in ("--down"):
                        doMethod(arg, TELLSTICK_DOWN)
if __name__ == "__main__":
        # config = ConfigObj(os.environ['HOME'] + '/.config/Telldus/tdtool.conf')
        main(sys.argv[1:])
