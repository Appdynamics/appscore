var log4js = require('log4js');
var log = log4js.getLogger("DBManager");
var monk = require('monk');
var Q = require('q');
require('q-foreach')(Q);
var configManager = require("./ConfigManager.js");
var dateHelper = require("./DateHelper.js");
var round = require('mongo-round');

var dbConnectString = configManager.getConfig().dbhost+":"+configManager.getConfig().dbport+'/'+configManager.getConfig().dbname;
var db = monk(dbConnectString);
var dbSummary = db.get("summary");
dbSummary.index("date appid score appname", { unique: true });
dbSummary.index("date incidents", { unique: false });

var dbAuditHistory = db.get("audithistory");
dbAuditHistory.index("auditDateTime userName action appname", { unique: true });

var dbSyntheticPage = db.get("syntheticpage");
dbSyntheticPage.index("appid jobname syntheticid resourceTimingDescriptor time", { unique: true });
dbSyntheticPage.index("jobname pagename time", { unique: false });

var dbTrendRec = db.get("trendrec");
dbTrendRec.index("time type key",{unique:false});

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

exports.getAppCountTrend = function(startdate,enddate) {
	var query = [
		{
			$match: {
				"time": {"$gt": startdate,"$lt": enddate}
			}
		},
		{
			$group: {
				_id:{date:"$date"},count:{$sum:1}
			}
		},
		{
			$project: {
			    _id:0,date:"$_id.date",count:1
			}
		}
	]
	return dbSummary.aggregate(query);
}



exports.getAllGradeTrends = function(startdate,enddate){
	var query = [
		{
			$match: {
				time : {$lte: enddate , $gte: startdate}
			}
		},
		{
			$group: {
				_id:{date:"$date",score:"$score"},count:{$sum:1}
			}
		},
		{
			$project: {
			    _id:0, date : "$_id.date",score :"$_id.score",count : "$count"
			}
		}
	]
	return dbSummary.aggregate(query);
}

exports.getAppsThatHaveBeenPromoted = function(limit,startDate,endDate){
	var query =	[
		// Stage 1
		{
			$match: {"time":{"$lte":endDate,"$gte": startDate}}
		},

		// Stage 2
		{
			$group: {
			  "_id":{"appid":"$appid","appname":"$appname","score":"$score"},score_date : {$min:"$date"}
			}
		},

		// Stage 3
		{
			$group: {
				_id:{appid:"$_id.appid",appname:"$_id.appname"},count: { $sum: 1 },scores:{$push :{score:"$_id.score",score_date:"$score_date"}}
			}
		},

		// Stage 4
		{
			$match: {
				count:{$gt:1}
			}
		},

		// Stage 5
		{
			$limit: limit
		},

		// Stage 6
		{
			$project: {
			    _id:0,appid:"$_id.appid",appname:"$_id.appname",count:"$count",scores:"$scores"
			}
		}
	]
	return dbSummary.aggregate(query);
	
}

exports.getTopWorseApps = function(limit,startDate,endDate){
	var query = [
		{
			$match: {"time":{"$lte":endDate,"$gte": startDate}}
		},

		// Stage 2
		{
			$group: {
			  "_id":{"appid":"$appid","appname":"$appname"},incidents:{$sum:"$incidents"},score:{$last:"$score"}
			}
		},
		// Stage 3
		{
			$project: {
			    _id:0,appid:"$_id.appid",appname:"$_id.appname",incidents:"$incidents",score:"$score"
			}
		},
		{
			$sort : {incidents:-1}
		},
		// Stage 4
		{
			$limit: limit
		}
	]

	return dbSummary.aggregate(query);
}

exports.getTopBestApps = function(limit,startDate,endDate){
	var query = [
		{
			$match: {"time":{"$lte":endDate,"$gte": startDate}}
		},

		// Stage 2
		{
			$group: {
			  "_id":{"appid":"$appid","appname":"$appname"},incidents:{$sum:"$incidents"},score:{$last:"$score"}
			}
		},
		// Stage 3
		{
			$project: {
			    _id:0,appid:"$_id.appid",appname:"$_id.appname",incidents:"$incidents",score:"$score"
			}
		},
		{
			$sort : {incidents:1}
		},
		// Stage 4
		{
			$limit: limit
		}
	]

	return dbSummary.aggregate(query);
}

