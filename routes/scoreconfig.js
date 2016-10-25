var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
	res.json(req.scoreManager.getScoreConfig());
});

module.exports = router;
