var log4js 			= require('log4js');
var log 			= log4js.getLogger("testGoogleChartDataManager");
var assert    		= require("chai").assert;
var sinon      		= require('sinon');
var gcdManager   	= require("../../src/GoogleChartDataManager.js");
var sampleData1 		= require("./data1.json");

describe("Convert App Score Summary to Google Chart Data", function() {
	it('createChartDataForAggregationSummary', function (done) {
		
		var scoreSummary = gcdManager.testCreateChartDataForAggregationSummary(sampleData1);
		
		done();
    });
});



