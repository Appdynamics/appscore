var log4js = require('log4js');
var log = log4js.getLogger("DBManager");
var monk = require('monk');
var Q = require('q');
require('q-foreach')(Q);
var configManager = require("./ConfigManager.js");
var dateHelper = require("./DateHelper.js");

var dbConnectString = configManager.getConfig().dbhost+":"+configManager.getConfig().dbport+'/'+configManager.getConfig().dbname;
var db = monk(dbConnectString);
var dbSummary = db.get("summary");
dbSummary.index("date appid score appname", { unique: true });
dbSummary.index("date incidents", { unique: false });

var dbAuditHistory = db.get("audithistory");
dbAuditHistory.index("auditDateTime userName action appname", { unique: true });

var dbSyntheticPage = db.get("syntheticpage");
dbSyntheticPage.index("appid jobname syntheticid resourceTimingDescriptor time", { unique: true });

exports.close = function(){
	db.close();
}

exports.saveAuditHistoryRecord = function(auditHistoryRecord){
	return dbAuditHistory.insert(auditHistoryRecord);
}

exports.saveSummaryRecord = function(summaryRecord){
	return dbSummary.insert(summaryRecord);
}

exports.getScoreSummaryByDate = function(dateParam){
	return dbSummary.find({ date:parseInt(dateParam)});
}

exports.getAggregateScoreSummaryByDate = function(dateParam) {
	var query = [{$project:{_id:0,date:1,appid:1,score:1}},{ $match: { date: dateParam} },{ $group : { _id : "$score",count: { $sum: 1 } } },{$sort : {score : 1}}];
	return dbSummary.aggregate(query);
}


exports.getAggregateScoreByDate = function(scoreParm,startDate,endDate){
	var query = [{$match: {score:scoreParm,date : {$lte: endDate , $gte: startDate}}},{ $group : { _id : "$time" ,count: { $sum: 1 } } },{$sort : {date : -1}}];
	return dbSummary.aggregate(query);
}

exports.getAppListByScoreAndDate = function(scoreParm,dateParm){
	var dateAsNumber = parseInt(dateParm);
	return dbSummary.find({score : scoreParm, date : dateAsNumber},{ fields: {"appid":1,"appname":1,"incidents":1,"date":1}},{sort:{appname:1}});	
}

exports.getAppListIncidentsByDate = function(dateParm){
	var dateAsNumber = parseInt(dateParm);
	return dbSummary.find({date : dateAsNumber, incidents :{$gt:0}},{ fields: {"appid":1,"appname":1,"incidents":1,"date":1,"score":1}},{sort:{"incidents":1}});	
}

exports.fetchAppTimelineByDate = function(appid,startDate,endDate){
	return dbSummary.find({appid : appid, date : {$lte: endDate , $gte: startDate}},{ fields: {"date":1,"score":1,"incidents":1,"time":1}},{sort:{date:1}});	
}

exports.fetchHRSummary = function(appid,date){
	return dbSummary.find({appid : appid, date : parseInt(date)},{ fields: {"summary":1}});
}

exports.getIncidentTrend = function(min,max){
	var query = [{$project:{_id:0,date:1,appid:1,incidents:1}},{$match:{date:{$lte:max,$gte:min}}},{$group:{_id:"$date",count:{$sum:"$incidents"}}},{$sort:{_id:1}}];
	return dbSummary.aggregate(query);
}

exports.getAppIncidentTrend = function(appid,min,max){
	var query = [{$project:{_id:0,date:1,appid:1,incidents:1}},{$match:{appid:appid,date:{$lte:max,$gte:min}}},{$group:{_id:"$date",count:{$sum:"$incidents"}}},{$sort:{_id:1}}];
	return dbSummary.aggregate(query);
}

exports.getAppsForDowngrade = function(score,minDate,maxDate,maxIncidentCount){
	var query = [{$project:{_id:0,date:1,appid:1,appname:1,score:1,incidents:1}},{$match:{score:score,date:{$lte:maxDate,$gte:minDate}}},{$group:{_id:"$appid", "appname" : {$first:"$appname"}, "score" : {$first:"$score"},"count":{$sum:"$incidents"}}},{$match:{count:{$gt:maxIncidentCount}}},{$sort:{count:1}}];
	return dbSummary.aggregate(query);
}

exports.getAppsForUpgrade = function(score,minDate,maxDate,minIncidentCount){
	var query = [{$project:{_id:0,date:1,appid:1,appname:1,score:1,incidents:1}},{$match:{score:score,date:{$lte:maxDate,$gte:minDate}}},{$group:{_id:"$appid", "appname" : {$first:"$appname"}, "score" : {$first:"$score"},"count":{$sum:"$incidents"}}},{$match:{count:{$lt:minIncidentCount}}},{$sort:{count:1}}];
	return dbSummary.aggregate(query);
}

exports.getLoginTrend = function(min,max){
	var query = [{$project:{_id:0,date:1,action:2}},{$match:{action:"LOGIN",date:{$lte:max,$gte:min}}},{$group:{_id:"$date",count:{$sum:1}}},{$sort:{_id:1}}];
	return dbAuditHistory.aggregate(query);
}

