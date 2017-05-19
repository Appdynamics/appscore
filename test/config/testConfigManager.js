var log4js 			= require('log4js');
var log 			= log4js.getLogger("testConfigManager");
var assert    		= require("chai").assert;
var configManager  	= require("../../src/ConfigManager.js");

describe("Test Config Manager", function() {
	it('Test Flags', function (done) {
        console.log(configManager.isScoreMenuEnabled());
		done();
   });
});
