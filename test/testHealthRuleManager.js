var log4js 			= require('log4js');
var log 			= log4js.getLogger("testHealthRuleManager");
var assert    		= require("chai").assert;
var hrManager   	= require("../src/HealthRuleManager.js");
var sinon      		= require('sinon');
var fs 				= require('fs');

var sourceXMLAsString;		
var destXMLAsString;
var contains;

describe("Match Names in Health Rules", function() {
	it('Match Names', function (done) {
	
		fs.readFile('./test/samples/HealthRules_Source.xml', 'utf-8', function (err, data) {
		  	if (err) {
		  		log.debug(err);
		    	throw err;
		  	}
  			sourceXMLAsString = data;
  			
  			fs.readFile('./test/samples/HealthRules_Destination.xml', 'utf-8', function (err, data) {
  			  	if (err) {
  			    	throw err;
  			  	}
  	  			destXMLAsString = data;
  	  			
  				contains = "Appp Health";
	  			
	  			hrManager.matchNames(contains,sourceXMLAsString,destXMLAsString,function(response){
	  				//log.debug(response);
	  				done();
	  			}); 
  	  		});
  			
  			
  		});
		
		
		
    });
});
