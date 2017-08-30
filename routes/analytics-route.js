var express = require('express');
var router = express.Router();

router.post('/', function(req, res) {
	var parms = req.body;
	var query = parms.query;
	var start = parseInt(parms.start);
	var end   = parseInt(parms.end);
	var limit     = parseInt(parms.limit);

	req.analyticsManager.query(query,start,end,limit).then(function (data) {
		res.json(data);
	},console.error);


});



module.exports = router;
