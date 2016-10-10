var express = require('express');
var router = express.Router();

router.get('/:appid/:date', function(req, res) {
	req.scoreManager.getAppTimelineByDate(parseInt(req.params.appid),parseInt(req.params.date)).then(function (data) {
		res.json(data);
	},console.error);
});

module.exports = router;
