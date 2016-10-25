var express = require('express');
var router = express.Router();

router.get('/:score/:maxincidents/:startdate/:enddate', function(req, res) {
	
	var startdate 	= req.params.startdate;
	var enddate   	= req.params.enddate;
	
	req.scoreManager.getAppsForDowngrade(parseInt(req.params.score),parseInt(req.params.maxincidents),parseInt(startdate),parseInt(enddate)).then(function (data) {
		res.json(data);
	},console.error);
});

module.exports = router;
