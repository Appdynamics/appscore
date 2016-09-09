var log4js 			= require('log4js');
var log 			= log4js.getLogger("testDotNet");
var assert    		= require("chai").assert;
var appConfigManager   	= require("../src/AppConfigManager.js");
var sinon      		= require('sinon');
var dashBoardSample = require('./samples/DotNetSample1.json');
var jp 				= require('jsonpath');

var dashBoardName   = "App2 - Operations";
var appName 		= "App2";

describe("Functional Testing replacing the dashboard name", function() {
	it('Change dashboard name', function (done) {
		
		appConfigManager.updateDashboard(dashBoardSample,dashBoardName,appName,20);
		
		assert.equal(dashBoardSample.name,dashBoardName);
		//log.debug(JSON.stringify(dashBoardSample,null, 4));

		done();
    });
});

describe("Functional Testing replacing the application names on the fly", function() {
	it('Change application name', function (done) {
		
		appConfigManager.updateDashboard(dashBoardSample,dashBoardName,appName,20);
		
		var nodes = jp.apply(dashBoardSample, '$..applicationName', function(value) { 
			assert.equal(value, appName);
			return value; 
		});
				
		//log.debug(JSON.stringify(dashBoardSample,null, 4));
		
		done();
    });
});

describe("Functional Testing replacing the deep URL on the fly", function() {
	it('Change application id', function (done) {
		
		appConfigManager.updateDashboard(dashBoardSample,dashBoardName,appName,20);
		
		var nodes = jp.apply(dashBoardSample, '$..drillDownUrl', function(value) { 
			if (value){
				assert.isTrue(value.indexOf("application=20") > 0);
			}
			return value; 
		});
				
		//log.debug(JSON.stringify(dashBoardSample,null, 4));
		
		done();
    });
});
