/* TempChart
 *
 *	Requiers: [
 * 		Highcharts
 *  	TempChart.DataHandler	
 *	]
 */

TempChart.Charter = TempChart.Charter || 

	/* Constructor
	 * @param 	options 	object 		configuration object to override default configuration
	 */
	function(options) {
		console.log('INIT TempChart.Charter ::', options);

		// Store configuration options
		$.extend(this,options);

		this.strings = this.LANGUAGE.STRINGS[this.LANGUAGE.DEFAULT];

		// Set highcharts defautls
		if(typeof Highcharts !== 'undefined') {
			Highcharts.setOptions({
			    global: {
			        useUTC: false
			    }
			});
		} else {

		}
		// Get main elements
		this.$mainElement = $('#' + this.MAIN_ELEMENT_ID);
		this.$controlsElement = $('#' + this.CONTROLS_ELEMNT_ID);

		
		// Bind GUI and APP events
		this.bindEvents();

		// Initiate sensor load
		this.loadView();
	};
	
	

TempChart.Charter.prototype = {

	// Constants
	// ---------------
	BIND_EVENTS: true,
	LOAD_ON_INITATE: true,
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
	LANGUAGE: {
		DEFAULT: 'sv',
		STRINGS:  {
			sv: {
				from: 'Fr&aring;n',
				humidity: 'Luftfuktighet',
				temperature: 'Temperatur',
				electricity: 'Elektricitet',
				update: 'Uppdatera',
				to: 'Till'
			}
		}
	},
	HOURS: ['NULL','00:00','01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00'],
	WEEKDAYS: ['NULL','Man', 'Tis', 'Ons', 'Tor', 'Fre', 'Lor', 'Son'],
	MONTHS: ['NULL', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	xAxisCATEGORIES: [],
	INTERVALS: {
		day: 1,
		week: 7,
		month: 30,
		year: 100000
	},
	// Varibles
	// ---------------
	$mainElement: null,
	$controlsElement: null,
	chart: null,
	sensors: [],
	series: [],
	nrOfLoadedDataSources: 0,
	refreshIntervalId: null,
	strings: {},

	// Methods
	// ---------------


	/* bindEvents
	 *
	 */
	bindEvents: function() {
		var me = this;
		$(document).bind('TempChart_readings_loaded', function(e, series, period) {
			if(period === 'latest') {
				me.visualizeSingleValuesView(series);
			} else if(period === 'statistics-minmax') {
				me.visualizeMinMaxView(series);
			} else if (period === 'statistics-avg-hour' || period === 'statistics-avg-weekday' || period === 'statistics-avg-month' ){
				//Set xAxis labels
				if (period === 'statistics-avg-hour') { 
					me.xAxisCATEGORIES = me.HOURS;
					me._createStatisticsView(series, 1);
				}
				else if (period === 'statistics-avg-weekday') { 
					me.xAxisCATEGORIES = me.WEEKDAYS;
					me._createStatisticsView(series, 1);
				}
				else if (period === 'statistics-avg-month') { 
					me.xAxisCATEGORIES = me.MONTHS; 
					me._createStatisticsView(series, 2);
				}
				else {
					me._createStatisticsView(series, 2);	
				}
				
				// Hide not choosen series from cookie
		      	$.each(me.chart.series, function(i, serie) {
		        	var cookieValue = me.getCookie(serie.name);
		          	if (cookieValue == 'false') {
		              	serie.setVisible(false);
		          	}
		      	});	
			} else {
				if (period === me.INTERVALS['year']) {
					me.createChartView(series, 30); // 365 data points
				}
				else if (period === me.INTERVALS['month']) {
					me.createChartView(series, 20); // 30 data points
				}
				else if (period === me.INTERVALS['week']) {
					me.createChartView(series, 42); // 168 data points (7 enough, but using instead to display forecast properly)
				}
				else if (period === me.INTERVALS['day']) {
					me.createChartView(series, 7); // 144 data points (3 enough, but using instead to display forecast properly)
				}
				else { // Custom?
					me.createChartView(series, 2); 
				}

				// Hide not choosen series from cookie
		      	$.each(me.chart.series, function(i, serie) {
		        	var cookieValue = me.getCookie(serie.name);
		          	if (cookieValue == 'false') {
		              	serie.setVisible(false);
		          	}
		      	});
	      	}
		});

		window.onhashchange = function() {
			me.loadView();
		};

		$(document).on('submit','#customView',function(e) {
			var period = me.INTERVALS.day;
			var from = (new Date($('#fromdatetime').val() + ':00')).getTime()/1000;
			var to = (new Date($('#todatetime').val() + ':00')).getTime()/1000;
			console.log('EVENT FIRE LOAD_READINGS ::', period, from, to);
			$(document).trigger('TempChart_load_readings', [period, from, to]);
			e.preventDefault();
		});

		$(document).on('click','#refreshButton',function(e) {
			me.loadView();
			e.preventDefault();
		});

		$("#nav-collapse .nav li a").click(function(event) {
			// Hide menu item select
	    	$("#nav-collapse").removeClass("in").addClass("collapse");
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
		}
		else if (period === 'statistics-minmax') {
			this.$controlsElement.html('');
			console.log('EVENT FIRE LOAD_CUSTOMREADINGS ::', period);
			$(document).trigger('TempChart_load_customReadings', [period]);
		}
		 else if(period === 'custom') {
			this._createCustomView();
		} else if (period === 'statistics-avg-hour' || period === 'statistics-avg-weekday' || period === 'statistics-avg-month'  ) {
      		this.startAutoRefresh();
			this.$controlsElement.html('');
			console.log('EVENT FIRE LOAD_READINGS ::', period);
			$(document).trigger('TempChart_load_readings', [period]);
		} else {
			this.startAutoRefresh();
			this.$controlsElement.html('');
			console.log('EVENT FIRE LOAD_READINGS ::', period);
			$(document).trigger('TempChart_load_readings', [period]);


		}
	},

	/* visualizeSingleValuesView
	 * @param 	series 		array 		highcharts data series array
	 */
	visualizeSingleValuesView: function(series) {
		var me = this;
		me._sortSeries(series, 'name');
		me.$controlsElement.html('');
		
		var spacerAdded = false;
		var colorClass = 'header-black';
		var tableStr = '<table class="table latest-table table-responsive"><tbody>';
		$.each(series, function(i, serie) {
			if (serie.data.length > 0) {
				var unit = series[i].tooltip.valueSuffix;
				d = Highcharts.dateFormat('%Y-%m-%d %H:%M', new Date(serie.data[0][0]));
				if((i) < series.length && series[(i)].data[0][0] < ((new Date().getTime()) - 86400000) && !spacerAdded) {
					//tableStr += '<tr><td class="latest-spacer"></td><td class="latest-spacer"></td></tr>';
					spacerAdded = true;
					colorClass = 'header-gray';
				} 
				tableStr += '<tr class="' + colorClass +'"><td class="first-td"><h1 class="heading1">' + serie.data[0][1].toFixed(1) + '</h1></td><td class="second-td">' + unit + ' - ' + serie.name + '<br><span class="latest-date">' + d + '</span></td></tr>';
			}
			
		});

		tableStr += '</tbody></table>';
		me.$mainElement.html(tableStr);

		$(document).trigger('TempChart_in_progress', [false]);
	},
	
	/* visualizeMinMaxValuesView
	 * @param 	series 		array 		highcharts data series array
	 */
	visualizeMinMaxView: function(series) {

		var me = this;
		//me._sortSeries(series);
		me.$controlsElement.html('');
		
		var spacerAdded = false;
		var colorClass = 'header-black';
		var tableStr = '<table class="table latest-table table-responsive"><tbody>';
		
		tableStr += '<tr>' + '<td><b>Matare</b></td>'+ '<td><b>Min-Datum</b></td>'+ '<td><b>Min-varde</b></td>'+ '<td><b>Medelvarde senaste 24h</b></td>'+ '<td><b>Max-datum</b></td>'+ '<td><b>Maxvarde</b></td>'  + '<tr>';
		$.each(series, function(i, serie) {
        //console.log(serie);
        tableStr += '<tr>' + '<td>'+serie.data['name']+'</td>'+ '<td>'+serie.data['mindaydate']+'</td>'+ '<td>'+Math.round(serie.data['minval'] * 100) / 100+'</td>'+ '<td>'+Math.round(serie.data['avgvalue'] * 100) / 100+'</td>'+ '<td>'+serie.data['maxdaydate']+'</td>'+ '<td>'+Math.round(serie.data['maxval'] * 100) / 100+'</td>'  + '<tr>';
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
	createChartView: function(series, gapSize) {
		var me = this;
        this.chart = new Highcharts.Chart({
        	credits: { enabled: false },
            chart: {
                renderTo: this.MAIN_ELEMENT_ID,
                defaultSeriesType: 'spline',
                type: 'spline',
                zoomType: 'x'
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
            yAxis: [{ // Primary axis
				labels: {
                    formatter: function() {
                        return this.value + ' \u00B0C';
                    },
                    style: {
			        	fontFamily: 'Helvetica, Arial, Verdana, sans-serif', // default font
						fontSize: '14px',
						color: '#000000'
                    }
                },
                title: {
                    text: this.strings.temperature,
                    style: {
						fontFamily: 'Helvetica, Arial, Verdana, sans-serif', // default font
						fontSize: '14px',
						color: '#000000'
                    }
                },
                plotLines:[{ // Zero degrees-line
                    value: 0,
                    color: 'rgba(255, 0, 0, 0.15)',
                    width: 5,
                    zIndex: 1
                }],
                plotBands: [{ // Cool temperatures
                    from: -40,
                    to: 0,
                    color: 'rgba(68, 170, 213, 0.05)',
                }],
                showEmpty: false
            }, { // Secondary yAxis
                gridLineWidth: 0,
                title: {
                    text: this.strings.humidity,
                    style: {
			        	fontFamily: 'Helvetica, Arial, Verdana, sans-serif', // default font
						fontSize: '14px',
						color: '#000000'
                    }
                },
                labels: {
                    formatter: function() {
                        return this.value +' %';
                    },
                    style: {
			        	fontFamily: 'Helvetica, Arial, Verdana, sans-serif', // default font
						fontSize: '14px',
						color: '#000000'
                    }
                },
                opposite: true,
                showEmpty: false
			}, { // Third yAxis
                gridLineWidth: 0,
                title: {
                    text: this.strings.electricity,
                    style: {
			        	fontFamily: 'Helvetica, Arial, Verdana, sans-serif', // default font
						fontSize: '14px',
						color: '#000000'
                    }
                },
                labels: {
                    formatter: function() {
                        return this.value +' w';
                    },
                    style: {
			        	fontFamily: 'Helvetica, Arial, Verdana, sans-serif', // default font
						fontSize: '14px',
						color: '#000000'
                    }
                },
                opposite: true,
                showEmpty: false
			}],
            tooltip: {
                formatter: function() {
                	var unit = '\u00B0C';

                	if (this.series.yAxis.userOptions.index == 1) { // humidity
                		unit = '%';
                	}
                	if (this.series.yAxis.userOptions.index == 2) { // electricity
                		unit = 'w';
                	}

                    return '<b>'+ this.series.name + '</b> <br/>' +
                        Highcharts.dateFormat('%Y.%m.%d %H:%M', this.x) + ' <b>' + this.y.toFixed(2) + ' ' + unit + '</b>';
                }
            },
			plotOptions: {
                spline: {
                    events: {
                      legendItemClick: function () {
                        me.setCookie(this.name, !this.visible, 7);
                      }
                    },
                    lineWidth: 2,
                    connectNulls: false,
                    gapSize: gapSize, /* Day: 2, Week: 5, Month: 10, Year = 20 */ 
                    states: {
                        hover: {
                            lineWidth: 5
                        }
                    },
                    marker: {
                        enabled: true,
                        radius: 1,
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

	/* updateData
	 * @param 		dataArray 		array 		update highcharts data
	 */
	updateData: function(dataArray) {
		$.each(this.chart.series, function(i, serie) {
			serie.setData(dataArray[serie.name]);
		});
	},

	/* Get cookie
	*
	*/
	getCookie: function(c_name) {
		var c_value = document.cookie;
		var c_start = c_value.indexOf(' ' + c_name + '=');
		if (c_start == -1)  {
			c_start = c_value.indexOf(c_name + '=');
		}
		
		if (c_start == -1)  {
			c_value = null;
		}
		else  {
			c_start = c_value.indexOf('=', c_start) + 1;
			var c_end = c_value.indexOf(';', c_start);

		    if (c_end == -1)    {
		    	c_end = c_value.length;
			}

			c_value = unescape(c_value.substring(c_start,c_end));
		}

	  return c_value;
	},

	/* Set cookie
	*
	*/
	setCookie: function(c_name, value, exdays)
	{
		var exdate = new Date();
		exdate.setDate(exdate.getDate() + exdays);
		var c_value = escape(value) + ((exdays == null) ? '' : '; expires=' + exdate.toUTCString());
		document.cookie = c_name + '=' + c_value;
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
					'<label class="col-sm-2 control-label" for="fromdatetime">' + this.strings.from + '</label>' +
					'<div class="controls col-sm-10">' +
			 			'<div class="input-group date datetimepicker">' +
				   			'<input class="form-control" id="fromdatetime" data-format="yyyy-MM-dd hh:mm" type="text" value="' + Highcharts.dateFormat('%Y-%m-%d %H:%M', d.setDate(d.getDate() - 1)) + '"></input>' +
				    		'<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span>' +
			      		'</div>' +
		  			'</div>' +
		  		'</div>' +
		  		'<div class="form-group">' +
		  			'<label class="col-sm-2 control-label" for="todatetime">' + this.strings.to + '</label>' +
		  			'<div class="controls col-sm-10">' +
			  			'<div class="input-group date datetimepicker">' +
				   			'<input class="form-control" id="todatetime" data-format="yyyy-MM-dd hh:mm" type="text" value="' + Highcharts.dateFormat('%Y-%m-%d %H:%M', new Date()) + '"></input>' +
				    		'<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span>' +
			      		'</div>' +
		  			'</div>' +
		  		'</div>' +
				'<button type="submit" class="btn">' + this.strings.update + '</button>' + 
			'</div>' +
			'</div>' +
			'</form>';
		this.$controlsElement.html(str);
		$('.datetimepicker').datetimepicker({
	      language: 'sv-SE',
	      pickSeconds: false,
	      pick12HourFormat: false
	    });
	},
	
		/* _createStatisticsView
	 * 
	 */
	_createStatisticsView: function(series, gapSize) {   
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
                categories: this.xAxisCATEGORIES,
                labels: {
	                style: {
			        	fontFamily: 'Helvetica, Arial, Verdana, sans-serif', // default font
						fontSize: '14px'
					}
				}
            },
            yAxis: [{ // Primary axis
				labels: {
                    formatter: function() {
                        return this.value + ' \u00B0C';
                    },
                    style: {
			        	fontFamily: 'Helvetica, Arial, Verdana, sans-serif', // default font
						fontSize: '14px',
						color: '#000000'
                    }
                },
                title: {
                    text: this.strings.temperature,
                    style: {
						fontFamily: 'Helvetica, Arial, Verdana, sans-serif', // default font
						fontSize: '14px',
						color: '#000000'
                    }
                },
                plotLines:[{
                    value:0,
                    color: 'rgba(255, 0, 0, 0.15)',
                    width:5,
                    zIndex:1
                }],
                plotBands: [{ // Light air
                    from: -40,
                    to: 0,
                    color: 'rgba(68, 170, 213, 0.05)',
                }],
                showEmpty: false
            }, { // Secondary yAxis
                gridLineWidth: 0,
                title: {
                    text: this.strings.humidity,
                    style: {
			        	fontFamily: 'Helvetica, Arial, Verdana, sans-serif', // default font
						fontSize: '14px',
						color: '#000000'
                    }
                },
                labels: {
                    formatter: function() {
                        return this.value +' %';
                    },
                    style: {
			        	fontFamily: 'Helvetica, Arial, Verdana, sans-serif', // default font
						fontSize: '14px',
						color: '#000000'
                    }
                },
                opposite: true,
                showEmpty: false
			}, { // Third yAxis
                gridLineWidth: 0,
                title: {
                    text: this.strings.electricity,
                    style: {
			        	fontFamily: 'Helvetica, Arial, Verdana, sans-serif', // default font
						fontSize: '14px',
						color: '#000000'
                    }
                },
                labels: {
                    formatter: function() {
                        return this.value +' w';
                    },
                    style: {
			        	fontFamily: 'Helvetica, Arial, Verdana, sans-serif', // default font
						fontSize: '14px',
						color: '#000000'
                    }
                },
                opposite: true,
                showEmpty: false
			}],
            tooltip: {
                formatter: function() {
                	var unit = '\u00B0C';

                	if (this.series.yAxis.userOptions.index == 1) { // humidity
                		unit = '%';
                	}
                	if (this.series.yAxis.userOptions.index == 2) { // electricity
                		unit = 'w';
                	}

                    return '<b>'+ this.series.name + '</b> <br/>' +
                        this.x + ' <b>' + this.y.toFixed(2) + ' ' + unit + '</b>';
                }
            },
			plotOptions: {
                spline: {
                    events: {
                      legendItemClick: function () {
                        me.setCookie(this.name, !this.visible, 7);
                      }
                    },
                    lineWidth: 2,
                    connectNulls: false,
                    gapSize: gapSize,
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
	



	/* _createCompareView
	 * OUTDATED, needs to be updated to Boostrap 3 html syntax
	 */
	_createCompareView: function() {
		console.warn('OUTDATED, needs to be updated to Boostrap 3 html syntax');
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
				'<label class="control-label" for="fromdatetime">' + this.strings.from + '</label>' +
				'<div class="controls">' +
		 			'<div class="input-append date datetimepicker">' +
			   			'<input id="fromdatetime" data-format="yyyy-MM-dd hh:mm" type="text" value="' + Highcharts.dateFormat('%Y-%m-%d %H:%M', d.setDate(d.getDate() - 1)) + '"></input>' +
			    		'<span class="add-on">' +
			      			'<i data-time-icon="icon-time" data-date-icon="icon-calendar"></i>' +
			      		'</span>' +
		      		'</div>' +
	  			'</div>' +
	  			'<label class="control-label" for="todatetime">' + this.strings.to + '</label>' +
	  			'<div class="controls">' +
		  			'<div class="input-append date datetimepicker">' +
			   			'<input id="todatetime" data-format="yyyy-MM-dd hh:mm" type="text" value="' + Highcharts.dateFormat('%Y-%m-%d %H:%M', new Date()) + '"></input>' +
			    		'<span class="add-on">' +
			      			'<i data-time-icon="icon-time" data-date-icon="icon-calendar"></i>' +
			      		'</span>' +
		      		'</div>' +
	  			'</div>' +

	  			'</div>' +
				'<label class="control-label" for="fromdatetime">' + this.strings.from + '</label>' +
				'<div class="controls">' +
		 			'<div class="input-append date datetimepicker">' +
			   			'<input id="fromdatetime" data-format="yyyy-MM-dd hh:mm" type="text" value="' + Highcharts.dateFormat('%Y-%m-%d %H:%M', d.setDate(d.getDate() - 365)) + '"></input>' +
			    		'<span class="add-on">' +
			      			'<i data-time-icon="icon-time" data-date-icon="icon-calendar"></i>' +
			      		'</span>' +
		      		'</div>' +
	  			'</div>' +
	  			'<label class="control-label" for="todatetime">' + this.strings.to + '</label>' +
	  			'<div class="controls">' +
		  			'<div class="input-append date datetimepicker">' +
			   			'<input id="todatetime" data-format="yyyy-MM-dd hh:mm" type="text" value="' + Highcharts.dateFormat('%Y-%m-%d %H:%M', d.setDate(d.getDate() + 1)) + '"></input>' +
			    		'<span class="add-on">' +
			      			'<i data-time-icon="icon-time" data-date-icon="icon-calendar"></i>' +
			      		'</span>' +
		      		'</div>' +
	  			'</div>' +
	  			'<button type="submit" class="btn">' + this.strings.update + '</button>' + 
			'</div>' +
			'</div>' +
			'</form>';
		this.$controlsElement.html(str);
		$('.datetimepicker').datetimepicker({
	      language: 'pt-BR',
	      pickSeconds: false
	    });
		
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
			case '#statistics-minmax': 
			case '#statistics-avg-hour': 
			case '#statistics-avg-weekday': 
			case '#statistics-avg-month': 
				return hash.replace('#','');
				break;
			case '#day': 
				return this.INTERVALS['day'];
				break;
			case '#week': 
				return this.INTERVALS['week'];
				break;
			case '#month': 
				return this.INTERVALS['month'];
				break;
			case '#year': 
				return this.INTERVALS['year'];
				break;	
			default:
				return 'latest'; // Start view
				break;
		}
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
	}
};