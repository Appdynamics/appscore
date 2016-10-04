var express = require('express');
var router = express.Router();
var dateHelper = require("../src/DateHelper.js");

router.get('/:score/:date', function(req, res) {
	
	var score  		= parseInt(req.params.score);
	var selectedDate = parseInt(req.params.date);
	req.scoreManager.getAppListByScoreByDate(score,selectedDate).then(function (data) {
		res.json(data);
	},console.error);
});

module.exports = router;
