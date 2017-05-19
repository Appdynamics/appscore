var async = require("async");
var log4js = require('log4js');
var log = log4js.getLogger("RestManager");

var configManager = require("./ConfigManager");
var config = configManager.getConfig();

var https;
if(config.restdebug){
	https = require("http-debug").https;
}else{
	https = require("https");
}
var http;
if(config.restdebug){
	http = require("http-debug").http;
}else{
	http = require("http");
}

var querystring = require('querystring');
var request = require("request");
var needle = require("needle");
var fs = require('fs');
var Q = require('q');

var HttpsProxyAgent = require('https-proxy-agent');
var HttpProxyAgent  = require('http-proxy-agent');

var proxy = config.proxy;
var saml  = config.saml;

var weekDuration = parseInt(config.trending_use_number_of_weeks) * (7*24*60);
var minDuration = parseInt(config.trending_use_number_of_mins);
var btMinDuration = config.bt_use_last_mins;
var errorCodeSnapshotsDuration = config.error_code_fetch_snapshots;

var auth =  'Basic '+ new Buffer(config.restuser +":"+ config.restpasswrd).toString('base64');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

http.debug = 2;
http.globalAgent.maxSockets = 20;
minErrorCode = 400;

var addproxy = function(options){
	if(config.https && proxy){
		var agent = new HttpsProxyAgent(proxy)
		options.agent = agent;
	}
	if(!config.https && proxy){
		var agent = new HttpProxyAgent(proxy)
		options.agent = agent;
	}
}

var fetch = function(controller,url, parentCallBack,headers){
	var str = "";
	if(!headers){
		headers = {"Authorization" : auth}
	}
	var options = {
		host : controller,
		port : getPort(),
		method : "GET",
		path : url,
		headers : headers
	};
	
	addproxy(options);
	if(config.restdebug){
		log.debug("fetch options :"+JSON.stringify(options));
	}
	
	var callback = function(response) {
		response.on('data', function(chunk) {
			str += chunk;
		});

		response.on('error', function(err) {
			parentCallBack(err,null);
		})

		response.on('end', function() {
			if(config.restdebug){
				log.debug("fetch status code :"+response.statusCode);
				log.debug("fetch response    :");
				log.debug(str);
			}
			if(response.statusCode >= minErrorCode){
				parentCallBack(str,null);
			}else{
				parentCallBack(null,str);
			}
		});
	}.bind(this)

	if(config.https){
		var req = executeRequest(controller,https,options,callback);
	}else{
		var req = executeRequest(controller,http,options,callback);
	}
}

var fetchJSessionID = function(controller,parentCallBack){
	var str = "";
	
	var options = {
		host : controller,
		port : getPort(),
		method : "GET",
		path : "/controller/auth?action=login",
		rejectUnauthorized: false,
		headers : {
			"Authorization" : auth,
		}
	};
	
	addproxy(options);
	
	if(config.restdebug){
		log.debug("JSessionID fetch options :"+JSON.stringify(options));
	}

	var callback = function(response) {
		response.on('data', function(chunk) {
			str += chunk;
		});

		response.on('error', function(err) {
			parentCallBack(err,null);
		})

		response.on('end', function() {
			if(config.restdebug){
				log.debug("fetchJessionID status code :"+response.statusCode);
				log.debug("fetchJSessionID response    :");
				log.debug(str);
			}
			if(response.statusCode >= minErrorCode){
				parentCallBack(response,null);
			}else{
				parentCallBack(null,response);
			}
		});
	}.bind(this);

	if(config.https){
		var req = https.request(options,callback).end();
	}else{
		var req = http.request(options,callback).end();
	}
}

var parseCookies  = function (response) {
    var rc = response.headers['set-cookie'];
    var jsessionid = null;
    rc.forEach(function( parts ) {
    	parts.split(";").forEach(function(cookieStr){
    		if (cookieStr.startsWith("JSESSIONID")){
    			jsessionid = cookieStr;
    		}
    	});
    });
    return jsessionid;
}

