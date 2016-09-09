var async 	= require("async");
var log4js 	= require('log4js');
var log 	= log4js.getLogger("HealthRuleManager");
var xmldom 	= require('xmldom').DOMParser;


exports.matchNames = function(containsText,sourceXML,destinationXML,callback) {
	var srcDoc 	= new xmldom().parseFromString(sourceXML, 'application/xml');
	var destDoc = new xmldom().parseFromString(destinationXML, 'application/xml');
	
	//get all names
	var destNames = [];
	var thishr;
	hrs = destDoc.getElementsByTagName('health-rule');	
	for (hr in hrs) {
		thishr = hrs[hr];
		if(thishr.childNodes && thishr.childNodes.length > 1){
			log.debug(thishr.firstChild.nodeValue);
		}
	  }
	
//	nodes.forEach(function(node){
//		log.debug(node.nodeValue);
//	});
	
	//then cycle through srcDoc
		//if match on name then set to last match
	
	//convert srcDoc to string and return
	
	callback(sourceXML);
}