exports.getTopUsersByLogin = function(limit,startDate,endDate){
	var query = [
		{
			$match: {"date":{"$lte":endDate,"$gte": startDate}}
		},
		{
			$group: {
				"_id":{appid:"$appid","username":"$userName"},count:{$sum:1}
			}
		},
		{
			$sort : {count:-1}
		},
		{
			$limit: limit
		},
		{
			$project: {
			    _id:0, "appid":"$_id.appid", "username":"$_id.username","count":"$count"
			}
		}
	]
	return dbAuditHistory.aggregate(query);
}

exports.getAggregateScoreByDate = function(scoreParm,startDate,endDate){
	var query = [{$match: {score:scoreParm,date : {$lte: endDate , $gte: startDate}}},{ $group : { _id : "$time" ,count: { $sum: 1 } } },{$sort : {date : -1}}];
	return dbSummary.aggregate(query);
}

exports.getAppListByScoreAndDate = function(scoreParm,dateParm){
	var dateAsNumber = parseInt(dateParm);
	return dbSummary.find({score : scoreParm, date : dateAsNumber},{ fields: {"appid":1,"appname":1,"incidents":1,"date":1}},{$sort:{"$incidents":-1}});	
}

exports.getAppListIncidentsByDate = function(dateParm){
	var dateAsNumber = parseInt(dateParm);
	return dbSummary.find({date : dateAsNumber, incidents :{$gt:0}},{ fields: {"appid":1,"appname":1,"incidents":1,"date":1,"score":1}},{$sort:{"incidents":1}});	
}

exports.fetchAppTimelineByDate = function(appid,startDate,endDate){
	return dbSummary.find({appid : appid, date : {$lte: endDate , $gte: startDate}},{ fields: {"date":1,"score":1,"incidents":1,"time":1}},{$sort:{date:1}});	
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
	return dbAuditHistory.find({appid:appid,date:date},{_id:0},{sort:{auditDateTime:1}});	
}

/*
Synthetics
 */

exports.getRecordById = function(id){
	return dbSyntheticPage.findOne(id);
}

exports.saveSyntheticDataRecord = function(pageRecord){
	return dbSyntheticPage.insert(pageRecord);
}

