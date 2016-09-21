var log4js 			= require('log4js');
var log 			= log4js.getLogger("testFetchHealthRulesForApplication");
var assert    		= require("chai").assert;
var eventsManager  	= require("../../src/EventsManager.js");
var hrManager  		= require("../../src/HealthRuleManager.js");
var configManager 	= require("../../src/ConfigManager.js");
var fs 				= require('fs');


describe("Test returning list of enabled Health Rule Names", function() {
	it('Get health Rule Names', function (done) {
		
		fs.readFile('./test/eventsapi/healthrules1.xml', 'utf-8', function (err, data) {
		  	if (err) {
		  		log.debug(err);
		    	throw err;
		  	}
  			hrManager.listEnabledHealthRules(0,data, function(list){
  				var expected = "Business Transaction response time is much higher than normal,Business Transaction error rate is much higher than normal,CPU utilization is too high,Memory utilization is too high,JVM Heap utilization is too high,JVM Garbage Collection Time is too high,CLR Garbage Collection Time is too high,AppHealth - A Score";
  				var result = list.join(",").toString();
  				assert.equal(expected,result,"List of Health Rules are not the same");
  				done();
  			});
  			
  		});
    });
});

describe("Test returning list of enabled Health Rule Names - Exclusions", function() {
	it('Get health Rule Names - Ignore Exclusions', function (done) {
		
		fs.readFile('./test/eventsapi/healthrules1.xml', 'utf-8', function (err, data) {
		  	if (err) {
		  		log.debug(err);
		    	throw err;
		  	}
  			
  			hrManager.listEnabledHealthRules(100,data, function(list){
  				var expected = "Business Transaction response time is much higher than normal,Business Transaction error rate is much higher than normal,CPU utilization is too high,Memory utilization is too high,JVM Heap utilization is too high,JVM Garbage Collection Time is too high,CLR Garbage Collection Time is too high,AppHealth - A Score";
  				var result = list.join(",").toString();
  				assert.equal(expected,result,"List of Health Rules are not the same");
  				done();
  			});
  			
  		});
    });
});

describe("Test Exclusions", function() {
	it('Verify exclusions are being picked up', function (done) {
		var excludeString = hrManager.listExcludes(100,configManager.getExcludedAppHealthRules());
		var expected = "Business Transaction response time is much higher than normal,CPU utilization is too high";
		assert.equal(expected,excludeString,"Exclusions did not work");
		done();
    });
	
	it('Verify exclusions - no valid APPID', function (done) {
		var excludeString = hrManager.listExcludes(0,configManager.getExcludedAppHealthRules());
		assert.equal(null,excludeString,"Exclusions did not work, this should not find the AppID 0");
		done();
    });
});

