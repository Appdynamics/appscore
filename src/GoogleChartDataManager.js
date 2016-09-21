var log4js 		= require('log4js');
var log 		= log4js.getLogger("GoogleChartDataManager");
var dateHelper 	= require("./DateHelper.js");
var dbManager	= require("./DBManager.js");

exports.fetchScoreSummary = function(date,callback){
	var prevDate = dateHelper.getPreviousDateAsNumber(date);
	dbManager.getScoreSummaryByDate(date,function(records){
		//build the summary table;
		callback(records);
	});
}

