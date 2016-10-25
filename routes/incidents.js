var express = require('express');
var router = express.Router();

router.get('/:date', function(req, res) {
	req.scoreManager.getIncidentTrend(parseInt(req.params.date)).then(function (data) {
		res.json(data);
	},console.error);
});

module.exports = router;
