var express = require('express');
var router = express.Router();

router.get('/:score/:startdate/:enddate', function(req, res) {
	
	var startdate 	= req.params.startdate;
	var enddate   	= req.params.enddate;
	
	req.scoreManager.getAppsForUpgrade(parseInt(req.params.score),parseInt(startdate),parseInt(enddate)).then(function (data) {
		res.json(data);
	},console.error);
});

module.exports = router;
