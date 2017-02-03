var express = require('express');
var router = express.Router();

router.get('/:job/:page/:metric/:startdate/:enddate', function(req, res) {
	var job = req.params.job;
	var page = req.params.page;
	var metric = req.params.metric;
	var startdate 	= parseInt(req.params.startdate);
	var enddate   	= parseInt(req.params.enddate);
	switch(metric){
		case "Availability": 
			req.syntheticManager.getPageAvailabilityMetricTrend(job,page,startdate,enddate).then(function (data) {
				res.json(data);
			},console.error);
			break;
		default : 
			req.syntheticManager.getPageMetricTrend(job,page,metric,startdate,enddate).then(function (data) {
				res.json(data);
			},console.error);
		
	}
    
});

module.exports = router;
