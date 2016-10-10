var express = require('express');
var router = express.Router();

router.get('/:appid/:date', function(req, res) {
	
	var appid  		= parseInt(req.params.appid);
	var date = parseInt(req.params.date);
	req.scoreManager.getHRSummary(appid,date).then(function (data) {
		console.log(JSON.stringify(data));
		res.json(data);
	},console.error);
});

module.exports = router;
