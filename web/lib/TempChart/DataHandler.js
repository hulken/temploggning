/* TempChart
 *
 *
 */

TempChart.DataHandler = TempChart.DataHandler || 

	/* Constructor
	 * @param 	options 	object 		configuration object to override default configuration
	 */
	function(options) {
		console.log('INIT TempChart.DataHandler ::', options);

		// Store configuration options
		$.extend(this,options);

		// Bind GUI and APP events
		this.bindEvents();

	};
	
	

TempChart.DataHandler.prototype = {

	// Constants
	// ---------------
	DATA_URL: 'data', // URL to load data from
	USE_CACHE: true, // Use serverside json-cache
	sensors: [],
	series: [],
	nrOfLoadedDataSources: 0,

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

		$(document).bind('TempChart_load_sensors', function(e) { 
			console.log('EVENT READ LOAD_SENSORS ::');
			me.loadSensors(); 
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
	 *	@param 	sensors 	array		string array containing senornames
	 *  @param  period 		string 		named period to load data from
	 *  @param  from 		datetime 	load data from this datetime
	 *  @param  to 			datetime 	load data to this datetime
	 */
	loadReadings: function(period, from, to) {
		this.series = []; // Reset data series
		this.nrOfLoadedDataSources = 0;
		if(typeof this.DATA_URL === 'string') {
			this.doLoadReadings(this.DATA_URL, period, from, to);
		} else {
			for (var i = 0; i < this.DATA_URL.length; i++) {
				this.doLoadReadings(this.DATA_URL[i], period, from, to);
			};
		}
	},

	doLoadReadings: function(data_url, period, from, to, last_load) {
		$(document).trigger('TempChart_in_progress', [true]);
		var me = this; 		
		var params = {
		    tempstring: (new Date()).getTime(),
		};

		if(typeof me.USE_CACHE !== 'undefined') { params.usecache = me.USE_CACHE; }
		if(typeof period !== 'undefined' && period !== null) { params.period = period; }
		if(from) { 	 params.from = from; }
		if(to) { 	 params.to = to; } 
		me.doRequest({
			url: data_url + '?' + $.param(params)
		},function(dataArray) {
			console.log('CALLBACK DATA LOADED ::', dataArray);
			me.nrOfLoadedDataSources++;
            $.each(dataArray, function(j, data) {
                var seriesData;
                
                if (data.length > 3) {
                    seriesData = data[4];
                }
                
                if (data[3] == 0) { // temp
					me.series.push({
	                	name: data[1],
	                	color: data[2],
	                	tooltip: {
		                    valueSuffix: ' \u00B0C'
		                },
	                	data: seriesData
					});
				}
				else if (data[3] == 1) { // humidity
					me.series.push({
	                	name: data[1],
	                	color: data[2],
	                	yAxis: 1,
	                	dashStyle: 'shortdot',
	                	tooltip: {
		                    valueSuffix: ' %'
		                },
	                	data: seriesData
					});
				}
            });
            if(typeof me.DATA_URL !== 'string' && me.nrOfLoadedDataSources === me.DATA_URL.length) {
				$(document).trigger('TempChart_readings_loaded', [me.series, period]);
				console.log('EVENT FIRE READINGS_LOADED ::', me.series, period);
			}
		});
	},

	/** updateSensor
	* 	@param 	sensor 	
	*/
	updateSensor: function(sensor) {

	},

	doRequest: function(options, callback) {
		$.ajax(
			$.extend({dataType: 'json'},options))
			.done(function(data) {
				if(typeof data === 'object') {
					callback(data);
				} else {
					$(document).trigger('TempChart_error', ['Inget data returnerades från servern.']);	
				}
			})
			.fail(function(jqXHR, textStatus, errorThrown) {
    			$(document).trigger('TempChart_error', [textStatus + ' ' + errorThrown, jqXHR]);
    		});
	}
};