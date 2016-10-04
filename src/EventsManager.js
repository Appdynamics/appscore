var log4js = require('log4js');
var log = log4js.getLogger("EventsManager");
var restManager = require('./RestManager');
var dateHelper = require('./DateHelper');
var hrManager = require('./HealthRuleManager');
var scoreManager = require('./ScoreManager');
var xmldom 	= require('xmldom').DOMParser;
var jp = require('jsonpath');

exports.fetchHealthRules = function (srcAppID, callback) {
	restManager.fetchHealthRules(srcAppID,function(rules){
		callback(rules);
	});
}

exports.fetchHealthRuleViolations = function (srcAppID, callback) {
	restManager.fetchHealthRuleViolations(srcAppID,function(violationsInJSON){
		callback(violationsInJSON);
	});
}

/* Take a list of enabled health rules and a json doc of health rule violations 
 * and return summary counts
 */
exports.summaryCounts = function (list,violations,callback){
	
	var summary = [];
	var qualifiedViolations = [];
	var query;
	var totalIncidents = 0;
	list.forEach(function(hr){
		query = "$..[?(@.name == \""+hr+"\" && @.affectedEntityDefinition && @.severity==\"CRITICAL\" && @.incidentStatus != \"CANCELLED\")]";
		var hrevents = jp.query(violations,query);
		hrevents.forEach(function(hr){
			qualifiedViolations.push(hr);
		})
		totalIncidents += hrevents.length;
		summary.push({name:hr,count:hrevents.length});
	});
	var result = {summary:summary,violations:qualifiedViolations,incidents:totalIncidents};
	callback(result);
}

exports.buildSummaryRecord = function(appID,callback){
	/*
	 * 1. For this app
	 * 		4.1 Fetch Health Rules 
	 * 		4.2 fetch Health Rule Violations
	 * 2. Build the summary record and return it
	 */
	
	//fetch health rules
	this.fetchHealthRules(appID, function(rules){
		
		var prevDate = dateHelper.getPreviousDay();
		var millis   = dateHelper.getEndTime(prevDate);
		var prevDateAsNumber = dateHelper.getDateAsNumber(prevDate);
		var dateRangeURL = dateHelper.getFormatTimeRange(prevDate);
		
		
		restManager.fetchHealthRuleViolations(appID,dateRangeURL,function(events){
			hrManager.listEnabledHealthRules(appID,rules,function(enabledRules){
				
				var appScore = scoreManager.getAppScore(enabledRules);
				
				exports.summaryCounts(enabledRules,events,function(summaryRecord){
					summaryRecord.date = parseInt(prevDateAsNumber);
					summaryRecord.time = millis;
					summaryRecord.appid = appID;
					summaryRecord.appname = "Test";
					summaryRecord.score = appScore;
					callback(summaryRecord);
				});
			});
		});
	});
}

exports.buildSummaryRecordByDate = function(appID,date,callback){
	/*
	 * 1. For this app
	 * 		4.1 Fetch Health Rules 
	 * 		4.2 fetch Health Rule Violations
	 * 2. Build the summary record and return it
	 */
	
	//fetch health rules
	this.fetchHealthRules(appID, function(rules){
		
		var prevDate = dateHelper.getMomentForDate(date);
		var millis   = dateHelper.getEndTime(prevDate);
		var prevDateAsNumber = dateHelper.getDateAsNumber(prevDate);
		var dateRangeURL = dateHelper.getFormatTimeRange(prevDate);
		
		
		restManager.fetchHealthRuleViolations(appID,dateRangeURL,function(events){
			hrManager.listEnabledHealthRules(appID,rules,function(enabledRules){
				
				var appScore = scoreManager.getAppScore(enabledRules);
				
				exports.summaryCounts(enabledRules,events,function(summaryRecord){
					summaryRecord.date = parseInt(prevDateAsNumber);
					summaryRecord.time = parseInt(millis);
					summaryRecord.appid = appID;
					summaryRecord.appname = "Test";
					summaryRecord.score = appScore;
					callback(summaryRecord);
				});
			});
		});
	});
}