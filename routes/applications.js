var express = require('express');
var router = express.Router();
var config = require('../config.json');

router.get('/', function(req, res) {
	
	var allApp = 
	{
			"description": "",
			"id": 0,
			"name": "<All Applications>"
	};
	
	req.restManager.getAppJson(function(result){
		result.push(allApp);
		res.json(result);
	});
	
});

module.exports = router;
