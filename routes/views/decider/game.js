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
    Session = require(appRoot + '/lib/SessionManager');
    
exports = module.exports = function(req, res) {

    var view = new keystone.View(req, res);
    var locals = res.locals;

    locals.section = 'decider/game';

    // Enable debugging on staging only
    if(req.params.debug === 'debug' && process.env.NODE_ENV !== 'production')
        locals.debug = true;

    view.on('init', function(next) {

        GameSession.model.findOne({accessCode: req.params.accesscode.toUpperCase()}, function (err, gameSession) {
          
          let session = Session.Get(req.params.accesscode.toUpperCase());

          if(!session) {

            //TODO: Not in prod
            session = new Game(gameSession);
            Session.Create(gameSession.accessCode, session);

            locals.game = gameSession;
            locals.gameConfig = session.GetConfig();
          
            // console.log("Game with ID '" + req.params.accesscode.toUpperCase() + "' not found!");
            // return res.notfound('Game not found!', 'Sorry, but it looks like this game session does not exist!');  

            next();

          }
          else {

              locals.game = gameSession;
              locals.gameConfig = session.GetConfig();

              next();

          }

      });

    });

    // Render the view
    view.render('decider/game');

};