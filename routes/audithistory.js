var express = require('express');
var router = express.Router();

router.get('/applicationChanges/:date', function(req, res) {
	
	var selectedDate = parseInt(req.params.date);
	req.scoreManager.getAppListChangesByDate(selectedDate).then(function (data) {
		res.json(data);
	},console.error);
});

router.get('/loginTrend/:date', function(req, res) {
	req.scoreManager.getLoginTrend(parseInt(req.params.date)).then(function (data) {
		res.json(data);
	},console.error);
});

router.get('/appTimeline/:appid/:date', function(req, res) {
	req.scoreManager.getAppChangesByDate(parseInt(req.params.appid),parseInt(req.params.date)).then(function (data) {
		res.json(data);
	},console.error);
});

router.get('/applicationChanges/:appid/:date', function(req, res) {
	
	req.scoreManager.getAppChangesDetailByDate(parseInt(req.params.appid),parseInt(req.params.date)).then(function (data) {
		res.json(data);
	},console.error);
});

module.exports = router;
