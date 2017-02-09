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


exports.getSyntheticBusinessTransactionBreakdownReport = function(job,page,startdate,enddate){
	var deferred = Q.defer();
	dbManager.getSyntheticBusinessTransactionBreakdownReport(job,page,startdate,enddate).then(function(data){
		deferred.resolve(data);
	},console.error);
	return deferred.promise;
}

exports.getSyntheticBusinessTransactionTrendReport = function(job,page,btid,startdate,enddate){
	var deferred = Q.defer();
	dbManager.getSyntheticBusinessTransactionTrendReport(job,page,btid,startdate,enddate).then(function(data){
		deferred.resolve(data);
	},console.error);
	return deferred.promise;
}


exports.getSyntheticTrendReport = function(job,page,startdate,enddate,expression){
	var deferred = Q.defer();
	dbManager.getSyntheticTrendReport(job,page,startdate,enddate,expression).then(function(data){
		deferred.resolve(data);
	},console.error);
	return deferred.promise;
}

exports.getSyntheticExternalResourcesBreakdownReport = function(job,page,startdate,enddate){
	var deferred = Q.defer();
	dbManager.getSyntheticExternalResourcesBreakdownReport(job,page,startdate,enddate).then(function(data){
		deferred.resolve(data);
	},console.error);
	return deferred.promise;
}

exports.getResourceMetricTrend = function(job,page,metric,startdate,enddate){
	var deferred = Q.defer();
	dbManager.getSyntheticResourceTrendReport(job,page,startdate,enddate,metric).then(function(data){
		deferred.resolve(data);
	},console.error);
	return deferred.promise;
}

