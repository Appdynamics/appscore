var childProcess = require('child_process');
var log4js = require('log4js');
log4js.configure("./log4js.json");
var log = log4js.getLogger("FetchSyntheticDataJob");
var syntheticManager = require("./SyntheticManager");
var cron = require('node-cron');
var sleep = require('sleep');
var jobProcess = childProcess.fork("./src/SyntheticFetchJobInstancesChildProcess.js");

var close = function(){
	syntheticManager.close();
};

process.on('message', function(msg) {
	log.debug("FetchSyntheticDataMainProcess running ..");
	//exec();
	//exports.run();
});

var exec = function(){
	if(syntheticManager.isSyntheticJobEnabled()){
		var cronConfig = syntheticManager.getCronExpression();
		log.info("setting up synthetic job .."+cronConfig);
		cron.schedule(cronConfig, function(){
			log.info(".. running synthetic job ...");
			//exports.run();
		});
	}
}

exports.run = function(){
	syntheticManager.getJobs().forEach(function(job) {
		syntheticManager.getSyntheticJobData(job.appkey,60*24*7,function(err,results){
			if(results && results.hits && results.hits.total > 0){
				log.debug("processing records :"+results.hits.total);
				var count = 0;
				results.hits.hits.forEach(function(jobInstance) {
					count++;
					log.debug("processing job instance : "+count+" of "+results.hits.total);
					log.debug("processing :"+jobInstance._source.synthMeasurementId);
					var jobRecord = {
						"appkey":job.appkey,
						"synthMeasurementId": jobInstance._source.synthMeasurementId,
						"appid":job.appid,
						"name":job.name,
						"time":jobInstance._source.startTimeMS,
						"metrics":jobInstance._source.metrics,
						"browserrecords":jobInstance._source.browserRecords
					};
					//log.debug("Sending :"+JSON.stringify(jobRecord));
					jobProcess.send(jobRecord);
					sleep.sleep(1);
				}, this);
			}
		});
	}, this);
}

process.on('uncaughtException', function(err) {
	log.error("FetchSyntheticDataJob :",err);
	
});



