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

exports.getConfig = function(){
	return config;
}

exports.getDefaultDateRangeForGraphs = function(){
	return config.default_date_range;
}