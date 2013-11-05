/* TempChart
 *
 *
 */

var TempChart = TempChart || 

	/* Constructor
	 * @param 	options 	object 		configuration object to override default configuration
	 */
	function(options) {
		// Store configuration options
		$.extend(this,options);

		// Set highcharts defautls
		Highcharts.setOptions({
		    global: {
		        useUTC: false
		    }
		});

		// Get main elements
		this.$mainElement = $('#' + this.MAIN_ELEMENT_ID);
		this.$controlsElement = $('#' + this.CONTROLS_ELEMNT_ID);

		// Bind GUI and APP events
		this.bindEvents();

		// Initiate sensor load
		this.loadSensors();
	};

TempChart.prototype = {

	// Constants
	// ---------------
	DATA_URL: 'data', // URL to load data from
	USE_CACHE: true, // Use serverside json-cache
	MAIN_ELEMENT_ID: 'graph', // Main graph html element id
	CONTROLS_ELEMNT_ID: 'controls', // Controls html element id
	LINE_COLORS: [
		'#4572A7', 
		'#AA4643', 
		'#89A54E', 
		'#80699B', 
		'#3D96AE', 
		'#DB843D', 
		'#92A8CD', 
		'#A47D7C', 
		'#B5CA92'
	], // Default line colors, overridden if server data contains colors

	// Varibles
	// ---------------
	$mainElement: null,
	$controlsElement: null,
	chart: null,
	sensors: [],
	refreshIntervalId: null,

	// Methods
	// ---------------


	/* bindEvents
	 *
	 */
	bindEvents: function() {
		var me = this;
		$(document).bind('TempChart_error', function(e, msg, xhr) { me.showErrorMessage(msg) });
		$(document).bind('TempChart_sensors_loaded', function(e, sensors) { me.loadView() });
		$(document).bind('TempChart_in_progress', function(e, show) { me.showLoadingMessage(show); });
		$(document).bind('TempChart_data_loaded', function(e, series, period) {
			if(period === 'latest') {
				me.visualizeSingleValuesView(series);
			} else {
				me.createChartView(series); 
			}
		});

		window.onhashchange = function() {
			me.loadView();
		};

		$(document).on('submit','#customView',function(e) {
		 // console.log((((new Date($('#todatetime').val() + ':00')).getTime()/1000) - ((new Date($('#fromdatetime').val() + ':00')).getTime()/1000))/60/60/24);
		  me.loadData(me.sensors, null, ((new Date($('#fromdatetime').val() + ':00')).getTime()/1000), ((new Date($('#todatetime').val() + ':00')).getTime()/1000))
		  e.preventDefault();
		  return false;
		});

		$(document).on('click','#refreshButton',function(e) {
			me.loadView();
			e.preventDefault();
			return false;
		});

		
	},

	/* loadView
	 *
	 */
	loadView: function() {
		this.stopAutoRefresh();
		var period = this._getPeriod();
		if(period === 'compare') {
			this._createCompareView();
		} else if(period === 'custom') {
			this._createCustomView();
		} else {
			this.startAutoRefresh();
			this.$controlsElement.html('');
			this.loadData(this.sensors, period);
		}
	},

	/* loadSensors
	 *
	 */
	loadSensors: function() {
		var me = this;
		me._doRequest({
				url: this.DATA_URL
		},function(sensors) {
			me.sensors = sensors;
			$(document).trigger('TempChart_sensors_loaded', [sensors]);
		});
	},

	/* loadData
	 *	@param 	sensors 	array		string array containing senornames
	 *  @param  period 		string 		named period to load data from
	 *  @param  from 		datetime 	load data from this datetime
	 *  @param  to 			datetime 	load data to this datetime
	 */
	loadData: function(sensors, period, from, to) {
		$(document).trigger('TempChart_in_progress', [true]);
		var me = this;
		//var seriesCounter = 0;
		var series = []; 		
		//$.each(sensors, function(i, sensor) {
			var params = {
		//		sensor: sensor.name,
                tempstring: (new Date()).getTime(),
			};
			if(typeof me.USE_CACHE !== 'undefined') { params.usecache = me.USE_CACHE; }
			if(typeof period !== 'undefined' && period !== null) { params.period = period; }
			if(from) { 	 params.from = from; }
			if(to) { 	 params.to = to; } 
			me._doRequest({
				url: me.DATA_URL + '?' + $.param(params)
			},function(datas) {
				
                $.each(datas, function(j, data) {
                    // console.log(data[1].length);
                    
                    var seriesData;
                    
                    if (data.length > 2) {
                        seriesData = data[3];
                    }
                    
					series.push({
                    	name: data[1],
                    	color: data[2],
                    	data: seriesData
					});
                });
                console.log('\n');

				//
				//
				//
				//
				//

				//seriesCounter++;

				//if (seriesCounter == sensors.length) { // All data is loaded
				//me._sortSeries(series,'name');
						$(document).trigger('TempChart_data_loaded', [series, period]);
				//}
			});
		//});
		
	
	},

	/* showLoadingMessage
	 * @param 		show 	boolean 	show loading message or not
	 */
	showLoadingMessage: function(show) {
		$('#loading').modal(show ? 'show' : 'hide');
	},

	/* showErrorMessage
	 * @param 		message 	string 		error message to display
	 */
	showErrorMessage: function(message) {
		$('#error .modal-body').html(message);
		$('#error').modal('show');
	},

	/* updateData
	 * @param 		dataArray 		array 		update highcharts data
	 */
	updateData: function(dataArray) {
		$.each(this.chart.series, function(i, serie) {
			serie.setData(dataArray[serie.name]);
		});
	},

	/* visualizeSingleValuesView
	 * @param 	series 		array 		highcharts data series array
	 */
	visualizeSingleValuesView: function(series) {
		var me = this;
		me._sortSeries(series);
		me.$controlsElement.html('');
		
		var spacerAdded = false;
		var colorClass = 'header-black';
		var tableStr = '<table class="table latest-table table-responsive"><tbody>';
		$.each(series, function(i, serie) {
			if (serie.data.length > 0) {
				d = Highcharts.dateFormat('%Y.%m.%d %H:%M', new Date(serie.data[0][0]));
				tableStr += '<tr class="' + colorClass +'"><td class="first-td"><h1 class="heading1">' + serie.data[0][1].toFixed(1) + '</h1></td><td class="second-td">' + serie.name + '<br><span class="latest-date">' + d + '</span></td></tr>';
				if((i) < series.length && series[(i)].data[0][0] < ((new Date().getTime()) - 86400000) && !spacerAdded) {
					//tableStr += '<tr><td class="latest-spacer"></td><td class="latest-spacer"></td></tr>';
					spacerAdded = true;
					colorClass = 'header-gray';
				} 
			}
			
		});
		tableStr += '</tbody></table>';
		me.$mainElement.html(tableStr);

		$(document).trigger('TempChart_in_progress', [false]);
	},

	/* createChartView
	 * 
	 * @param 	series 		array 		highcharts data series array
	 *
	 */
	createChartView: function(series) {
		var me = this;
        this.chart = new Highcharts.Chart({
        	credits: { enabled: false },
            chart: {
                renderTo: this.MAIN_ELEMENT_ID,
                type: 'spline'
            },
            colors: me.LINE_COLORS,
            title: {
                text: ''
            },
            subtitle: {
                text: ''
            },
            legend: {
			    itemStyle: {
			        color: '#000000',
			        fontFamily: 'Helvetica, Arial, Verdana, sans-serif', // default font
					fontSize: '16px'
			    }
			},
            xAxis: {
                type: 'datetime',
                labels: {
	                style: {
			        	fontFamily: 'Helvetica, Arial, Verdana, sans-serif', // default font
						fontSize: '14px'
					}
				}
            },
            yAxis: {
                title: {
                    text: ''
                },
                labels: {
	                style: {
			        	fontFamily: 'Helvetica, Arial, Verdana, sans-serif', // default font
						fontSize: '14px'
					}
				}
            },
            tooltip: {
                formatter: function() {
                        return '<b>'+ this.series.name +'</b> <br/>'+
                        Highcharts.dateFormat('%Y.%m.%d %H:%M', this.x) +' <b>'+ this.y.toFixed(2) +' \u00B0C</b>';
                }
            },
			plotOptions: {
                spline: {
                    lineWidth: 4,
                    states: {
                        hover: {
                            lineWidth: 5
                        }
                    },
                    marker: {
                        enabled: false,
                        states: {
                            hover: {
                                enabled: true,
                                symbol: 'circle',
                                radius: 5,
                                lineWidth: 1
                            }
                        }
                    }
                }
            },
            
            series: series
        });
		$(document).trigger('TempChart_in_progress', [false]);
	},

	/* startAutoRefresh
	 * 
	 */
	startAutoRefresh: function() {
		var me = this;
		me.refreshIntervalId = setInterval(function() {
			if((new Date()).getMinutes() % 5 === 0) {
				me.loadView();
			}
		}, 60000);
	},

	/* stopAutoRefresh
	 * 
	 */
	stopAutoRefresh: function() {
		clearInterval(this.refreshIntervalId);
	},


	_doRequest: function(options, callback) {
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
	},

	/* _createCustomView
	 * 
	 */
	_createCustomView: function() {
		this.$mainElement.html('');
		var d = new Date();
		var str = '<div class="well">' + 
				'<form id="customView" class="form-inline">' +
				'<div class="form-group">' +
					'<label class="col-sm-2 control-label" for="fromdatetime">Fr&aring;n</label>' +
					'<div class="controls col-sm-10">' +
			 			'<div class="input-group date datetimepicker">' +
				   			'<input class="form-control" id="fromdatetime" data-format="yyyy-MM-dd hh:mm" type="text" value="' + Highcharts.dateFormat('%Y-%m-%d %H:%M', d.setDate(d.getDate() - 1)) + '"></input>' +
				    		'<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span>' +
			      		'</div>' +
		  			'</div>' +
		  		'</div>' +
		  		'<div class="form-group">' +
		  			'<label class="col-sm-2 control-label" for="todatetime">Till</label>' +
		  			'<div class="controls col-sm-10">' +
			  			'<div class="input-group date datetimepicker">' +
				   			'<input class="form-control" id="todatetime" data-format="yyyy-MM-dd hh:mm" type="text" value="' + Highcharts.dateFormat('%Y-%m-%d %H:%M', new Date()) + '"></input>' +
				    		'<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span>' +
			      		'</div>' +
		  			'</div>' +
		  		'</div>' +
				'<button type="submit" class="btn">Uppdatera</button>' + 
			'</div>' +
			'</div>' +
			'</form>';
		this.$controlsElement.html(str);
		$('.datetimepicker').datetimepicker({
	      language: 'pt-BR',
	      pickSeconds: false,
	      pick12HourFormat: false
	    });
	},


	/* _createCompareView
	 * DEPRECATED, needs to be updated to Boostrap 3 html syntax
	 */
	_createCompareView: function() {
		this.$mainElement.html('');
		var d = new Date();
		var str = '<div class="well">' + 
				'<form id="customView" class="form-horizontal">' +
				'<div class="control-group">' +
				'<label class="control-label" for="sensorselect">Sensor</label>' +
				'<div class="controls">' +
				'<select id="sensorselect">';
		$.each(this.sensors, function(i, sensor) {
			str += '<option>' + sensor.name + '</option>';
		});
		str += '</select>' +
				'</div>' +
				'<label class="control-label" for="fromdatetime">Fr&aring;n</label>' +
				'<div class="controls">' +
		 			'<div class="input-append date datetimepicker">' +
			   			'<input id="fromdatetime" data-format="yyyy-MM-dd hh:mm" type="text" value="' + Highcharts.dateFormat('%Y-%m-%d %H:%M', d.setDate(d.getDate() - 1)) + '"></input>' +
			    		'<span class="add-on">' +
			      			'<i data-time-icon="icon-time" data-date-icon="icon-calendar"></i>' +
			      		'</span>' +
		      		'</div>' +
	  			'</div>' +
	  			'<label class="control-label" for="todatetime">Till</label>' +
	  			'<div class="controls">' +
		  			'<div class="input-append date datetimepicker">' +
			   			'<input id="todatetime" data-format="yyyy-MM-dd hh:mm" type="text" value="' + Highcharts.dateFormat('%Y-%m-%d %H:%M', new Date()) + '"></input>' +
			    		'<span class="add-on">' +
			      			'<i data-time-icon="icon-time" data-date-icon="icon-calendar"></i>' +
			      		'</span>' +
		      		'</div>' +
	  			'</div>' +

	  			'</div>' +
				'<label class="control-label" for="fromdatetime">Fr&aring;n</label>' +
				'<div class="controls">' +
		 			'<div class="input-append date datetimepicker">' +
			   			'<input id="fromdatetime" data-format="yyyy-MM-dd hh:mm" type="text" value="' + Highcharts.dateFormat('%Y-%m-%d %H:%M', d.setDate(d.getDate() - 365)) + '"></input>' +
			    		'<span class="add-on">' +
			      			'<i data-time-icon="icon-time" data-date-icon="icon-calendar"></i>' +
			      		'</span>' +
		      		'</div>' +
	  			'</div>' +
	  			'<label class="control-label" for="todatetime">Till</label>' +
	  			'<div class="controls">' +
		  			'<div class="input-append date datetimepicker">' +
			   			'<input id="todatetime" data-format="yyyy-MM-dd hh:mm" type="text" value="' + Highcharts.dateFormat('%Y-%m-%d %H:%M', d.setDate(d.getDate() + 1)) + '"></input>' +
			    		'<span class="add-on">' +
			      			'<i data-time-icon="icon-time" data-date-icon="icon-calendar"></i>' +
			      		'</span>' +
		      		'</div>' +
	  			'</div>' +
	  			'<button type="submit" class="btn">Uppdatera</button>' + 
			'</div>' +
			'</div>' +
			'</form>';
		this.$controlsElement.html(str);
		$('.datetimepicker').datetimepicker({
	      language: 'pt-BR',
	      pickSeconds: false
	    });
		
	},

	/* _sortSeries
	 * @param 	series 		array 		highcharts data series array
	 * @param 	by 			string 		optionial, none or name is implemented
	 */
	_sortSeries: function(series, by) { 
		var x, y, holder; 
		// The Bubble Sort method. 
	  	for(x = 0; x < series.length; x++) { 
	    	var swapOccured = false;
		    for(y = 0; y < (series.length-1); y++) { 
		      	if((by === 'name' && series[y].name.localeCompare(series[y+1].name) > 0) || (series[y].data.length > 0 && series[y+1].data.length > 0 && series[y].data[0][0] < series[y+1].data[0][0])) {

		        	holder = series[y+1]; 
		        	series[y+1] = series[y]; 
		        	series[y] = holder; 
		        	swapOccured = true;
		      	} 
		    }
		    if (!swapOccured) break; 
		}
	},

	/* _getPeriod
	 * 
	 */
	_getPeriod: function() {
		var hash = window.location.hash;
		$('.nav-opt').removeClass('active');
		$(hash === '' ? '#latest': hash).addClass('active'); // Set menu item to active, or activate start item aka latest
		switch(hash) {
			case '#custom':
			case '#compare':
			case '#latest': 
				return hash.replace('#','');
				break;
			case '#day': 
				return 1;
				break;
			case '#week': 
				return 7;
				break;
			case '#month': 
				return 30;
				break;
			case '#year': 
				return 100000;
				break;
			default:
				return 'latest'; // Start view
				break;
		}
	}
};