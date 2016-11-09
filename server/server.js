'use strict';

require('events').EventEmitter.prototype._maxListeners = 100;
var express = require('express');
var bodyParser = require('body-parser');
var formidable = require('express-formidable');

var argv = require('optimist').argv

var Api = require('./api')
var Game = require('./game')

var app = express();
app.use(formidable()); // support form-data encoded bodies
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var game = new Game()
var api = new Api(app, game)

var listenPort = 3000
if (argv.p && argv.p == argv.p % 0xFFFF)
	listenPort = argv.p


app.listen(listenPort, function () {
  console.log('Example app listening on port', listenPort);
});

module.exports = app;
