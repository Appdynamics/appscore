var log4js = require('log4js');
var log = log4js.getLogger("ScoreManager");
var configManager = require("./ConfigManager.js");
var gcdManager = require("./GoogleChartDataManager.js");
var dateHelper = require("./DateHelper.js");
var restManager = require('./RestManager');
var hrManager = require('./HealthRuleManager');
var Q = require('q');


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
	var names = appHealthRules;
	var appScoreRec;
		
	scores = configManager.getConfiguredScores();
	for (var i = 0; i < scores.length; ++i) {
        var scoreRec = scores[i];
        
        for(var index=0; index < names.length; index++){
        	var name = names[index];
        	var result = name.match(scoreRec.hr_match)
        	if(result && result.length > 0){
        		appScoreRec = scoreRec;
        		appScoreRec.match = name;
        		break;
        	}
        }
        if(appScoreRec){
        	break;
        }
    }
		
	return appScoreRec;
}

exports.getAppScoreRecordById = function(id){
	var appScoreRec;
		
	scores = configManager.getConfiguredScores();
	for (var i = 0; i < scores.length; ++i) {
        var scoreRec = scores[i];
        if(scoreRec.score == id){
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

exports.getHRSummary = function(appid,date){
	return gcdManager.fetchHRSummary(appid,date);
}

exports.getIncidentTrend = function(date){
	//for now ignore date
	return gcdManager.getIncidentTrend();
}

exports.getAppIncidentTrend = function(appid){
	return gcdManager.getAppIncidentTrend(appid);
}

exports.getAppListIncidentsByDate = function(date){
	return gcdManager.getAppListIncidentsByDate(date);
}

exports.getAppsForDowngrade = function(score,startDate,endDate){
	var scoreRec = exports.getAppScoreRecordById(score);
	return gcdManager.getAppsForDowngrade(score,parseInt(startDate),parseInt(endDate),scoreRec.min_incidents);
}

exports.getAppsForUpgrade = function(score,startDate,endDate){
	var scoreRec = exports.getAppScoreRecordById(score);
	return gcdManager.getAppsForUpgrade(score,parseInt(startDate),parseInt(endDate),scoreRec.min_incidents);
}


exports.getScoreConfig = function(){
	return configManager.getConfiguredScores();
}

exports.changeScore = function(appid,target_score_id){
	log.info("Changing Grade For :"+appid+" To Grade ID "+target_score_id);
	var deferred = Q.defer();
	restManager.fetchHealthRules(appid,function(error,rules){
		hrManager.changeScore(appid,target_score_id,rules,function(updatedXml){
			restManager.postHealthRules(appid,updatedXml,true,function(result){
				//now verify the score was changed.
				restManager.fetchHealthRules(appid,function(error,rules){
					hrManager.listEnabledHealthRules(appid,rules,function(enabledRules){
						var scoreRecId = exports.getAppScore(enabledRules);
						var scoreRec   = exports.getAppScoreRecordById(scoreRecId);
						if(scoreRec.score == target_score_id){
							deferred.resolve("Grade Successfully Changed to :"+scoreRec.description);
						}else{
							deferred.resolve("Error : Grade Not Changed Successfully! Grade Reported As :"+scoreRec.description);
						}
					
					})
					
				});
			});
		});
	});
	return deferred.promise;
	
}



