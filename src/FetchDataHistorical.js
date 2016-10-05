var schedule = require('node-schedule');
var childProcess = require('child_process');
var log4js = require('log4js');
var log = log4js.getLogger("FetchDataHistorical");
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
	rule.minute = new schedule.Range(0, 59, 5);
	
	var j = schedule.scheduleJob(rule, function() {
		log.info(new Date().toUTCString()+ " : fetch data job scheduled .."); 
		run();
	});
}

var run = function(){
	var summaryJob = childProcess.fork("./src/FetchSummaryWorker.js");
	restManager.getAppJson(function(apps){
		apps.forEach(function(app)  {
			var prevDate = dateHelper.getPreviousDateAsNumber();
			
			//Fetch last 15 days of data
			for(var i=1; i<16; i++)
			{
				log.info("building summary for : "+app.id+" : "+app.name+" : "+prevDate.toString());
				app.prev_date = prevDate.toString();
				var appAsString = JSON.stringify(app);
				summaryJob.send(appAsString);
				prevDate = dateHelper.getPreviousDateAsNumber(prevDate.toString());
				sleep.sleep(3);
			}
			sleep.sleep(3);
		});
		summaryJob.kill();
		log.info("processed "+apps.length+" applications");
	});
}

process.on('uncaughtException', function(err) {
	log.error("FetchDataHistorical :"+err.message + "\n" + err.stack);
});

run();



