var childProcess = require('child_process');
var log4js = require('log4js');
var log = log4js.getLogger("NightlyFetchDataJob");
var restManager = require('./RestManager');
var dateHelper = require('./DateHelper');
var eventManager = require('./EventsManager');
var dbManager	= require("./DBManager.js");
var configManager = require("./ConfigManager.js");
var sleep = require('sleep');
var cron = require('node-cron');

var close = function(){
	
};

process.on('message', function(msg) {
	exec();
});

var exec = function(){
	if(configManager.isNightlyProcessEnabled()){
		var cronConfig = configManager.getCronExpression();
		log.info("setting up nightly job .."+cronConfig);
		cron.schedule(cronConfig, function(){
			log.info(".. running job ...");
			run();
		});
	}
}

var run = function(){
	log.info("Running job now :");
	var prevDate = dateHelper.getPreviousDateAsNumber();
	log.info("previous date :"+prevDate.toString());
	var summaryJob = childProcess.fork("./src/FetchSummaryWorker.js");
	restManager.getAppJson(function(apps){
		apps.forEach(function(app)  {
			app.prev_date = prevDate.toString();
			log.info("building summary for : "+app.id+" : "+app.name);
			
			var appAsString = JSON.stringify(app);
			summaryJob.send(appAsString);
			
			sleep.sleep(3);
		});
		summaryJob.kill();
		log.info("processed "+apps.length+" applications");
	});
}

process.on('uncaughtException', function(err) {
	log.error("NightlyFetchDataJob :"+err.toString());
});




