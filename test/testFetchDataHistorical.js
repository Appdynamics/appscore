var log4js = require('log4js');
var assert = require("chai").assert;
var sinon = require('sinon');
var fetchData = require('../src/SyntheticFetchDataMainProcess')
var restManager = require('../src/RestManager')

describe("Test Fetch Process Data", function () {
	it('Test Fetch Process', function (done) {
		restManager.establishJSessionID(function(results){
			console.log("jsession : "+results);
			done();	
		})
	});
	

});

