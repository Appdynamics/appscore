var express = require('express');
var router = express.Router();
var dateHelper = require("../src/DateHelper.js");

router.get('/:appid/:date', function(req, res) {
	
	var appid  		= parseInt(req.params.appid);
	var selectedDate = parseInt(req.params.date);
	req.scoreManager.getScoreByDate(appid,selectedDate).then(function (data) {
		res.json(data);
	},console.error);
});

module.exports = router;
