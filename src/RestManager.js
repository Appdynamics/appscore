var async = require("async");
var log4js = require('log4js');
var log = log4js.getLogger("RestManager");
var https = require("https");
var http = require("http");
var querystring = require('querystring');
var request = require("request").debug = true;
var needle = require("needle");
var fs = require('fs');

var HttpsProxyAgent = require('https-proxy-agent');
var HttpProxyAgent  = require('http-proxy-agent');


http.globalAgent.maxSockets = 20;
var configManager = require("./ConfigManager");

var weekDuration = parseInt(configManager.getConfig().trending_use_number_of_weeks) * (7*24*60);
var minDuration = parseInt(configManager.getConfig().trending_use_number_of_mins);
var btMinDuration = configManager.getConfig().bt_use_last_mins;
var errorCodeSnapshotsDuration = configManager.getConfig().error_code_fetch_snapshots;

var config = configManager.getConfig();
var configController = config.controller;
var proxy = config.proxy;
var auth =  'Basic '+ new Buffer(config.restuser +":"+ config.restpasswrd).toString('base64');

var fetch = function(controller,url, parentCallBack){
	var str = "";
	
	//log.debug(controller+" "+url);
	
	var options = {
		host : controller,
		method : "GET",
		path : url,
		headers : {
			"Authorization" : auth,
		}
	};

	//log.debug("fetch options :"+JSON.stringify(options));
	
	var callback = function(response) {
		response.on('data', function(chunk) {
			//log.debug("capturing data :"+chunk)
			str += chunk;
		});

		response.on('error', function(err) {
			log.error("Error : " + err);
		})

		response.on('end', function() {
			//log.debug("url :"+url);
			//log.debug("response :"+str);
			parentCallBack(str);
		});
	}.bind(this)

	if(config.https){
		var req = https.request(options, callback).end();
	}else{
		var req = http.request(options, callback).end();
	}
}

var getProtocol = function(){
	var url;
	if(config.https){
		url = "https://";
	}else{
		url = "http://";
	}
	return url;
}


/**
 * API for custom event : https://docs.appdynamics.com/display/PRO41/Use+the+AppDynamics+REST+API#UsetheAppDynamicsRESTAPI-CreateEvents
 * 
 */
exports.postEvent = function (app,metric,dataRecord,callback){
	var postData = {};
	postData.summary = "Metric "+ metric.metricName +" is Trending. Trend Factor is "+dataRecord.factor+" Trend Threshold is "+configManager.getConfig().factor_threshold;
	postData.eventtype = "CUSTOM";
	postData.customeventtype = "TREND";
	postData.severity = "ERROR";
	postData.comment = "Metric Path "+metric.metricPath;
	var url = "/controller/rest/applications/"+metric.appid+"/events";
	postJSON(app.controller,url,postData,callback);
}


var post = function(controller,postUrl,postData,contentType,parentCallBack) {
	
	var url = getProtocol() + controller + postUrl;
	var options = {
		  method: 'POST',
		  multipart : true,
		  headers:{
			  'Content-Type': "multipart/form-data'",
			  "Authorization" : auth
		  }
	};

	if(postData.file){
		needle.post(url, postData, options, function(err, resp) {
			if (err) {
				parentCallBack(err);
			} else {
				parentCallBack(resp);
			}
		});
	}else{
		needle.post(url, {body:postData}, options, function(err, resp) {
			if (err) {
				parentCallBack(err);
			} else {
				parentCallBack(resp);
			}
		});
	}
	
}

var postJSON = function(controller,postUrl,postData,parentCallBack) {
	post(controller,postUrl,postData,'application/json',parentCallBack);		
}

var postFile = function(controller,postUrl,postData,parentCallBack) {
	
	var filename = 'dash.json';
	fs.writeFileSync(filename, JSON.stringify(postData));
	
	var data = {
			file: { file: filename, content_type: 'application/json'}
	}
		
	post(controller,postUrl,data,'application/json',parentCallBack);		
}

var postXml = function(controller,postUrl,postData,parentCallBack) {
	post(controller,postUrl,postData,"text/xml",parentCallBack);
}

exports.fetchDashboard = function(dashboardId,callback){
	var url = "/controller/CustomDashboardImportExportServlet?dashboardId="+dashboardId;
	fetch(configController,url,function(response){
		callback(JSON.parse(response));
	});
}

exports.fetchHealthRules = function(appID, callback){
	var url = "/controller/healthrules/"+appID;
	fetch(configController,url,function(response){
		callback(response);
	});
}

exports.postHealthRules = function(appID,xmlData,forceHealthRules,callback){
	var url = "/controller/healthrules/"+appID;
	if(forceHealthRules){
		url = url+"?overwrite=true";
	}
	postXml(configController,url,xmlData,callback);
}

exports.postDashboard = function(dashboard,callback){
	var url = "/controller/CustomDashboardImportExportServlet";
	postFile(configController,url,dashboard,callback);
}

exports.getAppJson = function(callback) {
	var url = "/controller/rest/applications?output=JSON";
	fetch(configController,url,function(response){
		callback(JSON.parse(response));
	});
}

exports.fetchHealthRuleViolations = function(appID,dateRange,callback){
	var url = "/controller/rest/applications/"+appID+"/problems/healthrule-violations?"+dateRange+"&output=JSON";
	fetch(configController,url,function(response){
		callback(JSON.parse(response));
	});
}






