var log4js 			= require('log4js');
var log 			= log4js.getLogger("testUtilityHelper");
var assert    		= require("chai").assert;
var sinon      		= require('sinon');
var utilHelper		= require("../src/UtilityHelper.js");

describe("Functional test for building the Events URL", function() {
	it('Test URL', function (done) {
		var url = utilHelper.buildViolationsUrl(143,20160930);
		assert.equal(url,"https://unitedpreprod.saas.appdynamics.com/controller/#/location=APP_INCIDENT_LIST&timeRange=Custom_Time_Range.BETWEEN_TIMES.1475297999999.1475211600000.1439&application=143");
		done();
	});
});
