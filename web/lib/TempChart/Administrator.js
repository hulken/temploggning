TempChart.Administrator = TempChart.Administrator || 

	/* Constructor
	 * @param 	options 	object 		configuration object to override default configuration
	 */
	function(options) {
		// Store configuration options
		$.extend(this,options);

		this.$sensorsList = $('#'+this.SENSORS_LIST_ELEMENT_ID);

		// Bind GUI and APP events
		this.bindEvents();

		this.strings = this.LANGUAGE.STRINGS[this.LANGUAGE.DEFAULT];

		$(document).trigger('TempChart_load_sensors');
		console.log('EVENT FIRE LOAD_SENSORS ::');
	};
	
	

TempChart.Administrator.prototype = {
	
	// Constants
	// ---------------
	DATA_URL: 'data/', // URL to load data from
	USE_CACHE: true, // Use serverside json-cache
	DEBUG: false,
	SENSORS_LIST_ELEMENT_ID: 'sensors-list',
	EDITABLE_COLUMNS: [
		'id',
		'name',
		'color'
	],
	SENSOR_EDIT_CLASS: 'sensor-edit',
	LANGUAGE: {
		DEFAULT: 'sv',
		STRINGS:  {
			sv: {
				edit_tooltip: 'Klicka för att ändra...',
				edit_cancel: 'Avbryt',
				edit_submit: 'Spara'
			}
		}
	},
	
	// Varibles
	// ---------------
	$sensorsList: null,
	strings: {},
	

	// Methods
	// ---------------


	/* bindEvents
	 *
	 */
	bindEvents: function() {
		var me = this;
		$(document).bind('TempChart_sensors_loaded', function(e, sensors) { 
			console.log('EVENT READ SENSORS_LOADED ::', sensors);
			me.loadSensorsView(sensors);
		});

	},

	/**
	*
	*/
	loadSensorsView: function(sensors) {
		var sensorsListHtml = '<table class="table table-striped">';

		for (var i = 0; i < sensors.length; i++) {
			sensorsListHtml += '<tr>';

			// Header, keys
			if(i === 0) {
				for(key in sensors[i]) {
					sensorsListHtml += '<th>' + key + '</th>'; 
				}
				sensorsListHtml += '<th></th>' + 
									'</tr>' +
									'<tr>';
			}

			// Values
			for(key in sensors[i]) {
				sensorsListHtml += '<td class="' + this._isEditable(key) + '" data-key="'+ key +'">' +  sensors[i][key] + '</td>'; 
			}
			sensorsListHtml += '</tr>';

		};
		sensorsListHtml += '</table>';

		// Render
		this.$sensorsList.html(sensorsListHtml);

		this._initSensorsEdit();
	},

	_saveSensor: function(value, settings) {
		var obj = {};
		$(this).parents('tr').children().each(function() {
			obj[$(this).attr('data-key')] = $(this).find('input').length > 0 ? $(this).find('input').val() : $(this).text();
		});
		console.log('EVENT FIRE UPDATE SENSOR', obj);
		$(document).trigger('TempChart_update_sensor', [obj]);
		return value;
	},

	_initSensorsEdit: function() {
		$('.' + this.SENSOR_EDIT_CLASS).editable(this._saveSensor, {
	        tooltip   : this.strings.edit_tooltip,
	        cancel    : this.strings.edit_cancel,
         	submit    : this.strings.edit_submit,
	    });
	},

	_isEditable: function(key) {
		if(this.EDITABLE_COLUMNS.indexOf(key) !== -1) {
			return this.SENSOR_EDIT_CLASS;
		} else {
			return '';
		}
	}

}