var express = require('express');
var router = express.Router();

router.get('/:date', function(req, res) {
	req.scoreManager.getAppSummaryByDate(parseInt(req.params.date)).then(function (data) {
		res.json(data);
	},console.error);
});

router.post('/', function(req, res) {
	var parms = req.body;
	var command = parms.command;
	var startdate = parseInt(parms.startdate);
	var enddate   = parseInt(parms.enddate);
	var parm1     = parseInt(parms.parm1);

	switch(command){
		case "allgradetrend" :
			req.scoreManager.getAllGradeTrends(startdate,enddate).then(function (data) {
				res.json(data);
			},console.error);
			break;
		case "appspromoted" :
			req.scoreManager.getAppsThatHaveBeenPromoted(parm1,startdate,enddate).then(function (data) {
				res.json(data);
			},console.error);
			break;	
		case "worstperforming" :
			req.scoreManager.getTopWorseApps(parm1,startdate,enddate).then(function (data) {
				res.json(data);
			},console.error);
			break;
		case "bestperforming" :
			req.scoreManager.getTopBestApps(parm1,startdate,enddate).then(function (data) {
				res.json(data);
			},console.error);
			break;
		case "appcounttrend":
			req.scoreManager.getAppCountTrend(startdate,enddate).then(function (data) {
				res.json(data);
			},console.error);
			break;
		case "toplogins":
			req.scoreManager.getTopUsersByLogin(parm1,startdate,enddate).then(function (data) {
				res.json(data);
			},console.error);
			break;
		default :
			break;
	}


});



module.exports = router;
