'use strict';
/**
 * @Stake v3
 * Developed by Engagement Lab, 2016-2017
 * ==============
 * Decider's game view controller.
 *
 * Help: http://keystonejs.com/docs/getting-started/#routesviews-firstview
 *
 * @class decider
 * @static
 * @author Johnny Richardson
 *
 * ==========
 */
var keystone = require('keystone'),
  appRoot = require('app-root-path'),
  Game = require(appRoot + '/lib/GameManager'),
  GameSession = keystone.list('GameSession'),
  Deck = keystone.list('Deck');

var GameManager = require(appRoot + '/lib/GameManager'), 
    Session = require('learning-games-core').SessionManager;
    
exports = module.exports = function(req, res) {

    var view = new keystone.View(req, res);
    var locals = res.locals;
    let accessCode = req.params.accesscode.toUpperCase();

    locals.section = 'game-preloaded';

    // Save host to allow path specification for socket.io
    locals.socketHost = (process.env.NODE_ENV === 'staging') ? 'qa.atstakegame.com' : req.headers.host;

    // Enable debugging on staging only
    if(req.query.debug !== undefined && process.env.NODE_ENV !== 'production') {
        locals.debug = true;
        accessCode = 'TEST';
    }

    view.on('init', function(next) {

      GameSession.model.findOne({accessCode: accessCode}, function (err, game) {

        // If session does not exist, create it; otherwise, flag current one as restarting
        let sesh = Session.Get(game.accessCode);
        if(!sesh) {
          Session.Create(game.accessCode, new GameManager(game));
          sesh = Session.Get(game.accessCode);
        }
        else
          sesh.SetToRestarting();

        locals.game = game;
        locals.gameConfig = sesh.GetConfig();
        locals.accessCode = game.accessCode;

        if(locals.debug)
          locals.gameScreens = sesh.GetAllScreens();

        next();

      });

    });

    // Render the view
    view.render('game/player');

};