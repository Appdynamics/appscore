var dateHelper = require("./DateHelper.js");
var configManager = require("./ConfigManager");
var restManager = require("./RestManager");
var dbManager = require("./DBManager");
var log4js = require('log4js');
var log = log4js.getLogger("FetchAuditHistoryWorker");
var sleep = require('sleep');
var moment = require('moment');

var close = function(){
	
};

process.on('message', function(date) {

	var applicationList = [];

	restManager.getAppJson(function(err,apps){

		for (var i = 0; i < apps.length; i++)
		{
			var app = apps[i];
			var newApplication = {appId:app.id, appName:app.name};
			applicationList.push(newApplication);
		}

		var excludedExctractUserIds = configManager.getConfig().excludedExctractUserIds;

		//Format dates to use in REST API
		//Get Given Date and Previous Date and Convert it into YYYY-MM-DD format
		var today = ''+[date.slice(0, 4), date.slice(4,6), date.slice(6,8)].join('-');
		var y = ''+dateHelper.getPreviousDateAsNumber(date);
		var yesterday = [y.slice(0, 4), y.slice(4,6), y.slice(6,8)].join('-');
		
		//Get UTC Offset
		var offset = moment().format("Z");
		offset = offset.replace(/:/g,''); 
		
		var url = '/controller/ControllerAuditHistory\?startTime='+yesterday+'T00:00:00.607'+offset+'\&endTime='+today+'T00:00:00.607'+offset;
		
		//console.log("url1: " + url + ", " + date);

		restManager.fetchControllerAuditHistory(url,function(error,auditarray){
			
			//console.log('API Call Complete: ' + date);
			//console.log('auditarray.length: ' + auditarray.length);

			var userApps = [];

			for(var i = 0; i < auditarray.length; i++)
			{
				var auditHistory = auditarray[i];

				var isUserExcluded = false;

				for (var j = 0; j < excludedExctractUserIds.length; j++)
				{
					if (auditHistory.userName.toLowerCase() == excludedExctractUserIds[j].toString().toLowerCase())
					{
						isUserExcluded = true;
						break;
					}
				}

				if (isUserExcluded)
				{
					//
					// Do not save record
					//
				}
				else if (auditHistory.action == "APP_CONFIGURATION" && auditHistory.objectType == "APPLICATION")
				{
					var foundMatch = false;

					for (var j = 0; j < userApps.length; j++) 
					{
						var userApp = userApps[j];
						if (userApp.userName == auditHistory.userName)
						{
							userApp.appName = auditHistory.objectName;
							foundMatch = true;
							break;
						}
					}

					if (foundMatch == false)
					{
						var newUserApp = {userName:auditHistory.userName, appName:auditHistory.objectName};
						userApps.push(newUserApp);
					}
				}
				else
				{
					var auditHistoryRecord = new Object(); 
					var auditDateTime = auditHistory.auditDateTime;
					auditHistoryRecord.date = parseInt(auditDateTime.substring(0, 4) + auditDateTime.substring(5, 7) + auditDateTime.substring(8, 10));
					auditHistoryRecord.auditDateTime = auditHistory.auditDateTime;
					auditHistoryRecord.userName = auditHistory.userName;
					auditHistoryRecord.action = auditHistory.action;
					auditHistoryRecord.objectType = auditHistory.objectType;
					auditHistoryRecord.objectName = auditHistory.objectName;
					
					if (auditHistory.action == "LOGIN" ||
						auditHistory.objectType == "POLICY" ||
						auditHistory.action == "REPORTS_APP_ON_DEMAND" ||
						auditHistory.objectType == "USER")
					{
						//
						// Do not try to get the application
						//
						// Some AH entries are either inherently not tied to an application, 
						// or the application is not reliable, such as with Health Rules (objectType = POLICY)
						//

					}
					else
					{
						for (var j = 0; j < userApps.length; j++) 
						{
							var userApp = userApps[j];
							if (userApp.userName == auditHistory.userName)
							{
								auditHistoryRecord.appname = userApp.appName;
								break;
							}
						}

						if (auditHistoryRecord.appname)
						{
							for (var j = 0; j < applicationList.length; j++) 
							{
								var application = applicationList[j];
								if (auditHistoryRecord.appname == application.appName)
								{
									auditHistoryRecord.appid = application.appId;
									break;
								}
							}
						}
					}

					dbManager.saveAuditHistoryRecord(auditHistoryRecord).then(function (data) {
						//log.info("saving audithistory record ");
					},console.error)

				}
			}

			log.info("Finished saving audithistory records");
		});

	});

});

process.on('uncaughtException', function(err) {
	log.error("FetchAuditHistoryWorker :"+err.message + "\n" + err.stack);
});

