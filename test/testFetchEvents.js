var log4js 			= require('log4js');
var log 			= log4js.getLogger("testFetchEvents");
var assert    		= require("chai").assert;
var sinon      		= require('sinon');
var eventsManager   = require("../src/EventsManager.js");
var dbManager   	= require("../src/DBManager.js");
var gcdManager   	= require("../src/GoogleChartDataManager.js");
var dateHelper		= require("../src/DateHelper.js");
var scoreManager	= require("../src/ScoreManager.js");

//describe("Functional test of fetching events", function() {
//	it('Fetch Events', function (done) {
//		
//		var appIds = [19,20,21,24,25,53,54,55,56];
//		
//		for(var i=0; i<appIds.length; i++)
//		{
//			var appid = appIds[i];
//			eventsManager.buildSummaryRecordByDate(appid,"Test","20161004", function(summaryRecord){
//				dbManager.saveSummaryRecord(summaryRecord);
//				log.debug(JSON.stringify(summaryRecord));
//				
//			})
//		}
//    });
//});

//describe("Functional test of fetching score summary for a specific date", function() {
//	it('Fetch Summary', function (done) {
//		scoreManager.getAppSummaryByDate("20160929").then(function (data) {
//			log.debug(data);
//			done();
//		},console.error);
//    });
//});

//describe("Functional test of fetching score summary for a specific date", function() {
//	it('Fetch Summary', function (done) {
//		scoreManager.getAppTimelineByDate(111,"20161004").then(function (data) {
//			log.debug(data);
//			done();
//		},console.error);
//	});
//});

//describe("Functional test of fetching hr summary for a specific app and date", function() {
//	it('Fetch Summary', function (done) {
//		scoreManager.getHRSummary(143,"20160925").then(function (data) {
//			log.debug(JSON.stringify(data));
//			done();
//		},console.error);
//	});
//});



