/**
 * @Stake v3
 * Developed by Engagement Lab, 2016-2017
 * ==============
 * Common game socket handler.
 *
 * @class sockets/handlers
 * @static
 * @author Johnny Richardson
 *
 * ==========
 */

var Common = function (nsp, socket) {
    var currentSpace = nsp,
        currentSocket = socket, 
        appRoot = require('app-root-path'),
        Session = require('learning-games-core').SessionManager;

    // Expose handler methods for events
    this.handler = {

        'game:tutorial': function(package) {

            Session.Get(package.gameId).
            StartTutorial(currentSpace);
            
        },

        'game:start': function(package) {

            Session.Get(package.gameId).
            StartGame(currentSpace);

        },

        'game:next': function(package) {

            Session.Get(package.gameId).
            NextPhase();

        },

        'game:skip_rules': function(package) {


            Session.Get(package.gameId).
            SkipScreen();

        },

        'game:next_screen': function(package) {


            Session.Get(package.gameId).
            NextScreen();

        },

        'game:next_player': function(package) {

            Session.Get(package.gameId).
            NextPlayer();

        },

        'game:load_screen': function(package) {

            Session.Get(package.gameId).
            LoadScreenAtIndex(package.msgData.index);

        },

        'game:next_round': function(package) {

            Session.Get(package.gameId).
            AdvanceRound(currentSpace);

        },

        'game:start_timer': function(package) {

            Session.Get(package.gameId).
            StartTimer(currentSpace);

        },

        'game:more_time': function(package) {

            Session.Get(package.gameId).
            AddTime(currentSpace, package.msgData);

        },

        'game:turn_done': function(package) {

            Session.Get(package.gameId).
            PlayerTurnDone(currentSpace);

        },

        'game:proposal_selected': function(package) {

            Session.Get(package.gameId).
            ProposalSelected(package.msgData);

        },

        'game:agenda_yes': function(package) {

            Session.Get(package.gameId).
            AgendaItemAction(true);

        },

        'game:agenda_no': function(package) {

            Session.Get(package.gameId).
            AgendaItemAction(false);

        },

        /* Pauses all game cooldowns (debugging only) */
        'debug:pause': function(package) {

            Session.Get(package.gameId).
            PauseResumeCooldown(currentSpace);

        },

        /* End game now (debugging only) */
        'debug:end': function(package) {
            Session.Get(package.gameId).
            EndGame(currentSpace);
        }
    
    };
}

module.exports = Common;