var log4js 		= require('log4js');
var log 		= log4js.getLogger("GoogleChartDataManager");
var dateHelper 	= require("./DateHelper.js");
var dbManager	= require("./DBManager.js");
var configManager = require ("./ConfigManager.js");
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
	var header = ['ID','App Grades','Number of Apps','Grade','Size Factor'];
	result.push(header);
	
	var summaryScoreMap = buildMap(summaryJSON);
	
	var configuredScores = configManager.getConfiguredScores();
	configuredScores.forEach(function(score){
		var row = [];
		var scoreId = parseInt(score.score);		
		row.push(score.description);
		row.push(scoreId);
		if(summaryScoreMap.has(scoreId)){
			row.push(summaryScoreMap.get(scoreId));
		}else{
			row.push(0);
		}
		row.push(score.description);
		row.push(1);
		
		if(scoreId !=0){
			result.push(row);
		}else if(summaryScoreMap.get(scoreId) > 0){
			result.push(row);
		}
	});
	return result;
}


exports.fetchAggregateScoreByDate = function(score,dateAsNumber){
	var deferred = Q.defer();
	dbManager.getAggregateScoreByDate(score,dateAsNumber).then(function(data){
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

exports.fetchAppTimelineByDate = function(appid,dateAsNumber){
	var deferred = Q.defer();
	dbManager.fetchAppTimelineByDate(appid,dateAsNumber).then(function(data){
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




