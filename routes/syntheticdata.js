var express = require('express');
var router = express.Router();


var runReport = function(req,res,job, page, startdate, enddate, metric){
	req.syntheticManager.getSyntheticTrendReport(job,page,startdate,enddate,metric).then(function (data) {
		res.json(data);
	},console.error);
}


router.post('/', function(req, res) {
	var parms = req.body;
	var job = parms.job;
	var startdate = parms.startdate;
	var enddate   = parms.enddate;

	switch(parms.command){
		case "jobs" :
			req.syntheticManager.getUniqueJobs().then(function (data) {
				res.json(data);
			},console.error);
			break;
		case "jobpagesbymonth":
			req.syntheticManager.getJobPagesByMonth(job,parseInt(startdate),parseInt(enddate)).then(function (data) {
				res.json(data);
			},console.error);
			break;
		case "jobpagesbyday":
			req.syntheticManager.getJobPagesByDay(job,parseInt(startdate),parseInt(enddate)).then(function (data) {
				res.json(data);
			},console.error);
			break;
		default:
			break
	}
});

module.exports = router;
