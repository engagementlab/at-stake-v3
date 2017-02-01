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
    async = require('async'),
    appRoot = require('app-root-path');
    
var GameSession = keystone.list('GameSession'),
    Game = require(appRoot + '/lib/GameManager'),
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

        res.apiResponse({sessionCreated: true});
        
    });

};

/**
 * Generate info for Game creation menu
 */
exports.generate = function(req, res) {

    const randomstring = require('randomstring'); 
    let gameCode;

    function generateCode() {

        return randomstring.generate({ length: 4, charset: 'alphabetic' }).toUpperCase();
    
    }

    gameCode = generateCode();

    // Check if there's already a game with the generated access code
    GameSession.model.findOne({accessCode: gameCode}, function (err, session) {

        // There is! A one in 15,000 probability! Make a new one
        if(session)
            gameCode = generateCode();

        // Get all decks
        Deck.model.find({}, '_id name', function (err, decks) {

            res.send({code: gameCode, decks: decks});

        });

    });

};