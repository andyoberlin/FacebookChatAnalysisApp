define(['jChartFX'], function(jChartFX) {
	var ColumnChart = {
		create: function(parent, opts) {
			var chart = new jChartFX.Chart();
            chart.getData().setSeries(1);
            
            var series = chart.getSeries().getItem(0);
            series.setGallery(jChartFX.Gallery.Bar);
            
            chart.getAxisX().getTitle().setText(opts.xLabel);
            chart.getAxisY().getTitle().setText(opts.yLabel);
            chart.getAllSeries().setMultipleColors(true);
            chart.getLegendBox().setVisible(false);
            chart.getAnimations().getLoad().setEnabled(true);
            chart.getAnimations().getLoad().setDirection(jChartFX.AnimationDirection.Upward);
            
            var titles = chart.getTitles();
            var title = new cfx.TitleDockable(); 
            title.setText(opts.title);
            titles.add(title);
            
            var cData = [];
            $.each(opts.data, function(name, val) {
            	cData.push({
            		"Name" : name,
            		"Value": val
            	});
            });
            
            chart.setDataSource(cData);
            
            return chart;
		}
	};
	
	return ColumnChart;
});