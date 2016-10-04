var express = require('express');
var router = express.Router();
var dateHelper = require("../src/DateHelper.js");

router.get('/:date', function(req, res) {
	
	var selectedDate = parseInt(req.params.date);
	req.scoreManager.getAppSummaryByDate(selectedDate).then(function (data) {
		var result = {};
		result.data = JSON.stringify(data);
		res.json(result);
	},console.error);
});

module.exports = router;
