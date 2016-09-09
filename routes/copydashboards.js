var express = require('express');
var router = express.Router();
var config = require('../config.json');

router.post('/', function(req, res) {
	
	var template = req.body[0];
	var application = req.body[1];
	var dashboardName = req.body[2];
	
	req.appConfigManager.postDashBoard(template.dashid,application.id,application.name,dashboardName,function(results){
		res.send("Dashboard Copied Successfully");
	});
	
	
});

module.exports = router;
