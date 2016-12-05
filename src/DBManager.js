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

exports.saveSummaryRecord = function(summaryRecord){
	return dbSummary.insert(summaryRecord);
}

exports.getScoreSummaryByDate = function(dateParam){
	return dbSummary.find({ date:parseInt(dateParam)});
}

exports.getAggregateScoreSummaryByDate = function(dateParam) {
	var query = [{$project:{_id:0,date:1,appid:1,score:1}},{ $match: { date: dateParam} },{ $group : { _id : "$score",count: { $sum: 1 } } },{$sort : {score : 1}}];
	log.info(JSON.stringify(query));
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

