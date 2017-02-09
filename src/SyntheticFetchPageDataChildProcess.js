var schedule = require('node-schedule');
var childProcess = require('child_process');
var log4js = require('log4js');
log4js.configure("./log4js.json");
var log = log4js.getLogger("FetchSyntheticDataJob");
var syntheticManager = require("./SyntheticManager.js");
var needle = require("needle");
var util = require('util');

var close = function(){	
};

process.on('message', function(page) {
	log.debug("SyntheticFetchPageDataChildProcess processing :"+page.synthMeasurementId);

	var url = "https://ha.saas.appdynamics.com/controller/restui/eumSessionsUiService/getPageViewTimelineForSynthetic/"+page.guid+"/"+page.resourceTimingDescriptor+"/"+page.appid;
	var options = {
			method: 'POST',
			headers:{
				json:true,
				"Content-Type": 'application/json',
				"Cookie" : page.jsessionID
			}
	};
	needle.post(url, null, options, function(err, resp) {
		if(err){
			log.error(err);
		}else{
			response = resp.body;

			var dataRec = {
				"appkey":page.appkey,
				"appid":page.appid,
				"jobname":page.name,
				"syntheticid":page.synthMeasurementId,
				"time":page.time,
				"pageurl":page.pageurl,
				"pagename":page.pagename,
				"guid":page.guid,
				"resourceTimingDescriptor":page.resourceTimingDescriptor,
				"resources":response.domains,
				"childBTs":response.childBts,
				"directBTs":response.directBTs
			}

			//update job level metrics
			dataRec.metrics = page.metrics;

			//find page level metrics
			for (var index = 0; index < page.browserrecords.length; index++) {
				var browserRec = page.browserrecords[index];
				if(browserRec.cguid == page.guid){
					dataRec.browsermetrics = browserRec;
				}
			}

			//find browser events
			response.waterfallElements.forEach(function(element){
				if(element.type == "BROWSER_EVENT"){
					if(element.label == "Visually Complete")
						dataRec["visualcomplete"] = element.startTime;
					else if(element.label == "First Byte")
						dataRec["firstbyte"] = element.startTime;
					else if(element.label == "DOM Ready")
						dataRec["domready"] = element.startTime;
					else if(element.label == "Onload")
						dataRec["onload"] = element.startTime;
					else if(element.label == "Start Render")
						dataRec["startrender"] = element.startTime;
				}
			})

			//log.debug("SyntheticFetchPageDataChildProcess processing :"+JSON.stringify(response));

			//log.debug("SyntheticFetchPageDataChildProcess Pre-Clean Up : "+JSON.stringify(dataRec,null, 2));				

			exports.cleanData(dataRec);

			//log.debug("SyntheticFetchPageDataChildProcess Post-Clean Up : "+JSON.stringify(dataRec,null, 2));				

			syntheticManager.saveSyntheticPageRecord(dataRec).then(function(data){
				log.debug("saved record "+data.syntheticid);			
			},function (error) {
				log.error(error);
			});
		}
	});

});

exports.cleanData = function(dataRec){
	if(!dataRec.resources){
		dataRec.resources = [];
	}else if(!util.isArray(dataRec.resources)){
		dataRec.resources = [];
	}
	if(!dataRec.childBTs){
		dataRec.childBTs = [];
	}else if(!util.isArray(dataRec.resources)){
		dataRec.childBTs = [];
	}
	if(!dataRec.directBTs){
		dataRec.directBTs = [];
	}else if(!util.isArray(dataRec.resources)){
		dataRec.directBTs = [];
	}

	if(!dataRec["visualcomplete"]){
		dataRec["visualcomplete"] = 0;
	}
	if(!dataRec["firstbyte"]){
		dataRec["firstbyte"] = 0;
	}
	if(!dataRec["domready"]){
		dataRec["domready"] =0;
	}
	if(!dataRec["onload"]){
		dataRec["onload"] =0;
	}
	if(!dataRec["startrender"]){
		dataRec["startrender"] =0;
	}

	return dataRec;
}

process.on('uncaughtException', function(err) {
	log.error("SyntheticFetchPageDataChildProcess Error :");
	log.error(err);
});


