TempChart.Administrator = TempChart.Administrator || 

	/* Constructor
	 * @param 	options 	object 		configuration object to override default configuration
	 */
	function(options) {
		// Store configuration options
		$.extend(this,options);

		// Bind GUI and APP events
		this.bindEvents();

		$(document).trigger('TempChart_load_sensors');
		console.log('EVENT FIRE LOAD_SENSORS ::');
	};
	
	

TempChart.Administrator.prototype = {

	/* bindEvents
	 *
	 */
	bindEvents: function() {
		var me = this;
		$(document).bind('TempChart_sensors_loaded', function(e, sensors) { 
			console.log('EVENT READ SENSORS_LOADED ::');
			console.log(sensors); 
		});

	}

}