TempChart.GoogleAnalytics = TempChart.GoogleAnalytics || 

	/* Constructor
	 * @param 	options 	object 		configuration object to override default configuration
	 */
	function(options) {

		// Store configuration options
		$.extend(this,options);

		if (this.GA_TRACKING_CODE){
	        var _gaq = _gaq || [];
	        this._gaq = _gaq;
	        _gaq.push(['_setAccount', this.GA_TRACKING_CODE]);
	        _gaq.push(['_trackPageview']);
	        (function() {
	        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	        })();
		}
	}



TempChart.GoogleAnalytics.prototype = {
	// Constants
	// ---------------
	GA_TRACKING_CODE: null,

	// Varibles
	// ---------------
	_gaq: null

	// Methods
	// ---------------
}