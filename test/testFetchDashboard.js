var log4js 			= require('log4js');
var log 			= log4js.getLogger("testDotNet");
var assert    		= require("chai").assert;
var appConfigManager   	= require("../src/AppConfigManager.js");
var sinon      		= require('sinon');
var dashBoardSample = require('./samples/DotNetSample1.json');
var jp 				= require('jsonpath');


var dashBoardName   = "App2 - Operations";
var appName 		= "App2";

//describe("Fetch Dashboard", function() {
//	it('Fetch Dashboard', function (done) {
//		appConfigManager.fetchDashboard("3",function(results){
//			//	log.debug(JSON.stringify(results,null, 4));
//			done();
//		});
//    });
//});


