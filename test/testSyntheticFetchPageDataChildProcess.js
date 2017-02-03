var log4js 			= require('log4js');
var log 			= log4js.getLogger("testSyntheticFetchPageDataChildProcess");
var assert    		= require("chai").assert;
var sinon      		= require('sinon');
var childProcess   	= require("../src/SyntheticFetchPageDataChildProcess.js");


describe("Test Cleaning Data", function() {
	it('Clean Resources', function (done) {
		var dataRec = {
			resources : ""
		}

		childProcess.cleanData(dataRec);
		assert.deepEqual(dataRec.resources, []);
		done();
    });
	it('Clean Resources - Missing Resources', function (done) {
		var dataRec = {
		}
		childProcess.cleanData(dataRec);
		assert.deepEqual(dataRec.resources, []);
		done();
    });
	it('Clean childBTs', function (done) {
		var dataRec = {
			childBTs : ""
		}

		childProcess.cleanData(dataRec);
		assert.deepEqual(dataRec.childBTs, []);
		done();
    });
	it('Clean childBTs - Missing childBTs', function (done) {
		var dataRec = {
		}
		childProcess.cleanData(dataRec);
		assert.deepEqual(dataRec.childBTs, []);
		done();
    });
	it('Clean childBTs - null childBTs', function (done) {
		var dataRec = {
			childBTs : null
		}
		childProcess.cleanData(dataRec);
		assert.deepEqual(dataRec.childBTs, []);
		done();
    });
	it('Clean directBTs', function (done) {
		var dataRec = {
			directBTs : ""
		}

		childProcess.cleanData(dataRec);
		assert.deepEqual(dataRec.directBTs, []);
		done();
    });
	it('Clean directBTs - Missing directBTs', function (done) {
		var dataRec = {
		}
		childProcess.cleanData(dataRec);
		assert.deepEqual(dataRec.directBTs, []);
		done();
    });
	it('Clean directBTs - null directBTs', function (done) {
		var dataRec = {
			directBTs : null
		}
		childProcess.cleanData(dataRec);
		assert.deepEqual(dataRec.directBTs, []);
		done();
    });
	
});




