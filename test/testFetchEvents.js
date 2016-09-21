var log4js 			= require('log4js');
var log 			= log4js.getLogger("testDotNet");
var assert    		= require("chai").assert;
var sinon      		= require('sinon');
var eventsManager   = require("../src/EventsManager.js");
var dbManager   	= require("../src/DBManager.js");
var gcdManager   	= require("../src/GoogleChartDataManager.js");
var dateHelper		= require("../src/DateHelper.js");

describe("Functional test of fetching events", function() {
	it('Fetch Events', function (done) {
//		eventsManager.buildSummaryRecord(110, function(summaryRecord){
//			dbManager.saveSummaryRecord(summaryRecord);
//			done();
//		})
		done();
    });
});

describe("Functional test of fetching score summary for a specific date", function() {
	it('Fetch Summary', function (done) {
		gcdManager.fetchScoreSummary("20160914",function(scoreSummary){
			log.debug(scoreSummary);
			done();
		});
    });
});



