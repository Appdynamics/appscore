var log4js 			= require('log4js');
var log 			= log4js.getLogger("testFetchHealthRulesForApplication");
var assert    		= require("chai").assert;
var eventsManager  	= require("../../src/EventsManager.js");
var hrManager  		= require("../../src/HealthRuleManager.js");
var configManager = require('../../src/ConfigManager');
var fs 				= require('fs');
var events        = require("./hrviolations1.json");


describe("Test EventsManager", function() {
	it('Test Summary Counts', function (done) {
		
		//load up the test 
		fs.readFile('./test/eventsapi/healthrules1.xml', 'utf-8', function (err, xmlHealthRules) {
		  	if (err) {
		  		log.debug(err);
		    	throw err;
		  	}
  			hrManager.listEnabledHealthRules(0,xmlHealthRules, function(list){
  				eventsManager.summaryCounts(list,events,true,[".NET Infra Health"],function(rec){
  					console.log(JSON.stringify(rec));
  					done();
  				})
  			});
  		});
    });
});

