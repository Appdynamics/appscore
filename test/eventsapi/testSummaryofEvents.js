var log4js 			= require('log4js');
var log 			= log4js.getLogger("testFetchHealthRulesForApplication");
var assert    		= require("chai").assert;
var eventsManager  	= require("../../src/EventsManager.js");
var hrManager  		= require("../../src/HealthRuleManager.js");
var fs 				= require('fs');
var testJSON        = require("./hrviolations1.json");


describe("Test EventsManager", function() {
	it('Test Summary Counts', function (done) {
		
		//load up the test 
		fs.readFile('./test/eventsapi/healthrules1.xml', 'utf-8', function (err, xmlHealthRules) {
		  	if (err) {
		  		log.debug(err);
		    	throw err;
		  	}
  			hrManager.listEnabledHealthRules(0,xmlHealthRules, function(list){
  				eventsManager.summaryCounts(list,testJSON,function(rec){
  					assert.equal(0,rec.summary[0].count)
  					assert.equal(0,rec.summary[1].count)
  					assert.equal(2,rec.summary[2].count)
  					assert.equal(0,rec.summary[3].count)
  					assert.equal(0,rec.summary[4].count)
  					assert.equal(0,rec.summary[5].count)
  					assert.equal(0,rec.summary[6].count)
  					assert.equal(2,rec.summary[7].count)
  					
  					assert.equal(4,rec.incidents)
  					done();
  				})
  			});
  		});
    });
});

