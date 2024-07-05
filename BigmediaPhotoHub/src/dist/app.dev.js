"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// Creating context should go first, so all modules can use it
var config = require('./config');

var express = require('express');

var logger = require('morgan');

var bodyParser = require('body-parser');

var syswidecas = require('syswide-cas');

var path = require('path');

if (!Object.entries) require('object.entries').shim(); // Redis temporary disabled

var Redis = require('ioredis');

var router = new express.Router();

if (config.get('REDIS')) {
  var redis = new Redis(config.get('REDIS'));
} else {
  console.warn('No redis in config, no local cache');
} // Our middleware, 401 and 404


function notFound(req, res, next) {
  next(Error(404));
}

var NumericErrors = {
  '400': 'Bad Request',
  '401': 'Authorization Required',
  '403': 'Permission Denied',
  '404': 'Not Found'
};
var NUMERIC_RE = /^\d\d\d:/;

function handleError(err, req, res, next) {
  err = typeof err === 'string' && NUMERIC_RE.test(err) ? {
    message: err.slice(4).trim,
    status: Number(err.slice(0, 3))
  } : typeof err === 'string' ? {
    message: err,
    status: 400
  } : typeof err === 'number' ? {
    message: NumericErrors[err],
    status: err
  } : _typeof(err) === 'object' && err.message && err.message in NumericErrors ? {
    message: NumericErrors[err.message],
    status: Number(err.message),
    stack: err.stack
  } : _typeof(err) === 'object' && err.message && NUMERIC_RE.test(err.message) ? {
    message: err.message.slice(4).trim(),
    status: Number(err.message.slice(0, 3)),
    stack: err.stack
  } : err;

  if (String(err.status) !== '404') {
    console.error("Status: ".concat(err.status, ", Message: ").concat(err.message, ", Stack: ").concat(err.stack));
  }

  if (res.headersSent) {
    console.info('Error handler will not send responce, since headers are already sent');
    return;
  }

  res.status(err.status || 500);
  var result = app.get('env') === 'development' ? {
    message: err.message,
    error: err,
    stack: err.stack
  } : {
    message: err.message,
    error: {}
  };
  res.json(result);
} // app configuration


var app = express();
syswidecas.addCAs(path.resolve('./cert')); // app.set('views', path.join(__dirname, 'views'))
// app.set('view engine', 'jade')
// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

if (app.get('env') === 'production') {
  console.warn('production build');
} else if (app.get('env') === 'testing') {
  console.warn('testing build');
}

app.use(logger('tiny'));
app.use(bodyParser.json({
  limit: '1mb'
}));
app.use(bodyParser.urlencoded({
  limit: '1mb',
  extended: false
}));
app.use('/photohub/face/:faceId', require('./proxies/face'), require('./proxies'));
app.use('/photohub/photo/:photoId', require('./proxies/photo'), require('./proxies'));
app.use('/photohub/service/:serviceId', require('./proxies/service'), require('./proxies'));
app.use('/photohub/doors/:doorsNo', require('./proxies/doors'), require('./proxies'));
app.use('/photohub/getphoto/:sideId', require('./proxies/getphoto'), require('./proxies'));
app.use('/photohub/getschema/:sideId', require('./proxies/getschema'), require('./proxies'));
app.use('/photohub/detface', require('./routes/present'));
app.use('/photohub/detside', require('./routes/presentsn'));
app.use('/photohub', require('./routes')); // app.use('/', api)

app.use(notFound);
app.use(handleError);
process.on('unhandledRejection', function (e) {
  console.error('unhandledRejection', e);
});
process.on('uncaughtException', function (e) {
  console.error('uncaughtException', e);
});
module.exports = app;