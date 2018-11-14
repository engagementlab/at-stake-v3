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

        'game:intro': function(pkg) {

            let session = Session.Get(pkg.gameId);

            if(!session) return;
            session.Intro(currentSpace);
                        
        },

        'game:ready': function(pkg) {

            let session = Session.Get(pkg.gameId);

            if(!session) return;
            session.PlayerDone(pkg.msgData);
                        
        },

        'game:event': function(pkg) {

            let session = Session.Get(pkg.gameId);

            if(!session) return;
            session.ShowEvent(pkg.msgData.state, pkg.msgData.index);
                        
        },

        'game:tutorial': function(pkg) {

            let session = Session.Get(pkg.gameId);

            if(!session) return;
            session.StartTutorial(currentSpace);
                        
        },

        'game:start': function(pkg) {

            let session = Session.Get(pkg.gameId);

            if(!session) return;
            session.StartGame(currentSpace, false);

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

        'game:exit': function(pkg) {

            let session = Session.Get(pkg.gameId);

            if(!session) return;
            session.EndGame(currentSpace);

        },

        'game:ranking': function(pkg) {

            let session = Session.Get(pkg.gameId);

            if(!session) return;
            session.GameRating(pkg.msgData.rating);

        },

        'game:stop_countdown': function(pkg) {

            let session = Session.Get(pkg.gameId);

            if(!session) return;
            session.StopCountdown();
                        
        },

        'player:met_goal': function(pkg) {

            let session = Session.Get(pkg.gameId);

            if(!session) return;
            session.PlayerMetGoal(pkg.msgData.uid);

        },

        'player:callvote': function(pkg) {

            let session = Session.Get(pkg.gameId);

            if(!session) return;
            session.PlayerCallVote(currentSocket);

        },

        'player:vote': function(pkg) {

            let session = Session.Get(pkg.gameId);

            if(!session) return;
            session.PlayerVote(currentSpace, pkg.msgData);

        },

        'player:vote_end': function(pkg) {

            let session = Session.Get(pkg.gameId);

            if(!session) return;
            session.PlayerVoteEnd(currentSpace);

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