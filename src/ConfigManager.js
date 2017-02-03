var config	= require("../config.json");

exports.getExcludedApps = function(){
	return config.exclude_app_ids;
}

exports.getConfiguredScores = function(){
	return config.scores;
}

exports.getExcludedAppHealthRules = function(){
	return config.exclude_app_hr;
}

exports.getIncludedHRRules = function(){
	return config.only_include_hrs_that_match;
}

exports.getConfig = function(){
	return config;
}

exports.getScoreRange = function(){
	return config.score_date_range;
}

exports.getIncidentRange = function(){
	return config.incident_date_range;
}

exports.getAppRange = function(){
	return config.app_date_range;
}

exports.getController = function(){
	return config.controller;
}

exports.getCronExpression = function(){
	return config.nightly_cron;
}

exports.isNightlyProcessEnabled = function() {
	return config.run_nightly_process;
}

exports.isSyntheticJobEnabled = function() {
	return config.fetchSyntheticData;
}

exports.getSleep = function(){
	if(config.sleep){
		return config.sleep;
	}else{
		return 5;
	}
}