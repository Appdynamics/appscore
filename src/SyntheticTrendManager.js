var log4js = require('log4js');
var log = log4js.getLogger("SyntheticTrendManager");
log4js.configure("./log4js.json");
var dateHelper = require("./DateHelper.js");
var jsonFilter = require('json-filter');
var syntheticManager = require("./SyntheticManager.js");
var configManager = require("./ConfigManager.js");;
var metricStandardDev = configManager.getSyntheticTrendMetricDev();
var availabilityDev = configManager.getSyntheticTrendAvailabilityDev();
var lastHour;
var summaryData;


exports.init = function(callback){
    var dateRange = configManager.getTrendDateRange();
    var dates = dateHelper.getDatesAsMillisecondsBasedOnRange(dateRange);
    var hour  = dateHelper.getHourOfNow();
    syntheticManager.getSummaryJobMetricsByHour(dates.startdate,dates.enddate,hour).then(function(results){
        callback(results);
    },log.error);
}

exports.setSummaryData = function(data){
    this.summaryData = data;
}

exports.getSummaryData = function(){
    return this.summaryData;
}

exports.getLastHour = function(){
    return this.lastHour;
}

exports.setLastHour = function(_lasthour){
    this.lastHour = _lasthour;
}

process.on('message', function(msg) {
	exports.handleMessage(msg);
});

exports.handleMessage = function(pageRec){
    if(!exports.getLastHour() || (exports.getLastHour() != dateHelper.getHourOfNow())){
        log.debug("LastHour :"+lastHour+" Hour Now :"+dateHelper.getHourOfNow());
        exports.init(function(results){
            exports.setSummaryData(results);
            exports.setLastHour(dateHelper.getHourOfNow());
            exports.handlePageRec(summaryData,pageRec);    
        });
    }else{
        summaryData = exports.getSummaryData();
        if(summaryData){
            exports.handlePageRec(summaryData,pageRec);
        }
    }
}

exports.handlePageRec = function(summary,pageRec){
    exports.compareTrend(summary,pageRec,function(results){
        if(results.length >0){
            results.forEach(function(trendRec){
                syntheticManager.saveTrendRec(trendRec).then(function(data){
                    syntheticManager.sendSocketData(trendRec);
				    log.debug("saved trend record "+trendRec.desc);			
                },function (error) {
                    log.error(error);
                });
            })
        }
    });
}

exports.compareTrend = function(summary,pageDataRec,callback){
    var results = [];
    var jobPageSummaryData = exports.filter(summary,function(rec){
        return rec.jobname === pageDataRec.jobname && rec.pagename === pageDataRec.pagename;
    });

    if(jobPageSummaryData && jobPageSummaryData[0]){
        var summaryRec = jobPageSummaryData[0];
        exports.compareMetricTrend(results,summaryRec,summaryRec.onload,summaryRec.onload_std,pageDataRec,'onload',pageDataRec.onload);
        exports.compareMetricTrend(results,summaryRec,summaryRec.drt,summaryRec.drt_std,pageDataRec,'drt',pageDataRec.domready);
        exports.compareMetricTrend(results,summaryRec,summaryRec.firstbyte,summaryRec.firstbyte_std,pageDataRec,'firstbyte',pageDataRec.firstbyte);
        exports.compareMetricTrend(results,summaryRec,summaryRec.startrender,summaryRec.startrender_std,pageDataRec,'startrender',pageDataRec.startrender);
        exports.compareAvailability(results,summaryRec,pageDataRec);
    }
    callback(results);
}

exports.filter = function(data,filterFunction){
    return data.filter(filterFunction);
}

exports.compareMetricTrend = function(results,summarydata,average,stdDev,pageDataRec,metricName,metricValue){
    var threshold = average + (metricStandardDev * stdDev);

    if(metricValue > threshold){
        var description = "Metric Value > ("+metricStandardDev+" * STD Deviation) + Average => "+metricValue+" > ("+metricStandardDev+" * "+stdDev+") + "+average+" => "+metricValue+" > "+threshold;
        results.push({time:pageDataRec.time,type:'synthetic',key:pageDataRec.jobname,pagename:pageDataRec.pagename,metricname:metricName,metricvalue:metricValue,threshold:threshold,delta:'inc',desc:description});
    }
    threshold = average - (metricStandardDev * stdDev);
    if(metricValue < threshold){
        var description = "Metric Value < Average - ("+metricStandardDev+" * STD Deviation) => "+metricValue+" < "+average+" - ("+metricStandardDev+" * "+stdDev+") => "+metricValue+" < "+threshold;
        results.push({time:pageDataRec.time,type:'synthetic',key:pageDataRec.jobname,pagename:pageDataRec.pagename,metricname:metricName,metricvalue:metricValue,threshold:threshold,delta:'dec',desc:description});
    }
}

exports.compareAvailability = function(results,summaryRec,pageDataRec){
    var recAvail = pageDataRec.metrics["Availability (ppm)"];
    if(recAvail > 0 ){
        recAvail = recAvail/10000;
    }

    var description = "Current Availability :"+recAvail+" Average Availability For Last "+configManager.getTrendDateRange()+" Days :"+summaryRec.availability+" Threshold For Difference :"+availabilityDev;
    
    if(recAvail > summaryRec.availability){
        if((recAvail - summaryRec.availability) > availabilityDev){
            var threshold = summaryRec.availability + availabilityDev;
            //for now do not report on Availability.
            //results.push({time:pageDataRec.time,type:'synthetic',key:pageDataRec.jobname,pagename:pageDataRec.pagename,metricname:"availability",metricvalue:recAvail,threshold:threshold,delta:'inc',desc:description});
        }
    }
    if(recAvail < summaryRec.availability){
        if((summaryRec.availability - recAvail)> availabilityDev){
            var threshold = summaryRec.availability - availabilityDev;
            results.push({time:pageDataRec.time,type:'synthetic',key:pageDataRec.jobname,pagename:pageDataRec.pagename,metricname:"availability",metricvalue:recAvail,threshold:threshold,delta:'dec',desc:description});
        }
    }
}