exports.getSyntheticPagesByJobsReport = function(startdate,enddate){
	var query = [
		//Stage 1 - filter by dates
		{
			$match: {time : { $gte: startdate,  $lte: enddate }}
		},
		//Stage 2 - initial sums and functions
		{
			$project: {
			   appid:1, jobname:1, pagename:1, resources:1, metrics:1,browsermetrics:1, firstbyte:1, onload:1, startrender:1,resources_count:{$size:"$resources"}, resources_totalAverageTime:{$sum:"$resources.averageTime"}, resources_totalTime:{$sum:"$resources.totalTime"},bt_count:{$size:"$childBTs"},bt_time:{$sum:"$childBTs.estimatedTime"}
			}
		},
		// Stage 3 - Group By to pull out
		{
			$group: {
			_id:{jobname:"$jobname",pagename:"$pagename",availability:"$metrics.Availability (ppm)",resources_count:"$resources_count",resources_totalAverageTime:"$resources_totalAverageTime",resources_totalTime:"$resources_totalTime",bt_count:"$bt_count",bt_time:"$bt_time",firstbyte:"$firstbyte",onload:"$onload",startrender:"$startrender"},drt:{$avg:"$browsermetrics.metrics.DOM Ready Time (ms)"},eurt:{$avg:"$browsermetrics.metrics.End User Response Time (ms)"}
			}
		},

		// Stage 4
		{
			$project: {
			   _id:0,jobname:"$_id.jobname",pagename:"$_id.pagename",availability:"$_id.availability",firstbyte:"$_id.firstbyte",onload:"$_id.onload",startrender:"$_id.startrender",resources_count:"$_id.resources_count",bt_count:"$_id.bt_count",bt_time:"$_id.bt_time",drt:1,eurt:1, resources_totalTime:"$_id.resources_totalTime",resources_totalAverageTime:"$_id.resources_totalAverageTime"
			}
		},

		// Stage 5
		{
			$group: {
			_id:{jobname:"$jobname",pagename:"$pagename"},"First Byte Time":{$avg:"$firstbyte"},"On Load":{$avg:"$onload"},"Start Render":{$avg:"$startrender"},"count":{$sum:1},"Availability":{$sum:"$availability"},"Dom Ready Time - Average":{$avg:"$drt"},"End User Response Time - Average":{$avg:"$eurt"},
			"Max External Resources":{$max:"$resources_count"},"External Resources Max Total Time":{$max:"$resources_totalTime"},"External Resources Max Average Time":{$max:"$resources_totalAverageTime"},"Max BTs":{$max:"$bt_count"},"Max BT Time":{$max:"$bt_time"} 
			}
		},

		// Stage 6
		{
			$project: {
			    _id:0,"Job Name":"$_id.jobname","Page":"$_id.pagename","Job Executions":"$count", 
			    "Availability": {$divide: [ "$Availability", {$multiply:["$count",10000]}]}, "First Byte Time":"$First Byte Time","On Load":"$On Load","Start Render":"$Start Render","Dom Ready Time - Average":"$Dom Ready Time - Average","End User Response Time - Average":"$End User Response Time - Average",
			    "Max External Resources Count":"$Max External Resources","External Resources Max Total Time":"$External Resources Max Total Time","External Resources Max Average Time":"$External Resources Max Average Time","Max BT Count":"$Max BTs","Max BT Time":"$Max BT Time"
			}
		},
		{
			$project: {
				_id:0,"Job Name":"$Job Name","Page":"$Page","Job Executions":round("$Job Executions",0), 
    "Availability": round("$Availability",0),"First Byte Time - Average":round("$First Byte Time",0),"On Load Time - Average":round("$On Load",0), "Start Render Time - Average":round("$Start Render",0),"Dom Ready Time - Average":round("$Dom Ready Time - Average",0),"End User Response Time - Average":round("$End User Response Time - Average",0),
    "Max External Resources":"$Max External Resources","External Resources Max Total Time":round("$External Resources Max Total Time",0),"External Resources Max Average Time":round("$External Resources Max Average Time",0),"Max BT Count":round("$Max BT Count",0),"Max BT Time":round("$Max BT Time",0)
			}
		}
	]
	return dbSyntheticPage.aggregate(query);
}

exports.getSyntheticJobMetricsByHour = function(startdate,enddate,hourofday){
	var query =
	[
		// Stage 1
		{
			$match: {time : { $gte: startdate,  $lte: enddate }, }
		},

		// Stage 2
		{
			$project: {
			   appid:1, jobname:1, pagename:1, resources:1, metrics:1,browsermetrics:1, firstbyte:1, onload:1, startrender:1, availability:"$metrics.Availability (ppm)",drt:"$browsermetrics.metrics.DOM Ready Time (ms)",eurt:"$browsermetrics.metrics.End User Response Time (ms)",resources_count:{$size:"$resources"}, resources_totalAverageTime:{$sum:"$resources.averageTime"}, resources_totalTime:{$sum:"$resources.totalTime"},bt_count:{$size:"$childBTs"},bt_time:{$sum:"$childBTs.estimatedTime"},"hour":{$hour:{$add:[ new Date(0), "$time" ]}}
			}
		},

		// Stage 3
		{
			$match: {hour : hourofday }
		},

		// Stage 4
		{
			$group: {
			_id:{jobname:"$jobname",pagename:"$pagename"},"firstbyte":{$avg:"$firstbyte"}, "firstbyte_std":{ $stdDevPop: "$firstbyte" },"onload":{$avg:"$onload"}, "onload_std":{$stdDevPop:"$onload"},"startrender":{$avg:"$startrender"},"startrender_std":{$stdDevPop:"$startrender"},"count":{$sum:1},"availability":{$sum:"$availability"}, "drt":{$avg:"$drt"},"drt_std":{$stdDevPop:"$drt"},"eurt":{$avg:"$eurt"},"eurt_std":{$stdDevPop:"$eurt"},"bt_time":{$avg:"$bt_time"},"bt_time_std":{$stdDevPop:"$bt_time"} 
			}
		},

		// Stage 5
		{
			$project: {
			    _id:0,"jobname":"$_id.jobname","pagename":"$_id.pagename","job_executions":"$count","availability": {$divide: [ "$availability", {$multiply:["$count",10000]}]}, firstbyte:1, firstbyte_std:1,onload:1, onload_std:1,startrender:1, startrender_std:1, drt:1, drt_std:1, eurt:1, eurt_std:1, bt_time:1, bt_time_std:1
			}
		}
	]
	return dbSyntheticPage.aggregate(query);
}

