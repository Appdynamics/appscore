var log4js 			= require('log4js');
var log 			= log4js.getLogger("testFetchHealthRulesForApplication");
var assert    		= require("chai").assert;
var fs 				= require('fs');
var scoreManager  	= require("../../src/ScoreManager.js");
var hrManager  		= require("../../src/HealthRuleManager.js");
var config			= require('../../config.json');


describe("Test App Scoring", function() {
	it('Match Score based on which Health Rule is enabled - Sample 1', function (done) {
		fs.readFile('./test/score/appscorehealthrules1.xml', 'utf-8', function (err, xml) {
		  	if (err) {
		  		log.debug(err);
		    	throw err;
		  	}
  			
  			hrManager.listEnabledHealthRules(0,xml, function(list){
  				var scoreId = scoreManager.getAppScore(list);
  				assert.equal(1,scoreId);
  				done();
  			});
  			
  		});
    });
	
	it('Match Score based on which Health Rule is enabled - Sample 2', function (done) {
		fs.readFile('./test/score/appscorehealthrules2.xml', 'utf-8', function (err, xml) {
		  	if (err) {
		  		log.debug(err);
		    	throw err;
		  	}
  			
  			hrManager.listEnabledHealthRules(0,xml, function(list){
  				var scoreId = scoreManager.getAppScore(list);
  				assert.equal(1,scoreId);
  				done();
  			});
  			
  		});
    });
	
	it('Update XML Even when all Health Rules are disabled - Sample 3', function (done) {
		fs.readFile('./test/score/appscorehealthrules3.xml', 'utf-8', function (err, xml) {
		  	if (err) {
		  		log.debug(err);
		    	throw err;
		  	}
  			
  			hrManager.changeScore(110,3,xml, function(xml){
  				
  				hrManager.listEnabledHealthRules(110,xml,function(list){
  					var scoreId = scoreManager.getAppScore(list);
  					assert.equal(3,scoreId);
  					done();
  				})
  			});
  		});
    });
	
});



