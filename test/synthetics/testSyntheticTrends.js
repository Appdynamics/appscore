var log4js 			 = require('log4js');
var log 			 = log4js.getLogger("testTrendSetup");
var assert    		 = require("chai").assert;
var syntheticManager = require("../../src/SyntheticManager.js");
var syntheticTrendManager = require("../../src/SyntheticTrendManager.js");
var dateHelper       = require("../../src/DateHelper.js");
var configManager    = require("../../src/ConfigManager.js");
var pagedata1        = require("./pagedata1.json");
var pagedata2        = require("./pagedata2.json");
var trenddata        = require("./trenddata.json");

describe("Functional Query Test", function() {
	//compare key metrics
        //what are the key metrics
            //onload
            //dom ready time
            //first byte
            //Failure Rate/Normal Rate
            //BT time
                //- Sub Trends
            //Availability
            //end user response time
            //external resources max time
                //- Sub Trends
    
   it('Testing hour of day query', function (done) {
        var trendRange = configManager.getTrendDateRange();
        var dates = dateHelper.getDatesAsMillisecondsBasedOnRange(trendRange);
		// syntheticManager.getSummaryJobMetricsByHour(dates.startdate,dates.enddate,10).then(function(results){
        //     //just check that we get results.
        //     assert(results);
             done();    
        // });
    }); 
	
});

describe("Test Trends : ", function() {
	//compare key metrics
        //what are the key metrics
            //onload
            //dom ready time
            //first byte
            //Failure Rate/Normal Rate
            //BT time
                //- Sub Trends
            //Availability
            //end user response time
            //external resources max time
                //- Sub Trends

   beforeEach(function() {
        pagedata1.onload = 0;
        pagedata1.domready = 0;
        pagedata1.firstbyte = 0;
        pagedata1.startrender = 0;
   });
    
   it('Test onload No Trends', function (done) {
		syntheticTrendManager.compareTrend(trenddata,pagedata1,function(results){
            assert(results.length == 0);
            done();
        });
    }); 

   it('Test onload Trend', function (done) {
        pagedata1.onload = 35000;
        syntheticTrendManager.compareTrend(trenddata,pagedata1,function(results){
            assert(results.length == 1);
            var rec = results[0];
            assert(rec.jobname == pagedata1.jobname);
            assert(rec.pagename == pagedata1.pagename);
            assert(rec.time == pagedata1.time);
            assert(rec.metricname == 'onload');
            assert(rec.metricvalue == pagedata1.onload);
            done();
        });
    }); 

    it('Test domready Trend', function (done) {
        pagedata1.domready = 10000;
        syntheticTrendManager.compareTrend(trenddata,pagedata1,function(results){
            assert(results.length == 1);
            var rec = results[0];
            assert(rec.jobname == pagedata1.jobname);
            assert(rec.pagename == pagedata1.pagename);
            assert(rec.time == pagedata1.time);
            assert(rec.metricname == 'drt');
            assert(rec.metricvalue == pagedata1.domready);
            done();
        });
    }); 

    it('Test domready Trend', function (done) {
        pagedata1.firstbyte = 10000;
        syntheticTrendManager.compareTrend(trenddata,pagedata1,function(results){
            assert(results.length == 1);
            var rec = results[0];
            assert(rec.jobname == pagedata1.jobname);
            assert(rec.pagename == pagedata1.pagename);
            assert(rec.time == pagedata1.time);
            assert(rec.metricname == 'firstbyte');
            assert(rec.metricvalue == pagedata1.firstbyte);
            done();
        });
    }); 

    it('Test startrender Trend', function (done) {
        pagedata1.startrender = 10000;
        syntheticTrendManager.compareTrend(trenddata,pagedata1,function(results){
            assert(results.length == 1);
            var rec = results[0];
            assert(rec.jobname == pagedata1.jobname);
            assert(rec.pagename == pagedata1.pagename);
            assert(rec.time == pagedata1.time);
            assert(rec.metricname == 'startrender');
            assert(rec.metricvalue == pagedata1.startrender);
            done();
        });
    }); 

    it('Test availability Trend', function (done) {
        pagedata1.availability = 10000;
        syntheticTrendManager.compareTrend(trenddata,pagedata1,function(results){
            assert(results.length == 1);
            var rec = results[0];
            assert(rec.jobname == pagedata1.jobname);
            assert(rec.pagename == pagedata1.pagename);
            assert(rec.time == pagedata1.time);
            assert(rec.metricname == 'startrender');
            assert(rec.metricvalue == pagedata1.startrender);
            done();
        });
    }); 

});