exports.getAppListChangesByDate = function(dateParm){
	var dateAsNumber = parseInt(dateParm);
	var query = [{$project:{_id:0,appname:1,appid:2,date:3}},{$match:{appname:{$ne:null},date:dateAsNumber}},{$group:{_id:{appname:"$appname",appid:"$appid"},count:{$sum:1}}},{$sort:{_id:1}}];
	return dbAuditHistory.aggregate(query);
}

exports.getAppChangesByDate = function(appid,startDate,endDate){
	var query = [{$project:{_id:0,appid:1,date:2}},{$match:{appid:appid, date:{$lte:endDate,$gte:startDate}}},{$group:{_id:"$date",count:{$sum:1}}},{$sort:{_id:1}}];
	return dbAuditHistory.aggregate(query);	
}

 exports.getAppChangesDetailByDate = function(appid,date){
 	console.log("appid: " + appid + ", " + date);
	return dbAuditHistory.find({appid:appid,date:date},{_id:0},{sort:{auditDateTime:1}});	
}

/*
Synthetics
 */
exports.saveSyntheticDataRecord = function(pageRecord){
	return dbSyntheticPage.insert(pageRecord);
}

exports.getSyntheticPagesByJobsReport = function(startdate,enddate){
	var query = [
		// Stage 1
		{
			$match: {
				time: { $gt: startdate, $lt: enddate }
			}
		},
		// Stage 2
		{
			$project: {
			   appid:1, jobname:1, pagename:1, resources:1, metrics:1,browsermetrics:1, resources_count:{$size:"$resources"}, resources_totalAverageTime:{$sum:"$resources.averageTime"}, resources_totalTime:{$sum:"$resources.totalTime"},bt_time:{$sum:"$childBTs.estimatedTime"}
			}
		},

		// Stage 3
		{
			$group: {
			_id:{jobname:"$jobname",pagename:"$pagename",availability:"$metrics.Availability (ppm)",resources_count:"$resources_count",bt_count:"$bt_count",resources_totalAverageTime:"$resources_totalAverageTime",resources_totalTime:"$resources_totalTime",bt_count:"$bt_count",bt_time:"$bt_time"},drt:{$avg:"$browsermetrics.metrics.DOM Ready Time (ms)"},eurt:{$avg:"$browsermetrics.metrics.End User Response Time (ms)"}
			}
		},

		// Stage 4
		{
			$project: {
			   _id:0,jobname:"$_id.jobname",pagename:"$_id.pagename",availability:"$_id.availability",resources_count:"$_id.resources_count",bt_count:"$_id.bt_count",bt_time:"$_id.bt_time",drt:1,eurt:1, resources_totalTime:"$_id.resources_totalTime",resources_totalAverageTime:"$_id.resources_totalAverageTime"
			}
		},

		// Stage 5
		{
			$group: {
			_id:{jobname:"$jobname",pagename:"$pagename"},"count":{"$sum":1},'Availability':{"$sum":"$availability"},'Dom Ready Time - Average':{$avg:"$drt"},'End User Response Time - Average':{$avg:"$eurt"},
			'Max External Resources':{$max:"$resources_count"},'External Resources Max Total Time':{$max:"$resources_totalTime"},'External Resources Max Average Time':{$max:"$resources_totalAverageTime"},'Max BTs':{$max:"$bt_count"},'Max BT Time':{$max:"$bt_time"} 
			}
		},

		// Stage 6
		{
			$project: {
			    _id:0,"Job Name":"$_id.jobname","Page":"$_id.pagename","Job Executions":"$count", 
			    "Availability": {$divide: [ "$Availability", {$multiply:["$count",10000]}]}, "Dom Ready Time - Average":"$Dom Ready Time - Average","End User Response Time - Average":"$End User Response Time - Average",
			    "Max External Resources":"$Max External Resources","External Resources Max Total Time":"$External Resources Max Total Time","External Resources Max Average Time":"$External Resources Max Average Time","Max BT Count":"$Max BTs","Max BT Time":"$Max BT Time"
			}
		}
	]
	return dbSyntheticPage.aggregate(query);
}

exports.getSyntheticAvailabilityTrendReport = function(job,page,startdate,enddate){
	var query = [
		// Stage 1
		{
			$project: {
			    appid:1, jobname:1, pagename:1, time:1, 'metrics.Availability (ppm)':1
			}
		},

		// Stage 2
		{
			$match: {
				jobname : job, pagename:page,time : { $gte: startdate,  $lte: enddate }
			}
		},

		// Stage 3
		{
			$project: {
			    "_id":"$_id","time":"$time","availability":{$divide: [ "$metrics.Availability (ppm)",10000]}
			}
		},

	]
	return dbSyntheticPage.aggregate(query);
}

exports.getSyntheticPagesMetricsReport = function(job,page){
	var query = [{$project:{jobname:1,pagename:1}},{$match:{jobname:job,pagename:page}},{$group:{_id:"$jobname",pages: { $addToSet: "$pagename"}}}];
	return dbSyntheticPage.aggregate(query);
}