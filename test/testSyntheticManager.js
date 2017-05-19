var log4js 			= require('log4js');
var log 			= log4js.getLogger("testSyntheticManager");
var assert    		= require("chai").assert;
var sinon      		= require('sinon');
var manager	        = require("../src/SyntheticManager.js");
var dateHelper	 	= require("../src/DateHelper.js");

describe("Functional Testing of Synthetic Manager", function() {
	// it('Test Fetch Synthetic Record By ID', function (done) {
	// 	manager.getSyntheticRecordById("5900d21b56216e7fdc4135c3").then(function (result) {
	// 		console.log(result);
	// 		done();
	// 	});
	// });

	it('Test Update Url', function (done) {

		var dataRec = {};
		dataRec.scheduleId = "bc5a0054-fde9-4c1c-b05a-0747cf2925d2";
		dataRec.syntheticid= "bc5a0054-fde9-4c1c-b05a-0747cf2925d2~f6f0bb4c-cfba-4846-bfd0-08abd9da45c7";
		dataRec.appid = 3733;
		
		manager.updateSyntheticSnapshotUrl(dataRec);

		assert.isTrue(dataRec.syntheticSnapshotUrl.includes("/#/location=EUM_SYNTHETIC_SESSION_DETAILS&timeRange=last_15_minutes.BEFORE_NOW.-1.-1.15&application=3733&gridFilters=scheduleId%253Abc5a0054-fde9-4c1c-b05a-0747cf2925d2&analyticsDashId=317&synthMeasurementId=bc5a0054-fde9-4c1c-b05a-0747cf2925d2~f6f0bb4c-cfba-4846-bfd0-08abd9da45c7"));

		done();
	});


	it('Test Fetch Quick Trend Report Summary', function (done) {
		var dateRec = dateHelper.getDatesAsMillisecondsBasedOnRange(10);
		manager.getSyntheticQuickTrendReport("job-prod-ha-alaska",dateRec.startdate,dateRec.enddate).then(function (result) {
			var page = result[0].pagemetrics[0];
			page.job = result[0]._id.job;

			console.log(JSON.stringify(page));

			manager.getSyntheticPageTrendReport(dateRec.startdate,dateRec.enddate,page).then(function(result){
				console.log(JSON.stringify(result));
				done();
			});		
		});
	});

});