// exports.getSyntheticAvailbilityTrendReport = function(job,page,startdate,enddate){
// 	var query = [
// 		{
// 			$match: {
// 				jobname : job, pagename:page,time : { $gte: startdate,  $lte: enddate }
// 			}
// 		},
// 		{
// 			$group: {
// 				_id:{time:"$time"},metric:{$avg:"$metrics.Availability (ppm)"}
// 			}
// 		},
// 		{
// 			$project: { _id:0,time: "$_id.time", metric: { $divide: [ "$metric", 10000 ] } }
// 		}
// 	]
// 	return dbSyntheticPage.aggregate(query);

// }

exports.getSyntheticTrendReport = function(job,page,startdate,enddate,expression){
	var query = [
		{
			$match: {
				jobname : job, pagename:page,time : { $gte: startdate,  $lte: enddate }
			}
		},
		{
			$project: {
			    "_id":"$_id","time":"$time", 'metric':expression
			}
		}
	]
	return dbSyntheticPage.aggregate(query);
}


exports.getSyntheticExternalResourcesBreakdownReport = function(job,page,startdate,enddate){
	var query = [
		{
			$match: {
				jobname : job, pagename:page,time : { $gte: startdate,  $lte: enddate }
			}
		},
		{
			$unwind: {
			    path : "$resources"
			}
		},
		{
			$group: {
				_id:"$resources.name","avgtime":{$avg: "$resources.averageTime"},"hitcount":{$avg :"$resources.hit"},"avgtotaltime":{$avg:"$resources.totalTime"}
			}
		},
		{
			$project: {
				_id:"$_id", avgtime:round("$avgtime", 2), hitcount:round("$hitcount",2),avgtotaltime:round("$avgtotaltime",2)
			}
		}
	]
	return dbSyntheticPage.aggregate(query);
}

exports.getSyntheticBusinessTransactionBreakdownReport = function(job,page,startdate,enddate){
	var query = [
		{
			$match: {
				jobname : job, pagename:page,time : { $gte: startdate,  $lte: enddate }
			}
		},
		{
			$unwind: {
			    path : "$childBTs"
			}
		},
		{
			$group: {
				_id:{name:"$childBTs.name",appid:"$childBTs.applicationId",btid:"$childBTs.btId"},"estimatedtime":{$avg: "$childBTs.estimatedTime"},"time":{$avg :"$childBTs.time"}
			}
		},
		{
			$project: {
			   _id:"$_id.name", appid:"$_id.appid",btid:"$_id.btid",estimatedtime:round("$estimatedtime",0), totaltime:round("$time",0)
			}
		},
	]
	return dbSyntheticPage.aggregate(query);
}

exports.getSyntheticBusinessTransactionTrendReport = function(job,page,btid,startdate,enddate){
	var query = [
		{
			$match: {
				jobname : job, pagename:page,time : { $gte: startdate,  $lte: enddate }
			}
		},
		{
			$unwind: {
			    path : "$childBTs"
			}
		},
		{
			$match: {
				"childBTs.btId":btid
			}
		},
		{
			$project: {
				time:"$time",totaltime:round("$childBTs.time",0)
			}
		},
	]
	return dbSyntheticPage.aggregate(query);
}



exports.getSyntheticResourceTrendReport = function(job,page,startdate,enddate,pageName){
	var query = [
		{
			$match: {
				jobname : job, pagename:page,time : { $gte: startdate,  $lte: enddate }
			}
		},
		{
			$unwind: {"path":"$resources"}
		},
		{
			$match: {
				"resources.name":pageName
			}
		},
		{
			$project: {
			   "time":"$time","name":"$resources.name","hit":"$resources.hit","total":"$resources.totalTime","averageTime":"$resources.averageTime"
			}
		}
	];
	return dbSyntheticPage.aggregate(query);
}

