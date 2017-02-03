var childProcess = require('child_process');
var log4js = require('log4js');
log4js.configure("./log4js.json");
var log = log4js.getLogger("FetchSyntheticDataJob");
var syntheticManager;
var cron = require('node-cron');
var needle = require("needle");
var jobs = [];

var pageJob = childProcess.fork("./src/SyntheticFetchPageDataChildProcess.js");
var restManager = require('./RestManager');

var close = function(){
	pageJob.close();
	pageJob.kill();
};

process.on('message', function(job) {
	restManager.establishJSessionID(function(jsessionID){
		log.debug("SyntheticFetchJobInstancesChildProcess handling message :"+JSON.stringify(job))
		var url = "https://ha.saas.appdynamics.com/controller/restui/eumSessionsUiService/getSyntheticSessionDetails/"+job.appid+"/"+job.synthMeasurementId;
		log.debug(url);
		var options = {
				method: 'GET',
				headers:{
					"Cookie" : jsessionID
				}
		};
		needle.get(url,options, function(err, resp) {
			if(err){
				log.error(err);
			}else{

				//log.debug("PageViews ");
				//log.debug(JSON.stringify(resp.body));

				if(resp.body.pageViews.length > 0 ){
					resp.body.pageViews.forEach(function(pageHeader) {

						//log.debug(JSON.stringify(pageHeader));	
						job.guid = pageHeader.guid;
						job.resourceTimingDescriptor = pageHeader.resourceTimingDescriptor;
						job.jsessionID = jsessionID;
						job.pagename = pageHeader.pageName;
						job.pageurl  = pageHeader.pageUrl;
						pageJob.send(job);	
					}, this);
				}
			}
		});
	});

});

process.on('uncaughtException', function(err) {
	log.error("SyntheticFetchJobInstancesChildProcess error ");
	log.error(err);
});



