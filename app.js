// Return server object
var serverStart = function() {

  /* Global accessor for logger  */
  logger = require('winston');
	
	var express = require('express');
	var app = express();

	 // support json encoded bodies
	var bodyParser = require('body-parser');
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));

	// Enable view template compilation caching
	app.enable('view cache');

	return app;

};

// Any custom app initialization logic should go here
var appStart = function(app) {
	
	var keystone = require('keystone'),
			appServer = keystone.get('appServer'),
			rootDir = require('app-root-path');

	var io = require(rootDir + '/sockets/')(appServer);

};

module.exports = function(frameworkDir, shared) {

	// Add main dependencies and EL web framework dependencies if not mounted with EL framework API
	// if(!shared)
	require('app-module-path').addPath(frameworkDir + '/node_modules'); 
	
	// Obtain app root path and set as keystone's module root
	var keystoneInst = require('keystone');
	

	return { 

		keystone: keystoneInst,
		server: serverStart,
		start: appStart	

	}

};