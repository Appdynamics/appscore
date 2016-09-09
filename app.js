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
var appConfigManager = require('./src/AppConfigManager.js');
var templates = require('./routes/templates.js');
var appJson = require('./routes/applications.js');
var copyhealthrules = require('./routes/copyhealthrules.js');
var copydashboards = require('./routes/copydashboards.js');

var log = log4js.getLogger("app");
var app = express();


var init = function(){
	//todo
}()

app.use(function(req,res,next){
    req.restManager = restManager;
    req.appConfigManager = appConfigManager;
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
app.use('/templates.json',templates);
app.use('/applications.json',appJson);
app.use('/copyhealthrules',copyhealthrules);
app.use('/copydashboards',copydashboards);

app.use('/', routes);

app.get('/apps.html', function(req, res) {
	res.render('apps');
});

app.get('/deploy.html', function(req, res) {
	res.render('deploy');
});

app.get('/deployhelp.html', function(req, res) {
	res.render('deployhelp');
});

app.get('/appgrades.html', function(req, res) {
	res.render('appgrades');
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
	  console.log("shutting down");
});

module.exports = app;
