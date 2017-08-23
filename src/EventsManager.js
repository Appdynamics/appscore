var log4js = require('log4js');
var log = log4js.getLogger("EventsManager");
log4js.configure("./log4js.json");
var configManager = require('./ConfigManager');
var restManager = require('./RestManager');
var dateHelper = require('./DateHelper');
var hrManager = require('./HealthRuleManager');
var scoreManager = require('./ScoreManager');
var xmldom 	= require('xmldom').DOMParser;
var jp = require('jsonpath');

exports.fetchHealthRules = function (srcAppID, callback) {
	restManager.fetchHealthRules(srcAppID,function(error,rules){
		if(error){
			log.error("Error occured while fetching health rules for appid "+srcAppID);
			log.error(error);
		}
		callback(rules);
	});
}

/* Take a list of enabled health rules and a json doc of health rule violations 
 * and return summary counts
 */
exports.summaryCounts = function (enabledHRs,violations,filterByAgentAvailabilityFlag,agentAvailabilityFilters,callback){
	
	var summary = [];
	var agents = [];
	var qualifiedViolations = [];
	var query;
	var totalIncidents = 0;
	var totalAgentAvailability = 0;
	var totalHRIncidents = 0;
	enabledHRs.forEach(function(hr){
		query = "$..[?(@.name == \""+hr+"\")]";
		var hrevents = jp.query(violations,query);
		var numEvents = hrevents.length;

		if(filterByAgentAvailabilityFlag && exports.isAgentAvailabilityEvent(agentAvailabilityFilters,hr)){
			totalAgentAvailability += numEvents;
			agents.push({name:hr,count:numEvents});
		}else{
			totalHRIncidents += numEvents;
			summary.push({name:hr,count:numEvents});
		}
		totalIncidents += numEvents;
	});
	var result = {summary:summary,agents:agents,violations:violations,incidents:totalHRIncidents,agent_availability_incidents:totalAgentAvailability,total_incidents:totalIncidents};
	callback(result);
}

exports.isAgentAvailabilityEvent = function(filters,hrName){
	var index = filters.indexOf(hrName);
	return index >= 0;
}

exports.buildSummaryRecordByDate = function(appID,appName,date,callback){
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
		
		restManager.fetchEventsViolations(appID,dateRangeURL,function(error,events){
			if(error){
				log.error(error);
			}
			hrManager.listEnabledHealthRules(appID,rules,function(enabledRules){
				
				var appScore = scoreManager.getAppScore(enabledRules);

				exports.summaryCounts(enabledRules,events,configManager.isFilterByAgentAvailabilityEnabled(),configManager.getAgentAvailabilityHrs(),function(summaryRecord){
					summaryRecord.date = parseInt(prevDateAsNumber);
					summaryRecord.time = parseInt(millis);
					summaryRecord.appid = appID;
					summaryRecord.appname = appName;
					summaryRecord.score = appScore;
					callback(summaryRecord);
				});
			});
		});
	});
}