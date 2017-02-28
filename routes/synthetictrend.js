var express = require('express');
var router = express.Router();


var runReport = function(req,res,job, page, startdate, enddate, metric){
	req.syntheticManager.getSyntheticTrendReport(job,page,startdate,enddate,metric).then(function (data) {
		res.json(data);
	},console.error);
}

router.get('/:job/:page/:metric/:submetric/:startdate/:enddate', function(req, res) {
	var job = req.params.job;
	var page = req.params.page;
	var metric = req.params.metric;
	var submetric = req.params.submetric;
	var startdate 	= parseInt(req.params.startdate);
	var enddate   	= parseInt(req.params.enddate);
	switch(metric){
		case "Availability": 
			runReport(req,res,job,page,startdate,enddate,{$divide: [ "$metrics.Availability (ppm)",10000]});
			break;
		case "First Byte Time":
			runReport(req,res,job,page,startdate,enddate,"$firstbyte");
			break;	
		case "On Load Time":
			runReport(req,res,job,page,startdate,enddate,"$onload");
			break;	
		case "Start Render Time":
			runReport(req,res,job,page,startdate,enddate,"$startrender");
			break;	
		case "Dom Ready Time - Average":
			runReport(req,res,job,page,startdate,enddate,"$browsermetrics.metrics.DOM Ready Time (ms)");
			break;	
		case "End User Response Time - Average":
			runReport(req,res,job,page,startdate,enddate,"$browsermetrics.metrics.End User Response Time (ms)");
			break;
		case "External Resources Count": 
			runReport(req,res,job,page,startdate,enddate,{$size:["$resources"]});
			break;
		case "External Resources Average Time": 
			runReport(req,res,job,page,startdate,enddate,{$sum:"$resources.averageTime"});
			break;
		case "External Resources Total Time": 
			runReport(req,res,job,page,startdate,enddate,{$sum:"$resources.totalTime"});
			break;
		case "Business Transaction Time": 
			runReport(req,res,job,page,startdate,enddate,{$sum:"$childBTs.estimatedTime"});
			break;		
		case "Business Transaction Count": 
			runReport(req,res,job,page,startdate,enddate,{$size:"$childBTs"});
			break;
		case "Business Transaction Breakdown": 
			if(metric == submetric){
				req.syntheticManager.getSyntheticBusinessTransactionBreakdownReport(job,page,startdate,enddate).then(function (data) {
					res.json(data);
				},console.error);
			}else{
				req.syntheticManager.getSyntheticBusinessTransactionTrendReport(job,page,parseInt(submetric),startdate,enddate).then(function (data) {
					res.json(data);
				},console.error);
			}
			break;	
		case "External Resources Breakdown": 
			if(metric == submetric){
				req.syntheticManager.getSyntheticExternalResourcesBreakdownReport(job,page,startdate,enddate).then(function (data) {
					res.json(data);
				},console.error);
			}else{
				req.syntheticManager.getResourceMetricTrend(job,page,submetric,startdate,enddate).then(function (data) {
					res.json(data);
				},console.error);
			}
			break;		
		default : 
			break;
		
	}
    
});

module.exports = router;
