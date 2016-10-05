var log4js = require('log4js');
var log = log4js.getLogger("SccoreManager");
var configManager = require("./ConfigManager.js");
var gcdManager = require("./GoogleChartDataManager.js");
var dateHelper = require("./DateHelper.js");

/** 
 * Based on the health rules figure out what score the app belongs too.
 */
exports.getAppScore = function(appHealthRules){
	var rec = this.getAppScoreRecord(appHealthRules);
	if(rec){
		return rec.score;
	}
	return configManager.getConfig().default_score;
	
}

/**
 * Cycle through the config to get the first score.
 */
exports.getAppScoreRecord = function(appHealthRules){
	var names = appHealthRules.join(",").toString();
	var appScoreRec;
		
	scores = configManager.getConfiguredScores();
	for (var i = 0; i < scores.length; ++i) {
        var scoreRec = scores[i];
        var result = names.match(scoreRec.hr_match);
		if(result && result.length > 0){
			appScoreRec = scoreRec;
			break;
		}
    }
		
	return appScoreRec;
}

exports.getAppSummaryByDate = function(date){
	return gcdManager.fetchAggregateSummary(date);
}

exports.getScoreByDate = function(score,date){
	var endDate = parseInt(date);
	var startDate = dateHelper.getDateRangeAsNumber(date,configManager.getScoreRange());
	return gcdManager.fetchAggregateScoreByDate(score,startDate,endDate);
}

exports.getAppListByScoreByDate = function(score,date){
	return gcdManager.fetchApplistByScoreByDate(score,date);
}

exports.getAppTimelineByDate = function(appid,date){
	var endDate = parseInt(date);
	var startDate = dateHelper.getDateRangeAsNumber(date,configManager.getAppRange());
	return gcdManager.fetchAppTimelineByDate(appid,startDate,endDate);
}


