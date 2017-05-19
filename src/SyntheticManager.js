var log4js = require('log4js');
var log = log4js.getLogger("SyntheticManager");
log4js.configure("./log4js.json");
var restManager = require('./RestManager');
var configManager = require('./ConfigManager');
var dateHelper = require('./DateHelper');
var dbManager = require('./DBManager');
var Q = require('q');
var arrayContains = require('array-contains');

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

exports.getSyntheticQueryDuration = function(){
	return configManager.getConfig().syntheticQueryDuration;
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

exports.getSummaryJobMetricsByHour = function(startdate,enddate,hourofday){
	var deferred = Q.defer();
	dbManager.getSyntheticJobMetricsByHour(startdate,enddate,hourofday).then(function(data){
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

exports.updateSyntheticSnapshotUrl = function(rec){
	rec.syntheticSnapshotUrl = configManager.getControllerUrl()+"/#/location=EUM_SYNTHETIC_SESSION_DETAILS&timeRange=last_15_minutes.BEFORE_NOW.-1.-1.15&application="+rec.appid+"&gridFilters=scheduleId%253A"+rec.scheduleId+"&analyticsDashId=317&synthMeasurementId="+rec.syntheticid;
}

exports.getSyntheticRecordById = function(id){
	var deferred = Q.defer();
	dbManager.getRecordById(id).then(function(data){
		exports.updateSyntheticSnapshotUrl(data);
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

exports.getUniqueJobs = function(){
	var deferred = Q.defer();
	dbManager.getUniqueJobNames().then(function(data){
		deferred.resolve(data);
	},console.error);
	return deferred.promise;
}

exports.getJobPagesByMonth = function(job,startdate,enddate){
	var deferred = Q.defer();
	dbManager.getJobPagesByMonth(job,startdate,enddate).then(function(data){
		deferred.resolve(data);
	},console.error);
	return deferred.promise;
}

exports.getJobPagesByDay = function(job,startdate,enddate){
	var deferred = Q.defer();
	dbManager.getJobPagesByDay(job,startdate,enddate).then(function(data){
		deferred.resolve(data);
	},console.error);
	return deferred.promise;
}

exports.saveTrendRec = function(trendRec){
	return dbManager.saveTrendRec(trendRec);
}

exports.getTrendRecords = function(){
	return dbManager.getSyntheticTrendData();
}

exports.getExperiment = function(){
	return dbManager.getExperiment();
}

exports.getSyntheticQuickTrendReport = function(jobname,startdate,enddate){
	var deferred = Q.defer();
	dbManager.getSyntheticQuickTrendReport(jobname,startdate,enddate).then(function(data){
		deferred.resolve(data);
	},console.error);
	return deferred.promise; 
}

exports.getSyntheticPageTrendReport = function(startdate,enddate,page){
	var deferred = Q.defer();

	var project = {time:"$time",appid:"$appid",jobname:"$jobname",pagename:"$pagename"};

	if(arrayContains(page.metrics,["onload"])){
		project.onload = "$onload";
	}
	if(arrayContains(page.metrics,["firstbyte"])){
		project.firstbyte =  "$firstbyte";
	}
	if(arrayContains(page.metrics,["drt"])){
		project.drt = "$domready";
	}
	if(arrayContains(page.metrics,["availability"])){
		project.availability = "$availability";
	}
	if(arrayContains(page.metrics,["visualcomplete"])){
		project.visualcomplete = "$visualcomplete";
	}
	if(arrayContains(page.metrics,["startrender"])){
		project.visualcomplete = "$startrender";
	}

	dbManager.getSyntheticPageTrendReport(startdate,enddate,page,project).then(function(data){
		deferred.resolve(data);
	},console.error);
	return deferred.promise; 
}

var socket;
exports.setSocket = function (_socket){
	this.socket = _socket;
	log.debug("socket is null");
}

exports.sendSocketData = function(data){
	if(socket){
		log.debug("sending socket data : ");
		log.debug(JSON.stringify(data));
		socket.emit('synthetic_trend', data);
	}else{
		log.debug("socket is null");
	}
}


