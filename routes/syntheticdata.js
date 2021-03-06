var express = require('express');
var router = express.Router();


router.post('/', function(req, res) {
	var parms = req.body;
	var job = parms.job;
	var startdate = parseInt(parms.startdate);
	var enddate   = parseInt(parms.enddate);

	switch(parms.command){
		case "jobs" :
			req.syntheticManager.getUniqueJobs().then(function (data) {
				res.json(data);
			},console.error);
			break;
		case "jobpagesbymonth":
			req.syntheticManager.getJobPagesByMonth(job,startdate,enddate).then(function (data) {
				res.json(data);
			},console.error);
			break;
		case "jobpagesbyday":
			req.syntheticManager.getJobPagesByDay(job,startdate,enddate).then(function (data) {
				res.json(data);
			},console.error);
			break;
		case "trendevents" :
			req.syntheticManager.getTrendRecords().then(function (data) {
				res.json(data);
			},console.error);
			break;
		case "record" :
			req.syntheticManager.getSyntheticRecordById(parms.id).then(function (data) {
				res.json(data);
			},console.error);
			break;
		case "metrictrendbyjob" :
			req.syntheticManager.getSyntheticQuickTrendReport(job,startdate,enddate).then(function (data) {
				res.json(data);
			},console.error);
			break;
		case "metrictrendbypage" :
			parms.metrics = parms["metrics[]"]; //This is needed to cleanly convert the array being passed in.
			req.syntheticManager.getSyntheticPageTrendReport(startdate,enddate,parms).then(function (data) {
				res.json(data);
			},console.error);
			break;
		default:
			break
	}
});

module.exports = router;
