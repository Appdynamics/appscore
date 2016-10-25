var express = require('express');
var router = express.Router();

router.get('/:date', function(req, res) {
	
	var selectedDate = parseInt(req.params.date);
	req.scoreManager.getAppListIncidentsByDate(selectedDate).then(function (data) {
		res.json(data);
	},console.error);
});

module.exports = router;
