/**
 * @Stake v3
 * Developed by Engagement Lab, 2016
 * ==============
 * Moderator view controller.
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
    randomstring = require('randomstring'),
    GameSession = keystone.list('GameSession'),
    Deck = keystone.list('Deck');

exports = module.exports = function(req, res) {
    var view = new keystone.View(req, res);
    var locals = res.locals;

    var gameCode;

    locals.viewType = 'decider';
    locals.section = 'newgame';

    function generateCode() {

        return randomstring.generate({ length: 4, charset: 'alphabetic' }).toUpperCase();
    
    }

    view.on('init', function(next) {

        gameCode = generateCode();

        // Check if there's already a game with the generated access code
        GameSession.model.findOne({accessCode: gameCode}, function (err, session) {

            // There is! A one in 15,000 probability! Make a new one
            if(session !== null)
                gameCode = generateCode();

            next();

        });

    });

    view.on('init', function(next) {

        // Get all decks
        Deck.model.find({}, '_id name', function (err, decks) {

            locals.gameCode = gameCode;
            locals.decks = decks;

            next(err);

        });

    });

    // Render the view
    view.render('decider/index');

};