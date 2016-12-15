var express = require('express');
var router = express.Router();

router.post('/', function(req, res) {
	var appid = parseInt(req.body.appid);
	var newscoreid = parseInt(req.body.scoreid);

	req.scoreManager.changeScore(appid,newscoreid).then(function (result) {
		res.json({"result":result});
	},console.error);
	
});

module.exports = router;
