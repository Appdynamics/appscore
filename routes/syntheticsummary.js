var express = require('express');
var router = express.Router();

router.get('/:startdate/:enddate', function(req, res) {
	var startdate 	= parseInt(req.params.startdate);
	var enddate   	= parseInt(req.params.enddate);
    req.syntheticManager.getSummaryJobPageReport(startdate,enddate).then(function (data) {
		res.json(data);
	},console.error);
});

module.exports = router;
