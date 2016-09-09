var express = require('express');
var router = express.Router();
var config = require('../config.json');

router.post('/', function(req, res) {
	
	var template = req.body[0];
	var application = req.body[1];
	var overwrite   = req.body[2];
	var copy        = req.body[3];
	var contains    = req.body[4];
	
	if(application.id == 0){
		req.appConfigManager.postHealthRulesToAllApps(template.appid,overwrite == 'true',copy=='true',contains,function(results){
			res.send("Health Rules Copied Successfully");
		});
	}else{
		req.appConfigManager.postHealthRules(template.appid,application.id,overwrite == 'true',copy=='true',contains,function(results){
			res.send("Health Rules Copied Successfully");
		});
	}
	
});

module.exports = router;
