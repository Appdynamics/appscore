var log4js 			= require('log4js');
var log 			= log4js.getLogger("testScoreManager");
var assert    		= require("chai").assert;
var sinon      		= require('sinon');
var scoreManager	= require("../src/ScoreManager.js");

scoreManager.changeScore(77,2).then(function (result) {
	console.log(result);
	done();
});