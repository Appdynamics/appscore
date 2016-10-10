var moment = require('moment');
var configManager = require("./ConfigManager.js");
var dateHelper    = require("./DateHelper.js");

exports.buildViolationsUrl = function (appid,date){
	var config = configManager.getConfig();
	var url;
	if(config.https){
		url = "https://";
	}else{
		url = "http://";
	}
	url = url + config.controller;
	if(config.port){
		url = url + ":"+config.port;
	}
	url = url + "/controller/#/location=APP_INCIDENT_LIST&timeRange=Custom_Time_Range.BETWEEN_TIMES.";
	
	var startTime = dateHelper.getStartTime(date.toString());
	var endTime   = dateHelper.getEndTime(date.toString());
	var minutesRange = 1439;
	
	url = url + endTime.toString() +"."+ startTime.toString()+"."+ minutesRange.toString();
	url = url + "&application="+appid;
	return url;
}