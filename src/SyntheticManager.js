var log4js = require('log4js');
var log = log4js.getLogger("SyntheticManager");
log4js.configure("./log4js.json");
var restManager = require('./RestManager');
var configManager = require('./ConfigManager');
var dateHelper = require('./DateHelper');
var dbManager = require('./DBManager');
var Q = require('q');

exports.getSyntheticJobData = function(appkey,duration,callback){
	var range = dateHelper.getStartTimeAndEndTime(duration);
	restManager.fetchSyntheticJobData(appkey,range.start,range.end,function(err,resp){
		if(err){
			callback(err,null);
		}else{
			callback(null,JSON.parse(resp.body.rawResponse));
		}
	});
}

exports.getSyntheticRecordData = function(appkey,recordId,callback){
	restManager.fetchSyntheticRecordData(appkey,recordId,function(err,resp){
		if(err){
			callback(err,null);
		}else{
			callback(null,resp.body);
		}
	});
}

exports.getSyntheticPageData = function(appid,guid,resourceTimingDescriptor,callback){
	restManager.fetchSyntheticPageData(appid,guid,resourceTimingDescriptor,function(err,resp){
		if(err){
			callback(err,null);
		}else{
			callback(null,resp.body);
		}
	});
}

exports.saveSyntheticPageRecord = function(record){
	return dbManager.saveSyntheticDataRecord(record);
}

exports.getJobs = function(){
	return configManager.getConfig().syntheticJobs;
}

exports.isSyntheticJobEnabled = function(){
	return configManager.isSyntheticJobEnabled();
}

exports.getCronExpression = function(){
	return configManager.getConfig().synthetic_cron;
}

exports.close = function(){
	dbManager.close();
}

exports.getSummaryJobPageReport = function(startdate,enddate){
	var deferred = Q.defer();
	dbManager.getSyntheticPagesByJobsReport(startdate,enddate).then(function(data){
		deferred.resolve(data);
	},console.error);
	return deferred.promise;
}

exports.getSummaryPageReport = function(job,page){
	var deferred = Q.defer();
	dbManager.getSyntheticPagesMetricsReport(job,page).then(function(data){
		deferred.resolve(data);
	},console.error);
	return deferred.promise;
}

exports.getPageAvailabilityMetricTrend = function(job,page,startdate,enddate){
	var deferred = Q.defer();
	dbManager.getSyntheticAvailabilityTrendReport(job,page,startdate,enddate).then(function(data){
		deferred.resolve(data);
	},console.error);
	return deferred.promise;
}
