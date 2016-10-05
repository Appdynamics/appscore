var schedule = require('node-schedule');
var childProcess = require('child_process');
var log4js = require('log4js');
var log = log4js.getLogger("FetchSummaryWorker");
var restManager = require('./RestManager');
var dateHelper = require('./DateHelper');
var eventManager = require('./EventsManager');
var dbManager	= require("./DBManager.js");
var configManager = require("./ConfigManager.js");

var close = function(){
	
};

process.on('message', function(msg) {
	var app = JSON.parse(msg);
	var prevDate = app.prev_date;
	eventManager.buildSummaryRecordByDate(app.id,app.name,app.prev_date,function(summary){
		log.info("saving summary record :"+summary.appid+" "+summary.appname+" "+summary.score);
		dbManager.saveSummaryRecord(summary).then(function (data) {
			process.send(data);
		},console.error)
		
	});
});

process.on('uncaughtException', function(err) {
	log.error("FetchSummaryWorker :"+err.message + "\n" + err.stack);
});


