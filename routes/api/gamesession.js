'use strict'
/**
 * @Stake v3
 * Developed by Engagement Lab, 2015
 * ==============
 * Home page view controller.
 *
 * Help: http://keystonejs.com/docs/getting-started/#routesviews-firstview
 *
 * @class index
 * @static
 * @author Johnny Richardson
 *
 * ==========
 */

var keystone = require('keystone'),
    async = require('async');
    
var GameSession = keystone.list('GameSession'),
    Game = require('../../lib/GameManager'),
    Session = require('learning-games-core').SessionManager,
    Deck = keystone.list('Deck');

/**
 * Create a GameSession
 */
exports.create = function(req, res) {

    var session;
    var data = (req.method == 'POST') ? req.body : req.query;

    // Check if accessCode defined
    if(!data.accessCode)        
        return res.apiError('Game code not sent!');  

    // Check if deck id specified
    if(!data.deckId)        
        return res.apiError('Deck not specified!');  

    session = new GameSession.model();
    
    session.getUpdateHandler(req).process(data, function(err) {
        
        if (err) return res.apiError('error', err);

        // Save this session to memory for faster retrieval (deleted when game ends)
        Session.Create(data.accessCode, new Game(session));

        res.apiResponse({sessionCreated: true, accessCode: data.accessCode, decider: data.deciderName});
        
    });

};

/**
 * Generate info for Game creation menu
 */
exports.generate = function(req, res) {

    var TemplateLoader = require('../../lib/TemplateLoader');
    const randomstring = require('randomstring'); 
    let gameCode;

    function generateCode() {

        return randomstring.
               generate({ length: 4, charset: 'alphabetic' }).toUpperCase();
    
    }

    gameCode = generateCode();

    // Check if there's already a game with the generated access code
    GameSession.model.findOne({accessCode: gameCode}, function (err, session) {

        // There is! A one in 15,000 probability! Make a new one
        if (session)
            gameCode = generateCode();

        // Get all decks
        var decksQuery = Deck.model.find({}).populate('roles');
        decksQuery.exec((err, decks) => {
            
            var Templates = new TemplateLoader();

            // Shuffle deck roles and only get 6
            _.each(decks, (deck, i) => {
                deck.roles = _.sample(deck.roles, 6);
            });

            Templates.Load('partials/decider/decks', decks, function(html) {

                res.send({code: gameCode, html: html});

            });

        });

    });

};