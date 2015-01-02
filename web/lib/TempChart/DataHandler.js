/* TempChart
 *
 *
 */

TempChart.DataHandler = TempChart.DataHandler || 

  /* Constructor
   * @param   options   object    configuration object to override default configuration
   */
  function(options) {
    console.log('INIT TempChart.DataHandler ::', options);

    // Store configuration options
    $.extend(this,options);

    this.strings = this.LANGUAGE.STRINGS[this.LANGUAGE.DEFAULT];

    // Bind GUI and APP events
    this.bindEvents();

  };
  
  

TempChart.DataHandler.prototype = {

  // Constants
  // ---------------
  DATA_URL: 'data/readings', // URL to load data from
  STATISTICS_DATA_URL: 'data/customreadings',
  USE_CACHE: true, // Use serverside json-cache
  LANGUAGE: {
    DEFAULT: 'sv',
    STRINGS:  {
      sv: {
        data_load_error: 'Inget data returnerades från servern.'
      }
    }
  },

  // Varibles
  // ---------------
  sensors: [],
  series: [],
  nrOfLoadedDataSources: 0,
  strings: {},

  // Methods
  // ---------------


  /* bindEvents
   *
   */
  bindEvents: function() {
    var me = this;
    $(document).bind('TempChart_load_readings', function(e, period, from, to) { 
      console.log('EVENT READ LOAD_READINGS ::', period, from, to);
      me.loadReadings(period, from, to); 
    });
    
    $(document).bind('TempChart_load_customReadings', function(e, readings) { 
      console.log('EVENT READ LOAD_CUSTOMREADINGS ::');
      me.series = []; // Reset data series
      me.doLoadReadings(me.STATISTICS_DATA_URL, readings, null, null, function(series, period) {
        $(document).trigger('TempChart_readings_loaded', [series, period]);
        console.log('EVENT FIRE READINGS_LOADED ::', series, period);
      });
    });

    $(document).bind('TempChart_load_sensors', function(e) { 
      console.log('EVENT READ LOAD_SENSORS ::');
      me.loadSensors(); 
    });

    $(document).bind('TempChart_update_sensor', function(e, sensor) { 
      console.log('EVENT READ UPDATE SENSOR ::', sensor);
      me.updateSensor(sensor);
    });   
  },

  /* loadSensors
   *  
   */
  loadSensors: function() {
    var me = this;
    me.doRequest({
      url: this.DATA_URL + 'sensors'
    }, function(sensors) {
      me.sensors = sensors;
      $(document).trigger('TempChart_sensors_loaded', [sensors]);
    });
  },

  /* loadReadings
   *  @param  sensors   array   string array containing senornames
   *  @param  period    string    named period to load data from
   *  @param  from    datetime  load data from this datetime
   *  @param  to      datetime  load data to this datetime
   */
  loadReadings: function(period, from, to) {
    this.series = []; // Reset data series
    this.nrOfLoadedDataSources = 0;
    if(typeof this.DATA_URL === 'string') {
      this.doLoadReadings(this.DATA_URL, period, from, to);
    } else {
      for (var i = 0; i < this.DATA_URL.length; i++) {
        this.doLoadReadings(this.DATA_URL[i], period, from, to, function(series, period) {
          this.nrOfLoadedDataSources++;
          if(typeof this.DATA_URL !== 'string' && this.nrOfLoadedDataSources === this.DATA_URL.length) {
            $(document).trigger('TempChart_readings_loaded', [series, period]);
            console.log('EVENT FIRE READINGS_LOADED ::', series, period);
          }
        }.bind(this));
      };
    }
  },

  doLoadReadings: function(data_url, period, from, to, callback) {
    $(document).trigger('TempChart_in_progress', [true]);
    var me = this;    
    var params = {
      tempstring: (new Date()).getTime(),
    };

    if(typeof me.USE_CACHE !== 'undefined') { params.usecache = me.USE_CACHE; }
    if(typeof period !== 'undefined' && period !== null) { params.period = period; }
    if(from) { params.from = from; }
    if(to) {   params.to = to; } 
    me.doRequest({
      url: data_url + '?' + $.param(params)
    },function(dataArray) {
      $.each(dataArray, function(j, data) {
        var seriesData;
        
        if (data.length > 3) {
          seriesData = data[4];
        }
          
        if (data[3] == 0 || data[3] == 'f0') { // temp (and forecast temp)
          me.series.push({
                    sensorId: data[0],
                    name: data[1],
                    color: data[2],
                    dashStyle: (data[3] == 'f0') ? 'solid' : 'solid',
                    tooltip: {
                        valueSuffix: ' \u00B0C'
                    },
                    data: seriesData
          });
        }
        else if (data[3] == 1  || data[3] == 'f1') { // humidity (and forecast humidity)
          me.series.push({
                    sensorId: data[0],
                    name: data[1],
                    color: data[2],
                    yAxis: 1,
                    dashStyle: (data[3] == 'f1') ? 'shortdot' : 'shortdot',
                    tooltip: {
                        valueSuffix: ' %'
                    },
                    data: seriesData
          });
        }     
        else if (data[3] == 2) { // electricity
          me.series.push({
                    sensorId: data[0],
                    name: data[1],
                    color: data[2],
                    yAxis: 2,
                    dashStyle: 'ShortDash',
                    tooltip: {
                        valueSuffix: ' w'
                    },
                    data: seriesData
          });
        }
        else { // statistics
          me.series.push({
                    data: data
                  });
        }
      });
      if(callback) {
        callback(me.series, period);
      }
    });
  },

  /** updateSensor
  *   @param  sensor  
  */
  updateSensor: function(sensor) {
    this.doRequest({
      url: this.DATA_URL + 'sensor/' + sensor.sensor_id,
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(sensor),
    }, function(data) {

    });
  },

  doRequest: function(options, callback) {
    var me = this;
    $.ajax(
      $.extend({dataType: 'json'},options))
      .done(function(data) {
        if(typeof data === 'object') {
          console.log('FUNCTION CALLBACK ::', data);
          if(data.error) {
            $(document).trigger('TempChart_error', [data.error]); 
          } else {
            callback(data);
          }
        } else {
          $(document).trigger('TempChart_error', [me.strings.data_load_error]); 
        }
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
          $(document).trigger('TempChart_error', [textStatus + ' ' + errorThrown, jqXHR]);
        });
  }
};