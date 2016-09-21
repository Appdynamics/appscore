var log4js = require('log4js');
var log = log4js.getLogger("DBManager");
var monk = require('monk');
var Q = require('q');
require('q-foreach')(Q);
var configManager = require("./ConfigManager.js");

var db = monk(configManager.getConfig().dbhost+":"+configManager.getConfig().dbport+'/'+configManager.getConfig().dbname);
var dbSummary = db.get("summary");
dbSummary.index("date appid score appname", { unique: true });

exports.saveSummaryRecord = function(summaryRecord){
	dbSummary.insert(summaryRecord);
}

exports.getScoreSummaryByDate = function(date){
	var deferred = Q.defer();
	dbSummary.find({ "date":date}, function (err, appRecords) {
		if(err){
			deferred.reject(err);
		}else{
			deferred.resolve(appRecords[0]);
		}
	});
	return deferred.promise;
}