var executeRequest = function(controller,protocol,options,callback){
	if(saml){
		fetchJSessionID(controller,function(err,response){
			var jsessionId = parseCookies(response);
			options.headers = {"Cookie":jsessionId};
			options.withCredentials = true;
			return protocol.request(options, callback).end();
		})
	}else{
		return protocol.request(options, callback).end();
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

var getPort = function(){
	var port = 8080;
	if (config.port){
		port = config.port;
	}else{
		if(config.https){
			port = 443;
		}
	}
	return port;
}

/**
 * API for custom event : https://docs.appdynamics.com/display/PRO41/Use+the+AppDynamics+REST+API#UsetheAppDynamicsRESTAPI-CreateEvents
 * 
 */
exports.postEvent = function (app,metric,dataRecord,callback){
	var postData = {};
	postData.summary = "Metric "+ metric.metricName +" is Trending. Trend Factor is "+dataRecord.factor+" Trend Threshold is "+config.factor_threshold;
	postData.eventtype = "CUSTOM";
	postData.customeventtype = "TREND";
	postData.severity = "ERROR";
	postData.comment = "Metric Path "+metric.metricPath;
	var url = "/controller/rest/applications/"+metric.appid+"/events";
	postJSON(app.controller,url,postData,callback);
}

/**
 * TODO : Refactor contentType, it is not being used.
 */
var post = function(controller,postUrl,postData,contentType,parentCallBack) {
	
	var url = getProtocol() + controller +":"+getPort()+postUrl;
	var options = {
		  method: 'POST',
		  multipart : true,
		  rejectUnauthorized: false,
		  headers:{
			  'Content-Type': 'multipart/form-data',
			  "Authorization" : auth
		  }
	};

	if(!postData.file){
		postData = {body:postData};
	}
	needle.post(url, postData, options, function(err, resp) {
		handleResponse(err,resp,parentCallBack);
	});
}

var handleResponse = function(err,resp,parentCallBack){
	if (err) {
		parentCallBack(err,null);
	} else {
		if(resp.statusCode >= minErrorCode){
			parentCallBack(resp,null)
		}else{
			parentCallBack(null,resp);
		}
	}
}

var postJSON = function(controller,postUrl,postData,parentCallBack) {
	post(controller,postUrl,postData,'application/json',parentCallBack);		
}

var postFile = function(controller,postUrl,postData,parentCallBack) {
	
	var filename = 'temp-dash.json';
	fs.writeFileSync(filename, JSON.stringify(postData));
	
	var data = {
			file: { file: filename, content_type: 'application/json'}
	}
		
	post(controller,postUrl,data,'application/json',parentCallBack);		
}

var postXml = function(controller,postUrl,postData,parentCallBack) {
	post(controller,postUrl,postData,"text/xml",parentCallBack);
}


var makeFetch = function(controller,url,callback,xml,headers){
	fetch(controller,url,function(err,response){
		if(err){
			callback(err,null);
		}else{
			if(xml){
				callback(null,response);
			}else{
				callback(null,JSON.parse(response));
			}
		}
	},headers);
}


exports.fetchDashboard = function(dashboardId,callback){
	var url = "/controller/CustomDashboardImportExportServlet?dashboardId="+dashboardId;
	makeFetch(config.controller,url,callback);
}

exports.fetchHealthRules = function(appID, callback){
	var url = "/controller/healthrules/"+appID;
	makeFetch(config.controller,url,callback,true);
}

exports.postHealthRules = function(appID,xmlData,forceHealthRules,callback){
	var url = "/controller/healthrules/"+appID;
	if(forceHealthRules){
		url = url+"?overwrite=true";
	}
	postXml(config.controller,url,xmlData,callback);
}

exports.postDashboard = function(dashboard,callback){
	var url = "/controller/CustomDashboardImportExportServlet";
	postFile(config.controller,url,dashboard,callback);
}

exports.getAppJson = function(callback) {
	var url = "/controller/rest/applications?output=JSON";
	makeFetch(config.controller,url,callback);
}

exports.fetchHealthRuleViolations = function(appID,dateRange,callback){
	var url = "/controller/rest/applications/"+appID+"/problems/healthrule-violations?"+dateRange+"&output=JSON";
	makeFetch(config.controller,url,callback);
}

exports.getTiersJson = function(app,callback) {
	var url = "/controller/rest/applications/"+app+"/tiers?output=JSON";
	makeFetch(config.controller,url,callback);
}

exports.getNodesJson = function(app,tier,callback) {
	var url = "/controller/rest/applications/"+app+"/tiers/"+tier+"/nodes?output=JSON";
	makeFetch(config.controller,url,callback);
}

exports.fetchControllerAuditHistory = function(url,callback){
	makeFetch(config.controller,url,callback);
}

// exports.fetchJobInstances = function(queryObj,callback){
// 	var query = {"query":{"filtered":{"query":{"bool":{"must":[{"match":{"appkey":{"query":queryObj.appkey}}}]}},"filter":{"bool":{"must":[{"range":{"eventTimestamp":{"from":1484328747193,"to":1484329647193}}},{"match_all":{}}]}}}},"size":250,"sort":[{"eventTimestamp":{"order":"desc"}}]};
// 	var postUrl = "/controller/restui/analytics/searchJson/SYNTH_SESSION_RECORD";
// 	postUICall(config.controller,postUrl,JSON.stringify(query),callback);
// }

exports.fetchSyntheticJobData= function(appkey,start_time,end_time,callback){
	var query = {"query":{"filtered":{"query":{"bool":{"must":[{"match":{"appkey":{"query":appkey}}}]}},"filter":{"bool":{"must":[{"range":{"eventTimestamp":{"from":end_time,"to":start_time}}},{"match_all":{}}]}}}},"size":250,"sort":[{"eventTimestamp":{"order":"desc"}}]};
	var postUrl = "/controller/restui/analytics/searchJson/SYNTH_SESSION_RECORD";
	postUICall(config.controller,postUrl,JSON.stringify(query),callback);
}

exports.fetchSyntheticRecordData= function(appid,synthMeasurementId,callback){
	var url = "/controller/restui/eumSessionsUiService/getSyntheticSessionDetails/"+appid+"/"+synthMeasurementId;
	getUICall(config.controller,url,callback);
}

exports.fetchSyntheticPageData= function(appid,guid,id,callback){
	var url = "/controller/restui/eumSessionsUiService/getPageViewTimelineForSynthetic/"+guid+"/"+id+"/"+appid;
	postUICall(config.controller,url,null,callback);
}

exports.establishJSessionID = function(callback){
	fetchJSessionID(config.controller,function(err,response){
		callback(parseCookies(response));
	});
}



var postUICall = function(controller,postUrl,postData,parentCallBack) {
	fetchJSessionID(controller,function(err,response){
	    var jsessionId = parseCookies(response);
		var url = getProtocol() + controller +":"+getPort()+postUrl;
		var options = {
			  method: 'POST',
			  headers:{
				  json:true,
				  "Content-Type": 'application/json',
				  "Cookie" : jsessionId
			  }
		};

		if(config.restdebug){
			log.debug("url :"+postUrl);
			log.debug("postData :"+postData);
			log.debug("options :"+JSON.stringify(options));
		}

		needle.post(url, postData, options, function(err, resp) {
			if(config.restdebug){
				log.debug("err :"+err);
				log.debug("resp :"+JSON.stringify(resp.body));
			}
			handleResponse(err,resp,parentCallBack);
		});
	});
}

var getUICall = function(controller,getUrl,parentCallBack) {
	fetchJSessionID(controller,function(err,response){
	    var jsessionId = parseCookies(response);
		var url = getProtocol() + controller +":"+getPort()+getUrl;
		var options = {
			  method: 'GET',
			  headers:{
				  "Cookie" : jsessionId
			  }
		};
		if(config.restdebug){
			log.debug("url :"+postUrl);
			log.debug("options :"+JSON.stringify(options));
		}
		needle.get(url,options, function(err, resp) {
			if(config.restdebug){
				log.debug("err :"+err);
				log.debug("resp :"+resp);
			}
			handleResponse(err,resp,parentCallBack);
		});
	});
}




