var log4js 		= require('log4js');
var log 		= log4js.getLogger("GoogleChartDataManager");
var dateHelper 	= require("./DateHelper.js");
var dbManager	= require("./DBManager.js");
var configManager = require ("./ConfigManager.js");
var utilityHelper = require("./UtilityHelper.js");
var Q = require('q');
require('q-foreach')(Q);

exports.fetchScoreSummary = function(date,callback){
	var prevDate = dateHelper.getPreviousDateAsNumber(date);
	return dbManager.getScoreSummaryByDate(date);
}

exports.fetchAggregateSummary = function(dateAsNumber){
	var deferred = Q.defer();
	dbManager.getAggregateScoreSummaryByDate(dateAsNumber).then(function(data){
		var summary = createChartDataForAggregationSummary(data);
		deferred.resolve(summary);
	},console.error);
	return deferred.promise;
}

createChartDataForAggregationSummary = function(summaryJSON){
	var result = [];
	
	var summaryScoreMap = buildMap(summaryJSON);
	var configuredScores = configManager.getConfiguredScores();
	configuredScores.forEach(function(scoreRec){
		var row = {};
		row.score = parseInt(scoreRec.score);
		row.short = scoreRec.short;
		row.description = scoreRec.description;
		
		if(summaryScoreMap.has(scoreRec.score)){
			row.count = summaryScoreMap.get(scoreRec.score); 
		}else{
			row.count = 0;
		}
		result.push(row);
	});
	return result;
}


exports.fetchAggregateScoreByDate = function(score,startDate,endDate){
	var deferred = Q.defer();
	dbManager.getAggregateScoreByDate(score,startDate,endDate).then(function(data){
		deferred.resolve(data);
	},console.error);
	return deferred.promise;
}

exports.fetchApplistByScoreByDate = function(score,dateAsNumber){
	var deferred = Q.defer();
	dbManager.getAppListByScoreAndDate(score,dateAsNumber).then(function(data){
		deferred.resolve(data);
	},console.error);
	return deferred.promise;
}

exports.fetchAppTimelineByDate = function(appid,startDate,endDate){
	var deferred = Q.defer();
	dbManager.fetchAppTimelineByDate(appid,startDate,endDate).then(function(data){
		var scoreMap = buildMapOfScores();
		data.forEach(function(rec){
			rec.short = scoreMap.get(rec.score);
		})
		deferred.resolve(data);
	},console.error);
	return deferred.promise;
}

exports.fetchHRSummary = function(appid,date){
	var deferred = Q.defer();
	dbManager.fetchHRSummary(appid,date).then(function(data){
		data[0].url = utilityHelper.buildViolationsUrl(appid,date);
		deferred.resolve(data);
	},console.error);
	return deferred.promise;
}

exports.testCreateChartDataForAggregationSummary = function(summaryJSON){
	return createChartDataForAggregationSummary(summaryJSON);
}

exports.testBuildMap = function(json){
	return buildMap(json);
}

buildMap = function (json){
	var output = new Map();

	for(var i=0; i<json.length; i++)
	{
		var key = json[i]["_id"];
		var value = json[i]["count"];
		output.set(key,value);
	}
	return output;
}


buildMapOfScores = function(){
	var output = new Map();
	var configuredScores = configManager.getConfiguredScores();
	configuredScores.forEach(function(score){
		output.set(score.score,score.short);	
	});
	return output;
}




