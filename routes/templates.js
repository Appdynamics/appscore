var express = require('express');
var router = express.Router();
var config = require('../config.json');

router.get('/', function(req, res) {
	res.json(config.templates);
});

module.exports = router;
