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

log4js.configure('log4js.json');

var run = function(){
	var summaryJob = childProcess.fork("./src/FetchSummaryWorker.js");
	var apps = [{id:19,name:"ION-Tracking"}];
	apps.forEach(function(app)  {
		var prevDate = dateHelper.getPreviousDateAsNumber();
		var extractDays = parseInt(configManager.getConfig().extractDays);

		for(var i=1; i<extractDays; i++)
		{
			log.info("building summary for : "+app.id+" : "+app.name+" : "+prevDate.toString());
			app.prev_date = prevDate.toString();
			var appAsString = JSON.stringify(app);
			summaryJob.send(appAsString);
			prevDate = dateHelper.getPreviousDateAsNumber(prevDate.toString());
			sleep.sleep(configManager.getSleep());
		}
		sleep.sleep(configManager.getSleep());
	});
	summaryJob.kill();
	log.info("processed "+apps.length+" applications");
}

run();