exports.getUniqueJobNames = function(){
	return dbSyntheticPage.distinct("jobname"); 
}

exports.getJobPagesByMonth = function(job,startdate,enddate){
	var query = [
		// Stage 1
		{
			$match: {
				jobname : job, time : { $gte: startdate,  $lte: enddate }
			}
		},

		// Stage 2
		{
			$project: {
				pagename:1 , firstbyte:1, domready:1, onload:1, visualcomplete:1, startrender:1,"txnTimeAsDate": {$add:[ new Date(0), "$time" ]}
			}
		},

		// Stage 3
		{
			$project: {
			   pagename:1 , firstbyte:1, domready:1, onload:1, visualcomplete:1, startrender:1,month:{$month:"$txnTimeAsDate"}
			}
		},
		// Stage 4
		{
			$group: {
				_id:{pagename:"$pagename" , month:"$month"},firstbyte:{$avg:"$firstbyte"},domready:{$avg:"$domready"},onload:{$avg:"$onload"},visualcomplete:{$avg:"$visualcomplete"},startrender:{$avg:"$startrender"}
			}
		},

		// Stage 5
		{
			$project: {
			    _id:0,pagename:"$_id.pagename",month:"$_id.month",firstbyte:1,domready:1,onload:1,visualcomplete:1,startrender:1
			}
		}
	];

	return dbSyntheticPage.aggregate(query);
}

exports.getJobPagesByDay = function(job,startdate,enddate){
	var query = [
		// Stage 1
		{
			$match: {
				jobname : job, time : { $gte: startdate,  $lte: enddate }
			}
		},

		// Stage 2
		{
			$project: {
				pagename:1 , firstbyte:1, domready:1, onload:1, visualcomplete:1, startrender:1,"txnTimeAsDate": {$add:[ new Date(0), "$time" ]}
			}
		},

		// Stage 3
		{
			$project: {
			   pagename:1 , firstbyte:1, domready:1, onload:1, visualcomplete:1, startrender:1,day:{$dayOfMonth:"$txnTimeAsDate"}
			}
		},

		// Stage 4
		{
			$group: {
				_id:{pagename:"$pagename" , day:"$day"},firstbyte:{$avg:"$firstbyte"},domready:{$avg:"$domready"},onload:{$avg:"$onload"},visualcomplete:{$avg:"$visualcomplete"},startrender:{$avg:"$startrender"}
			}
		},

		// Stage 5
		{
			$project: {
			    _id:0,pagename:"$_id.pagename",day:"$_id.day",firstbyte:1,domready:1,onload:1,visualcomplete:1,startrender:1
			}
		}
	];
	return dbSyntheticPage.aggregate(query);
}

exports.saveTrendRec = function(rec){
	return dbTrendRec.insert(rec);
}

exports.getSyntheticTrendData = function(){
	return dbTrendRec.find({type:"synthetic"});
}

exports.getSyntheticQuickTrendReport = function(job,startdate,enddate){
	var query = [
		// Stage 1
		{
			$match: {
				time : { $gte: startdate,  $lte: enddate },type:"synthetic",key:job
			}
		},

		// Stage 2
		{
			$group: {
				_id : {job: "$key",page:"$pagename"},metrics:{ $addToSet : "$metricname"}, count: { $sum: 1 }
			}
		},

		// Stage 3
		{
			$sort: {
				count: -1 
			}
		},

		// Stage 4
		{
			$group: {
			   _id : {job:"$_id.job"},pagemetrics :{$push : {page:"$_id.page",metrics:"$metrics",count:"$count"}}
			}
		}
	];
	return dbTrendRec.aggregate(query);

}

exports.getSyntheticPageTrendReport = function(startdate,enddate,page,project){
	var query = [
		// Stage 1
		{
			$match: {
				time : { $gte: startdate,  $lte: enddate }, jobname : page.job, pagename :page.page
			}
		},

		// Stage 2
		{
			$project: project
		}
	];
	return dbSyntheticPage.aggregate(query);

}