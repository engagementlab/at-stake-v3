'use strict';
/**
 * @Stake server
 * Developed by Engagement Lab, 2015-19
 * ==============
 * App start
 *
 * @author Johnny Richardson
 *
 * ==========
 */

// Load .env vars
if(process.env.NODE_ENV !== 'test')
	require('dotenv').config();

const winston = require('winston'),
path = require('path'),
merge = require('merge'), 
bodyParser = require('body-parser'),
handlebars = require('express-handlebars'),
elHbs = require('el-hbs')(),

logFormat = winston.format.combine(
winston.format.colorize(),
	winston.format.timestamp(),
	winston.format.align(),
	winston.format.printf((info) => {
		const {
		timestamp, level, message, ...args
		} = info;

		const ts = timestamp.slice(0, 19).replace('T', ' ');
		return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
	}),
);
global.logger = winston.createLogger({
	level: 'info',
	format: logFormat,
	transports: [
		new winston.transports.Console()
	]
});

	const bootstrap = require('@engagementlab/el-bootstrapper'), express = require('express'), app = express();
	// for parsing application/json
	app.use(bodyParser.json()); 
	
	// for parsing application/xwww-
	app.use(bodyParser.urlencoded({ extended: true })); 

	var hbsInstance = handlebars({
											layoutsDir: 'templates/layouts/',
											partialsDir: 'templates/partials/',
											defaultLayout: 'base',
											helpers: merge(require('./templates/helpers')(), elHbs),
											extname: '.hbs'
										});

	app.engine('hbs', hbsInstance);
	app.set('view engine', 'hbs');
	app.set('views', path.join(__dirname, '/templates/views'));

	bootstrap.start(
		'./config.json', 
		app,
		__dirname + '/', 
		{
			'name': '@Stake CMS',

			// Setup SASS and Handlebars
			'sass': ['public'],
			'static': ['public'],
			'view engine': 'handlebars',
			'handlebars': hbsInstance,
			'custom engine': hbsInstance.engine,
		},
		() => {
			
			app.listen(process.env.PORT);
	
			var mongoose = require('mongoose');
			mongoose.connect('mongodb://localhost/at-stake', {useNewUrlParser: true, useUnifiedTopology: true});
			var db = mongoose.connection;
			db.on('error', console.error.bind(console, 'connection error:'));
	
		}
	);