define(['jChartFX'], function(jChartFX) {
	var ColumnChart = {
		create: function(parent, opts) {
			var options = {
	            title: opts.title,
	            hAxis: { title: opts.xLabel },
	            vAxis: { title: opts.yLabel, minValue: 0 },
	            colors: ['#5aa9c2'],
	            legend: 'none' ,
	            width: opts.width ? opts.width : 500,
	            enableInteractivity: true
	        };
			
			var data = [[opts.xLabel, opts.yLabel]];
			
			$.each(opts.data, function(key, val) {
				data.push([key, val]);
			});
			
			var data = google.visualization.arrayToDataTable(data);

	        var chart = new google.visualization.ColumnChart(parent[0]);
	        chart.draw(data, options);
		}
	};
	
	return ColumnChart;
});