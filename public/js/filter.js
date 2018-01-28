$(document).ready(function() {
			/* select cooking */
			$('#selectCooking').multiselect({
				buttonClass: 'btn blue-btn',
				buttonText: function(options, select) {
					if (options.length === 0) {
						return 'Select your favourite cooking method ...';
					} else if (options.length > 3) {
						return 'More than '+options.length+' selected';
					} else {
						 var labels = [];
						 options.each(function() {
							 if ($(this).attr('label') !== undefined) {
								 labels.push($(this).attr('label'));
							 }
							 else {
								 labels.push($(this).html());
							 }
						 });
						 return labels.join(', ') + '';
					}
				}
			});
			/* select cuisine */
			$('#selectCuisine').multiselect({
				buttonClass: 'btn cyan-btn',
				buttonText: function(options, select) {
					if (options.length === 0) {
						return 'Select cuisine type ...';
					} else if (options.length > 3) {
						return 'More than '+options.length+' selected';
					} else {
						 var labels = [];
						 options.each(function() {
							 if ($(this).attr('label') !== undefined) {
								 labels.push($(this).attr('label'));
							 }
							 else {
								 labels.push($(this).html());
							 }
						 });
						 return labels.join(', ') + '';
					}
				}
			});
			/* select meat */
			$('#selectMeat').multiselect({
				buttonClass: 'btn peach-btn',
				buttonText: function(options, select) {
					if (options.length === 0) {
						return 'Select your favourite meat ...';
					} else if (options.length > 3) {
						return 'More than '+options.length+' selected';
					} else {
						 var labels = [];
						 options.each(function() {
							 if ($(this).attr('label') !== undefined) {
								 labels.push($(this).attr('label'));
							 }
							 else {
								 labels.push($(this).html());
							 }
						 });
						 return labels.join(', ') + '';
					}
				}
			});
			/* select vegetable */
			$('#selectVeg').multiselect({
				buttonClass: 'btn pink-btn',
				buttonWidth: '320px',
				buttonText: function(options, select) {
					if (options.length === 0) {
						return 'Select your favourite vegetable ...';
					} else if (options.length > 3) {
						return 'More than '+options.length+' selected';
					} else {
						 var labels = [];
						 options.each(function() {
							 if ($(this).attr('label') !== undefined) {
								 labels.push($(this).attr('label'));
							 }
							 else {
								 labels.push($(this).html());
							 }
						 });
						 return labels.join(', ') + '';
					}
				}
			});
			
		});
		
		$( function() {
		$( "#slider-range" ).slider({
		  range: true,
		  min: 0,
		  max: 100,
		  values: [ 20, 75 ],
		  slide: function( event, ui ) {
			$( "#amount" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
		  }
		});
		$( "#amount" ).val( "$" + $( "#slider-range" ).slider( "values", 0 ) +
		  " - $" + $( "#slider-range" ).slider( "values", 1 ) );
	  } );