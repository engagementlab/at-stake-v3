'use strict';

/**
 * @Stake v3
 * Developed by Engagement Lab, 2016
 * ==============
 * Common functionality game controller
 *
 * @class lib/games
 * @static
 * @author Johnny Richardson
 *
 * ==========
 */

var coreModule = require('learning-games-core'), 
    Core = coreModule.Core;

class Common extends Core {

    constructor() {

        super();

        this.Templates,
        this.Session = coreModule.SessionManager,
        this.events = require('events'),
        this.eventEmitter = new this.events.EventEmitter(),

        this._deck_data = {},
        // this._all_agenda_items = {},

        this._current_players = {},
        this._currentPlayerIndex = 0,
        this._game_session,
        this._game_timeout,
        this._config = {},

        this._current_submissions = {},
        this._players_submitted = [],

        this._countdown,
        this._countdown_duration,
        this._countdown_paused,
        this._event_countdown_done,
        this._current_round,
        this._active_player_index = 0,

        // Decider's username
        this._decider_name,

        // Stores last event sent and its data
        this._objLastTemplate,
        this._strLastEventId,

        this.currentPlayerCap,

        // Identifies targets for socket events
        this.players_id,
        this.group_id,
        this.keystone = require('keystone');

    }

    Initialize(gameSession, callback) {

        super.Initialize(gameSession, () => {

            var GameConfig = this.keystone.list('GameConfig').model;
            var Deck = this.keystone.list('Deck').model;

            this._countdown_paused = false;

            // Init session
            this._game_session = gameSession;

            // Init template loader with current game type
            var TemplateLoader = require('./TemplateLoader');
            this.Templates = new TemplateLoader(gameSession.gameType);

            // Identify targets for socket events
            this.players_id = gameSession.accessCode,
            this.group_id = gameSession.accessCode + '-group';

            // Get global config for game
            var queryConfig = GameConfig.findOne({}, {}, {
                sort: {
                    'createdAt': -1
                }
            });
            var queryDeck = Deck.findById(gameSession.deckId).populate('roles');

            queryConfig.exec((err, resultConfig) => {

                this._config = resultConfig;

                // Get data about this session's deck
                queryDeck.exec((err, deckData) => {

                    this._deck_data = deckData;

                    callback(this._config);

                });
            });

            console.info('Game "' + gameSession.accessCode + '" started! ');

        });
        
        
    }

    GetConfig() {

        return this._config;

    }

    // Get active players (all non-deciders)
    GetActivePlayers() {

        return _.filter(this._current_players, {decider:false});

    }

    // Get active player (it's their turn)
    GetActivePlayerData() {

        // Filter out decider
        // let keys =;
        // let playerUid = keys[++];

        return _.filter(this._current_players, {decider:false})[this._active_player_index];

    }

    /**
     * Begin the game's tutorial.
     *
     * @class lib/games/Common
     */
    StartTutorial(socket) {

        this.Templates.Load('partials/group/tutorial', undefined, (html) => {
            
            socket.to(this.group_id).emit('game:tutorial', html);
        
        });

    }

    ModeratorJoin(socket, player) { 

        super.ModeratorJoin(socket);

        this.PlayerReady(player, socket, true);

    }

    PlayerReady(player, socket, isDecider) {

        // Invoke common method
        super.PlayerReady(player, socket, false);

        let playerRole = {};

        // Set decider's name
        if(isDecider) {
            this._decider_name = player.username;
            playerRole = {title: 'The Decider'};
        }
        else {
            // Assign random role and then remove it so it's not assigned again
            let roleIndex = Math.floor(Math.random() * this._deck_data.roles.length) + 0;
            playerRole = this._deck_data.roles[roleIndex];
        }

        // Assign role to player object
        if(this._current_players[player.uid]) {

            this._current_players[player.uid].decider = isDecider;
            this._current_players[player.uid].role = playerRole;

        }

    }

    AdvanceRound() {

        // Invoke common method
        super.AdvanceRound(player, socket);

        _active_player_index = 0;

    }

}

module.exports = Common;