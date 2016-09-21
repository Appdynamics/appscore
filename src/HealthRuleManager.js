var async 	= require("async");
var log4js 	= require('log4js');
var log 	= log4js.getLogger("HealthRuleManager");
var xmldom 	= require('xmldom').DOMParser;
var xpath   = require('xpath');
var configManager  = require("./ConfigManager.js");



exports.listEnabledHealthRules = function(appID,sourceXML, callback) {
	var doc   = new xmldom().parseFromString(sourceXML, 'application/xml');
	var nodes = xpath.select("//health-rule[enabled='true']", doc);
	
	var excludes = this.listExcludes(appID,configManager.getExcludedAppHealthRules());
	
	var name;
	var hrs = [];
		
	nodes.forEach(function(node)  {
		name = node.firstChild.nextSibling.firstChild.nodeValue;
		if(excludes){
			var excluded = name.match(excludes);
			if (!excluded || excluded.length==0){
				hrs.push(name);
			}
		}else{
			hrs.push(name);
		}
	});
	callback(hrs);
}

exports.listExcludes = function(appID,excludes){
	var excludeForApp = excludes.filter(this.filterByAppID(appID));
	if(excludeForApp.length > 0){
		return excludeForApp[0].match;
	}
	return null;
}


exports.filterByAppID = function(appID){
	return function(element) {
		if(element.appid){
			var x1 = parseInt(element.appid);
			var x2 = parseInt(appID);
			return x1 == x2;
		}
        return false;
    }
}






