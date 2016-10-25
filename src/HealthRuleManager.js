var async 	= require("async");
var log4js 	= require('log4js');
var log 	= log4js.getLogger("HealthRuleManager");
var xmldom 	= require('xmldom').DOMParser;
var xpath   = require('xpath');
var configManager  = require("./ConfigManager.js");
var scoreManager  = require("./ScoreManager.js");
var XMLSerializer = require('xmldom').XMLSerializer;


exports.listEnabledHealthRules = function(appID,sourceXML, callback) {
	var doc   = new xmldom().parseFromString(sourceXML, 'application/xml');
	var nodes = xpath.select("//health-rule[enabled='true']", doc);
	
	var excludes = this.listExcludes(appID,configManager.getExcludedAppHealthRules());
	var hrIncludes = configManager.getIncludedHRRules();
	
	var name;
	var hrs = [];
		
	nodes.forEach(function(node)  {
		name = node.firstChild.nextSibling.firstChild.nodeValue;
		if(shouldbeIncluded(hrIncludes,name)){
			if(excludes){
				if(!name.match(excludes)){
					hrs.push(name);
				}
			}else{ 	
				hrs.push(name);
			}
		}
	});
	callback(hrs);
}

exports.listExcludes = function(appID,excludes){
	if(!excludes){
		return null;
	}
	
	var search = null;
	for(var pos=0; pos < excludes.length; pos++){
		var rec = excludes[pos];
		if(parseInt(rec.appid) == parseInt(appID)){
			search = rec;
			break;
		} 
	}
	
	if(search){
		return search.match;
	}
	return null;
}

shouldbeIncluded = function (inclusions,name){
	if(!inclusions || inclusions.length == 0){
		return true;
	}
	
	match = false;
	inclusions.forEach(function (po){
		if(name.match(po)){
			match = true;
		}
	});
	
	return match;
}

exports.test_shouldbeIncluded = function (inclusions,name){
	return shouldbeIncluded(inclusions,name);
}

exports.changeScore = function(appid,newscore_id,xml,callback){
	
	exports.listEnabledHealthRules(appid,xml,function(enabledHealthRules){
		var configScore = scoreManager.getAppScoreRecord(enabledHealthRules);
		var serializer = new XMLSerializer();
		var doc   = new xmldom().parseFromString(xml, 'application/xml');
		if(configScore){
			var nodes = xpath.select("//health-rule[name='"+configScore.match+"']//enabled", doc);
			if(nodes){
				var hr = nodes[0];
				if(hr){
					hr.textContent = "false";
				}
			}

			var newScore = scoreManager.getAppScoreRecordById(newscore_id);
			if(newScore){
				nodes = xpath.select("//health-rule", doc);
				nodes.forEach(function(node){
					var name = node.firstChild.nextSibling.firstChild.nodeValue;
					if(name.match(newScore.hr_match)){
						var nodes = xpath.select("//health-rule[name='"+name+"']//enabled", doc);
						if(nodes){
							var hr = nodes[0];
							if(hr){
								hr.textContent = "true";
							}
						}
					}
				})
			}
		}
		callback(serializer.serializeToString(doc));	
		
	});
	
}



