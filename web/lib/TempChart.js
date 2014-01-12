/* TempChart
 *
 *	Requiers: [
 * 		Highcharts
 *  	TempChart.DataHandler	
 *	]
 */

var TempChart = TempChart || 

	/* Constructor
	 * @param 	options 	object 		configuration object to override default configuration
	 */
	function(options) {
		// Store configuration options
		initialOptions = options;
		$.extend(this,options);

		if(!this.DEBUG || (this.isIE() && this.isIE() <= 8)) {
			this.disableLogging();
		}
		console.log('INIT TempChart ::', options);

		this.dataHandler = new TempChart.DataHandler({
			DATA_URL: this.DATA_URL,
			USE_CACHE: this.USE_CACHE
		});

		// Bind GUI and APP events
		this.bindEvents();
	};
	
	

TempChart.prototype = {

	// Constants
	// ---------------
	DATA_URL: 'data/', // URL to load data from
	USE_CACHE: true, // Use serverside json-cache
	DEBUG: false,

	// Varibles
	// ---------------

	// Methods
	// ---------------


	/* bindEvents
	 *
	 */
	bindEvents: function() {
		var me = this;
		$(document).bind('TempChart_error', function(e, msg, xhr) { me.showErrorMessage(msg) });
		$(document).bind('TempChart_in_progress', function(e, show) { me.showLoadingMessage(show); });
		
	},

	initCharter: function() {
		this.charter = new TempChart.Charter(this.initOptions);
	},

	initAdministrator: function() {
		this.administrator = new TempChart.Administrator();
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
		debugger;
		console.log('ERROR', message);
		$('#error .modal-body').html(message);
		if($().modal) {
			$('#error').modal('show');
		}
	},

	disableLogging: function() {

		if(!window.console) window.console = {};

	    var methods = [
	        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
	        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
	        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
	        'timeStamp', 'trace', 'warn'
	    ];
	    
	    for(var i=0;i<methods.length;i++){
	    	console[methods[i]] = function(){};
	    }
	},

	isIE: function() {
		var myNav = navigator.userAgent.toLowerCase();
		return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
	}
};