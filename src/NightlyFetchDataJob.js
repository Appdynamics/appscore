var schedule = require('node-schedule');
var childProcess = require('child_process');
var log4js = require('log4js');
var log = log4js.getLogger("NightlyFetchDataJob");
var restManager = require('./RestManager');
var dateHelper = require('./DateHelper');
var eventManager = require('./EventsManager');
var dbManager	= require("./DBManager.js");
var configManager = require("./ConfigManager.js");
var sleep = require('sleep');

var close = function(){
	
};

process.on('message', function(msg) {
	exec();
});

var exec = function(){
	var minSchedule = parseInt(configManager.getConfig());
	var rule = new schedule.RecurrenceRule();
	rule.minute = new schedule.Range(0, 59, 15);
	
	if(configManager.getConfig().run_nightly_process){
		var j = schedule.scheduleJob(rule, function() {
			log.info(new Date().toUTCString()+ " : fetch data job scheduled .."); 
			run();
		});
	}
}

var run = function(){
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
	log.error("NightlyFetchDataJob :"+err.message + "\n" + err.stack);
});




