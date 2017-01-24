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
        this._active_deck_roles = {};
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
        this._current_winner,
        this._active_player_index = 0,

        // Decider's username
        this._current_decider,

        // Stores last event sent and its data
        this._objLastTemplate,
        this._strLastEventId,

        this.currentPlayerCap,
        this.assignedRoleIndices = [],

        // Identifies targets for socket events
        this.players_id,
        this.group_id,
        this.keystone = require('keystone');

    }

    Initialize(gameSession, callback) {

        super.Initialize(gameSession, () => {

            var GameConfig = this.keystone.list('GameConfig').model;
            var Deck = this.keystone.list('Deck').model;

            this.assignedRoleIndices = [];

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
                    this._active_deck_roles = deckData.roles;

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

        let players = _.pick(this._current_players, 
                        function(val, key, obj) { 
                            return (val.decider === false) || (val.decider === undefined);
                        });

        return players;

    }

    // Get active player (it's their turn)
    GetActivePlayerData() {

        let players = this.GetActivePlayers();
        let uids = Object.keys(players);

        return players[uids[this._active_player_index]];

    }

    AssignRoleToPlayer(player, isDecider) {

        let playerObj = this._current_players[player.uid];

        // Is decider (ensure falsey is false)?
        if(!isDecider)
            playerObj.decider = false;
        else {

            // Player is decider; no role this turn
            this._current_decider = player;
            playerObj.decider = true;

            // Tell new decider to start being decider
            if(this.groupSocket)
                this.groupSocket.to(this._current_decider.socket_id).emit('game:decider', true);

            return;

        }

        let availableRoleIndices = _.range(0, this._active_deck_roles.length)

        // Remove previously assigned roles, if applicable and those assigned to others
        let unavaiable = this.assignedRoleIndices;
        if(!playerObj.prior_roles)
            unavaiable = _.union(playerObj.prior_roles, this.assignedRoleIndices);

        // Remove used indices
        availableRoleIndices = _.difference(availableRoleIndices, unavaiable);

        // Assign random role
        let roleIndex = availableRoleIndices[_.random(0, availableRoleIndices.length-1)];
        let newRole = this._active_deck_roles[roleIndex];

        // Assign role to player object
        if(playerObj) {

            if(!newRole)
                throw new Error("Unable to assign role for player " + playerObj.uid);

            playerObj.role = newRole;

            // Track prior roles so not assigned again
            if(!playerObj.prior_roles)
                playerObj.prior_roles = [roleIndex]
            else
                playerObj.prior_roles.push(roleIndex);

            this.assignedRoleIndices.push(roleIndex);
        }

        // Replace cached object
        this._current_players[player.uid] = playerObj;

        // this._active_deck_roles.splice(roleIndex, 1);

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

        this.AssignRoleToPlayer(player, isDecider)

    }

    AdvanceRound(socket) {

        // Invoke common method
        super.AdvanceRound(socket);

        // End game if round > 2
        if(this._current_round === 3) 
            this.End(socket);

        // Reset active deck roles 
        this._active_deck_roles = this._deck_data.roles;

        // Reset active player
        this._active_player_index = 0;

        // Tell current decider to stop being decider
        this.groupSocket.to(this._current_decider.socket_id).emit('game:decider', false);

        _.each(this._current_players, (player, index) => {

            let isDecider = (this._current_winner.uid === player.uid);
           
            // Assign new decider and new roles
            this.AssignRoleToPlayer(player, isDecider)
        
        });

    }

}

module.exports = Common;