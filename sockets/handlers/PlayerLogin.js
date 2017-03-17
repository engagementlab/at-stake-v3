/**
 * @Stake v3
 * Developed by Engagement Lab, 2016-2017
 * ==============
 * PlayerLogin submission socket handler.
 *
 * @class sockets/handlers
 * @static
 * @author Johnny Richardson
 *
 * ==========
 */
'use strict';

const appRoot = require('app-root-path'),
      logger = require('winston'),
      colors = require('colors'),

      TemplateLoader = require(appRoot + '/lib/TemplateLoader'),
      Session = require('learning-games-core').SessionManager,
      Common = require(appRoot + '/lib/Common');

const PlayerLogin = function(nsp, socket, emitter) {

  const Templates = new TemplateLoader();

  const currentSpace = nsp;
  const currentSocket = socket;

  var playerGameId;

  // Expose handler methods for events
  this.handler = {

    room: (payload) => {

      if(!payload.gameId) {
        console.warn('gameId missing for socket ID "' + currentSocket.id + '"!');
        return;
      }

      playerGameId = payload.gameId;

      if(!Session.Get(playerGameId)) {
        currentSocket.emit('game:notfound');
        return;
      }
  
      currentSocket.join(payload.gameId, function(err) {

        if(err)
          throw err;
      });

      // Decider registration
      if(payload.msgData.type === 'decider' && Session.Get(playerGameId)) {

        var player = {socket_id: currentSocket.id, username: payload.msgData.username, uid: payload.msgData.uid};

        Session.GroupView(payload.gameId, currentSocket.id);
        Session.Get(playerGameId).ModeratorJoin(currentSpace, player);
      }
        
      logger.info(currentSocket.id + ' connected to room.');

    },
    
    'login:submit': (payload) => {

      var player = {socket_id: currentSocket.id, username: payload.msgData.username, uid: payload.msgData.uid};

      // Mark player as ready inside game session
      Session.Get(payload.gameId).PlayerReady(
                                              player,
                                              currentSpace,
                                              false);

      logger.info(player.username  + ' logged in.');
      
      // Advance player to waiting screen
      Templates.Load('partials/player/waiting', undefined, function(html) {
        var data = {
                    id: currentSocket.id,
                    html: html
                   };

        currentSocket.emit('player:loggedin', data);
      });

      // Send player's id (debugging)
      // currentSocket.emit('player:id', );
      
    },
    
    'login:active': (payload) => {

      if(!Session.Get(payload.gameId))
        return;

      logger.info('login:active', 'Checking if player "' + payload.uid + '" is active.');

      // See if this player is still marked as active inside game session
      if(Session.Get(payload.gameId).PlayerIsActive(payload.uid)) {

        var player = {socket_id: currentSocket.id, username: payload.username, uid: payload.uid};
        
        // Mark player as ready inside game session
        Session.Get(payload.gameId).PlayerReady(
                                                player,
                                                currentSocket,
                                                payload.decider);

      }
      else {
        logger.info('login:active', 'Player "' + payload.uid + '" not active.');
      }
      
    },

    disconnect: (payload) => {

      let session = Session.Get(playerGameId);

      if(!session)
        return;

      let isGroup = (currentSocket.id === session.groupModerator);

      if(isGroup)
        logger.info(playerGameId + " group view disconnecting. Bu-bye.");
      else {

        let player = session.GetPlayerById(currentSocket.id);

        if(player)
          logger.info("Player '" + player.username + "' disconnecting. Nooooo!");

      }

      if(playerGameId && session) {

        // if(currentSocket.id === session.groupModerator)
        //   session.End(currentSpace, false);
        // else
          session.PlayerLost(currentSocket.id, currentSocket);

      }
    }
  
  };

  logger.info("New PlayerLogin for socket: ".green + currentSocket.id);

};
module.exports = PlayerLogin;