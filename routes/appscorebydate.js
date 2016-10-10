var express = require('express');
var router = express.Router();

router.get('/:score/:date', function(req, res) {
	req.scoreManager.getScoreByDate(parseInt(req.params.score),parseInt(req.params.date)).then(function (data) {
		res.json(data);
	},console.error);
});

module.exports = router;
