var log4js = require('log4js');
var assert = require("chai").assert;
var sinon = require('sinon');
var fetchData = require('../src/SyntheticFetchDataMainProcess')
var restManager = require('../src/RestManager')


		restManager.establishJSessionID(function(results){
			console.log(JSON.stringify(results));
		
		})

