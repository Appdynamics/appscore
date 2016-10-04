var log4js 			= require('log4js');
var log 			= log4js.getLogger("testFetchEvents");
var assert    		= require("chai").assert;
var sinon      		= require('sinon');
var eventsManager   = require("../src/EventsManager.js");
var dbManager   	= require("../src/DBManager.js");
var gcdManager   	= require("../src/GoogleChartDataManager.js");
var dateHelper		= require("../src/DateHelper.js");
var scoreManager	= require("../src/ScoreManager.js");

describe("Functional test of fetching events", function() {
//	it('Fetch Events', function (done) {
//		eventsManager.buildSummaryRecordByDate(110,"20160930", function(summaryRecord){
//			dbManager.saveSummaryRecord(summaryRecord);
//			done();
//		})
//    });
});

//describe("Functional test of fetching score summary for a specific date", function() {
//	it('Fetch Summary', function (done) {
//		gcdManager.fetchAggregateSummary("20160929").then(function (data) {
//			log.debug(data);
//			done();
//		},console.error);
//    });
//});

describe("Functional test of fetching score summary for a specific date", function() {
	it('Fetch Summary', function (done) {
		scoreManager.getAppTimelineByDate(111,20161004).then(function (data) {
			log.debug(data);
			done();
		},console.error);
	});
});




