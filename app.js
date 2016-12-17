var log4js = require('log4js');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var config = require('./config.json');

var schedule = require('node-schedule');
var childProcess = require("child_process");
var fs = require('fs');
var config = require("./config.json");
var moment = require("moment");

var restManager = require('./src/RestManager.js');
var scoreManager = require('./src/ScoreManager.js');
var appScoreRoute = require('./routes/appscore.js');
var appScoreByDateRoute = require('./routes/appscorebydate.js');
var appListByScoreByDateRoute = require('./routes/applistbyscorebydate.js');
var appListIncidentsByDateRoute = require('./routes/applistincidentsbydate.js');
var appTimeline = require('./routes/apptimeline.js');
var appHRSummary = require('./routes/apphrsummary.js');
var incidents = require('./routes/incidents.js');
var audithistory = require('./routes/audithistory.js');
var downgradeRoute = require('./routes/downgrade.js');
var scoreConfigRoute = require('./routes/scoreconfig.js');

var log = log4js.getLogger("app");
var app = express();

var batchJob;

var init = function(){
	//todo
	batchJob = childProcess.fork("./src/NightlyFetchDataJob.js");
	batchJob.send({"name":"fetch data"});
	
}()

app.use(function(req,res,next){
    req.restManager = restManager;
    req.scoreManager = scoreManager;
    next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/public/images/*', function (req,res)
{
    res.sendFile (__dirname+req.url);
});

app.use(express.static(__dirname + '/public/images'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use('/appscore',appScoreRoute);
app.use('/appscorebydate',appScoreByDateRoute);
app.use('/applistbyscorebydate',appListByScoreByDateRoute);
app.use('/apptimeline',appTimeline);
app.use('/apphrsummary',appHRSummary);
app.use('/incidents',incidents);
app.use('/audithistory',audithistory);
app.use('/appincidents',appListIncidentsByDateRoute);
app.use('/downgrade',downgradeRoute);
app.use('/scoreconfig',scoreConfigRoute);

app.use('/', routes);

app.get('/appgrades.html', function(req, res) {
	res.render('appgrades');
});

app.get('/appscore.html', function(req, res) {
	res.render('appscore');
});

app.get('/incidents.html', function(req, res) {
	res.render('incidents');
});

app.get('/auditreport.html', function(req, res) {
    res.render('auditreport');
});

app.get('/downgrade.html', function(req, res) {
	res.render('downgrade');
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
    	log.error("Something went wrong:", err);
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

app.use(function(err, req, res, next) {
	log.error("Something went wrong:", err);
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


process.on('exit', function() {
	batchJob.close();
	console.log("shutting down");
});

module.exports = app;
