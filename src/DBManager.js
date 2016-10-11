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
	var query = [{$match: {score:scoreParm,date : {$lt: endDate , $gt: startDate}}},{ $group : { _id : "$time" ,count: { $sum: 1 } } },{$sort : {date : -1}}];
	return dbSummary.aggregate(query);
}

exports.getAppListByScoreAndDate = function(scoreParm,dateParm){
	var dateAsNumber = parseInt(dateParm);
	return dbSummary.find({score : scoreParm, date : dateAsNumber},{ fields: {"appid":1,"appname":1,"incidents":1,"date":1}},{sort:{appname:1}});	
}

exports.fetchAppTimelineByDate = function(appid,startDate,endDate){
	return dbSummary.find({appid : appid, date : {$lte: endDate , $gte: startDate}},{ fields: {"date":1,"score":1,"incidents":1,"time":1}},{sort:{date:1}});	
}

exports.fetchHRSummary = function(appid,date){
	return dbSummary.find({appid : appid, date : parseInt(date)},{ fields: {"summary":1}});
}

/**

exports.getListOfAppsByScore = function(date,score){
	
	//query by date and score and only return : AppID, Name,Number of incidents
	
	var query = [{"date":date,"score":score}];
	return dbSummary.find(query);
}

exports.getAppHistory = function(date,appid){
	
	//query by appid for the last x days and return : Date, Score, Number of incidents
	
	var query = [{"date":date,"score":score}];
	return dbSummary.find(query);
}

exports.getSummaryOfHealthRuleCounts = function(date,appid){
	
	//query by appid for the last x days and return group by Health Rules and count
	
	var query = [{"date":date,"score":score}];
	return dbSummary.find(query);
}

exports.getHealthRuleViolations = function(date,appid,hrName){
	
	//query by appid for the last x days and return group by Health Rules and count
	
	var query = [{"date":startDate,"score":score}];
	return dbSummary.find(query);
}


 * Top 10 Apps by incidents - App 1 - Grade 3 through App 10
 * Top 10 Apps by lowest incidents - App 3 - 
 * Apps that should be promoted : App 1 currently @ Grade 3, 0 incidents in the past week
 */


