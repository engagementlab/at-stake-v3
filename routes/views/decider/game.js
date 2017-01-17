'use strict';
/**
 * @Stake v3
 * Developed by Engagement Lab, 2016
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

    locals.viewType = 'decider';
    locals.section = 'game';

    // Enable debugging on staging only
    if(req.params.debug === 'debug' && process.env.NODE_ENV !== 'production')
        locals.debug = true;

    view.on('init', function(next) {

      GameSession.model.findOne({accessCode: req.params.accesscode.toUpperCase()}, function (err, game) {

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

        next();

      });

    });

    // Render the view
    view.render('decider/waiting');

};