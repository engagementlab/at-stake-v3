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
'use strict';

var Common = function (nsp, socket) {
    var currentSpace = nsp,
        currentSocket = socket, 
        appRoot = require('app-root-path'),
        Session = require('learning-games-core').SessionManager;

    // Expose handler methods for events
    this.handler = {

        'game:tutorial': function(pkg) {

            let session = Session.Get(pkg.gameId);

            if(!session) return;
            session.StartTutorial(currentSpace);
                        
        },

        'game:start': function(pkg) {

            let session = Session.Get(pkg.gameId);

            if(!session) return;
            session.StartGame(currentSpace, (pkg.msgData.tutorial === "true"));

        },

        'game:next': function(pkg) {

            let session = Session.Get(pkg.gameId);

            if(!session) return;
            session.NextPhase();

        },

        'game:skip_rules': function(pkg) {

            let session = Session.Get(pkg.gameId);

            if(!session) return;
            session.SkipScreen();

        },

        'game:next_screen': function(pkg) {

            let session = Session.Get(pkg.gameId);

            if(!session) return;
            session.NextScreen(pkg.msgData);

        },

        'game:next_player': function(pkg) {

            let session = Session.Get(pkg.gameId);

            if(!session) return;
            session.NextPlayer();

        },

        'game:load_screen': function(pkg) {

            let session = Session.Get(pkg.gameId);

            if(!session) return;
            session.LoadScreenAtIndex(pkg.msgData.index);

        },

        'game:next_round': function(pkg) {

            let session = Session.Get(pkg.gameId);

            if(!session) return;
            session.AdvanceRound(currentSpace);

        },

        'game:start_timer': function(pkg) {

            let session = Session.Get(pkg.gameId);

            if(!session) return;
            session.StartTimer(currentSpace);

        },

        'game:more_time': function(pkg) {

            let session = Session.Get(pkg.gameId);

            if(!session) return;
            session.AddTime(currentSpace, pkg.msgData);

        },

        'game:turn_done': function(pkg) {

            let session = Session.Get(pkg.gameId);

            if(!session) return;
            session.PlayerTurnDone(currentSpace);

        },

        'game:proposal_selected': function(pkg) {

            let session = Session.Get(pkg.gameId);

            if(!session) return;
            session.ProposalSelected(pkg.msgData);

        },

        'game:agenda_yes': function(pkg) {

            let session = Session.Get(pkg.gameId);

            if(!session) return;
            session.AgendaItemAction(true);

        },

        'game:agenda_no': function(pkg) {

            let session = Session.Get(pkg.gameId);

            if(!session) return;
            session.AgendaItemAction(false);

        },

        'game:exit': function(pkg) {

            let session = Session.Get(pkg.gameId);

            if(!session) return;
            session.EndGame(currentSpace);

        },

        /* Pauses all game cooldowns (debugging only) */
        'debug:pause': function(pkg) {

            let session = Session.Get(pkg.gameId);

            if(!session) return;
            session.PauseResumeCooldown(currentSpace);

        },

        /* End game now (debugging only) */
        'debug:end': function(pkg) {

            let session = Session.Get(pkg.gameId);

            if(!session) return;
            session.EndGame(currentSpace);
        
        }
    
    };
}

module.exports = Common;