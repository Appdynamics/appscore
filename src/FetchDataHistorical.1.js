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

	var fetchSummaryData = configManager.getConfig().fetchSummaryData;
	var fetchAuditHistory = configManager.getConfig().fetchAuditHistory;

	log.info("fetchSummaryData :"+fetchSummaryData);
	if (fetchSummaryData)
	{
		log.info("fetchSummaryData :"+fetchSummaryData);
		var summaryJob = childProcess.fork("./src/FetchSummaryWorker.js");
		restManager.getAppJson(function(error,apps){
			
			log.info("processing apps");

			if(error){
				log.error(error);
				return;
			}
			

			apps.forEach(function(app)  {
				log.info("processing :");

				var prevDate = dateHelper.getPreviousDateAsNumber();
				var extractDays = parseInt(configManager.getConfig().extractDays);

				for(var i=1; i<=extractDays; i++)
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
		});
	}

	if (fetchAuditHistory)
	{
		var auditHistoryJob = childProcess.fork("./src/FetchAuditHistoryWorker.js");
		var prevDate = dateHelper.getPreviousDateAsNumber();
		var extractDays = parseInt(configManager.getConfig().extractDays);

		for(var i=1; i<extractDays; i++)
		{
			log.info("date: " + prevDate.toString());
			auditHistoryJob.send(prevDate.toString());
			prevDate = dateHelper.getPreviousDateAsNumber(prevDate.toString());
			sleep.sleep(configManager.getSleep());
		}
		sleep.sleep(configManager.getSleep());
		auditHistoryJob.kill();
		log.info("fetchAuditHistory complete");
	}		
}

run();



