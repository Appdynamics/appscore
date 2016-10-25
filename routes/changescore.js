var express = require('express');
var router = express.Router();

router.get('/:appid/:scoreid', function(req, res) {
	req.scoreManager.changeScore(req.params.appid,req.params.scoreid).then(function (result) {
		res.json({"result":result});
	},console.error);
});

module.exports = router;
