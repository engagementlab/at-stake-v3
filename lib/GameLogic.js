'use strict';

/**
 * @Stake v3
 * Developed by Engagement Lab, 2016-2017
 * ==============
 * @Stake game logic controller
 *
 * @class lib/games
 * @static
 * @author Johnny Richardson
 * @author Erica Salling
 *
 * ==========
 */
var Common = require('./Common');

class GameLogic extends Common {

    constructor() {

        super();

        this.Coins,

        this.groupSocket,

        this.currentScreens = [
                                
                                { id: 'meet'  },
                                { id: 'brainstorm' },
                                { id: 'pitch', unique: true },
                                { id: 'deliberate', },
                                { id: 'doubledown', unique: true },
                                { id: 'decide', unique: true },
                                { id: 'scoreboard' },
                                { id: 'debrief' }
                                
                              ],
        
        this.currentPhaseIndex = -1,
        this.allAgendaItems,
        this.activeAgendaItem = 0,

        // Track players finished w/ doubledown
        this.playersDoubledownDone = 0,

        // Enable/disables tutorial in first phase
        this.tutorialEnabled = false;
    
        this.timerCallback = (data, socket) => {
            
        }

    }

    Shuffler(obj) {
        
        for(var j, x, i = obj.length; i; j = Math.floor(Math.random() * i), x = obj[--i], obj[i] = obj[j], obj[j] = x);
        return obj;
    
    }

    Initialize(gameSession) {
        
        // Invoke common method
        super.Initialize(gameSession, () => {

            var CoinsLib = require('./Coins');
            this.Coins = new CoinsLib(this.players_id);

        });

    
    }

    StartGame(socket, showTutorial) {

        this.tutorialEnabled = showTutorial;

        // Setup group socket (used for some methods dispatched from emitter)
        this.groupSocket = socket;

        // Tell first decider to start being decider
        this.groupSocket.to(this._current_decider.socket_id).emit('game:decider', true);

        this.currentPhaseIndex = -1;
        this._current_round = 0;

        this._game_in_session = true;

        this.Coins.FirstRound(this._current_players, this.GetConfig(), socket);

        this.NextPhase();

    }

    // Core method invocation
    StopCountdown() {

        super.StopCountdown();

        // Start timer again if somebody bought more deliberation time       
        if(this._deliberate_time_queue.length > 0) {

            this.StartTimer(this.groupSocket, true);

            this.eventEmitter.on('countdownEnded', this.timerCallback);

            // Remove first player in queue
            this._deliberate_time_queue.shift();

        }

    }

    GetAllScreens() {

        return _.pluck(this.currentScreens, 'id');
    
    }

    GetData(screenName) {

        let screenData = {};
        let activePlayerInfo = this.GetActivePlayerData();

        switch(screenName) {
            // Get if tutorial enabled
            case 'meet':

                let playerMap = _.map(this.GetConnectedPlayers(), 
                                (player) => { 
                                    return { 
                                        username: player.username,
                                        uid: player.uid,
                                        decider: player.decider, 
                                        title: player.role.title,
                                        icon: player.index,
                                        coins: this.Coins.GetCoinsForPlayer(player.uid).current
                                    }; 
                              });

                screenData = { 
                                tutorial: (this.tutorialEnabled && (this._current_round+1 === 1)),
                                players: _.sortBy(playerMap, function(player) {return player.coins}).reverse()
                             };

                break;

            // Get question for this round
            case 'brainstorm':

                screenData = { 
                                question: this._deck_data.questions[this._current_round],
                                activePlayer: activePlayerInfo,
                                firstPlayer: (this._active_player_index===1)
                             };

                break;

            // Get pitch data for this round
            case 'pitch':
            case 'doubledown':

                // Get both common and unique data for each player
                screenData = {
                    question: this._deck_data.questions[this._current_round],
                    players: this.Shuffler(_.mapObject(this.GetConnectedPlayers(true),
                                 (player) => { 
                                    return { 
                                        username: player.username,
                                        uid: player.uid, 
                                        title: player.role.title,
                                        agendaItems: player.role.agendaItems,
                                        isActive: (player.uid === activePlayerInfo.uid),
                                        isInactive: !(player.uid === activePlayerInfo.uid)
                                    }; 
                                }))
                };

                break;

            case 'decide':

                screenData = {
                                players: _.mapObject(this.GetConnectedPlayers(true), (player) => { 
                                    return { 
                                        username: player.username,
                                        uid: player.uid, 
                                        role: player.role,
                                        icon: player.index,
                                        coins: this.Coins.GetCoinsForPlayer(player.uid).current,
                                        isActive: (player.uid === activePlayerInfo.uid),
                                        isInactive: !(player.uid === activePlayerInfo.uid)
                                    };
                                }),
                                winner: this._current_winner,
                                potAmount: this.Coins.GetLastPotAmount(),
                                playerCount: _.keys(this.GetActivePlayers()).length
                             };

                break;

            case 'scoreboard':

                let rankSort = _.values(_.sortBy(_.pluck(this._current_players,'uid'), (uid) => {return this.Coins.GetCoinsForPlayer(uid).current})).reverse();
                let topPlayerUid = this.Coins.GetTopPlayerId();

                let players = _.map(this._current_players, 
                                (player) => { 
                                    return { 
                                        username: player.username, 
                                        icon: player.index,
                                        title: player.role.title,
                                        role: player.role,
                                        coins: this.Coins.GetCoinsForPlayer(player.uid),
                                        rank: _.indexOf(rankSort, player.uid)
                                    }; 
                              });

                let sortedPlayers = _.sortBy(players, function(player) {return player.coins.starting});
                screenData.players = sortedPlayers;

                screenData.winner = this.GetPlayerByUserId(topPlayerUid);
                screenData.winner_coins = this.Coins.GetCoinsForPlayer(topPlayerUid).current;

                break;

            // Get questions for debrief
            case 'debrief':

                screenData = { 
                                questions: this.GetConfig().debriefQuestions
                             };

                break;

        }

        // Apply to data for all screens
        screenData.config = _.omit(this.GetConfig(), 'debriefQuestions');
        screenData.decider = this._current_decider.username;
        screenData.round = this._current_round+1;
        screenData.activePlayer = activePlayerInfo;
        screenData.repeatScreen = (this._active_player_index < Object.keys(this.GetActivePlayers()).length-1);
        return screenData;

    }

    FindScreen(screenName, refreshCurrent, socketId) {

        let screenInfo = _.where(this.currentScreens, {id: screenName})[0];
        let isUnique = screenInfo.unique;
      
        let data = this.GetData(screenName);
        this.ShowScreen(screenName, data, isUnique, refreshCurrent, socketId);
     
    }

    /**
    * Load and dispatch game screen to players.
    *
    * @param {String} Name of the screen
    * @param {Object} Data for the screen
    * @param {Boolean} Data is unique for each player (data must be an array where indexes are playerId)?
    * @param {Boolean} Don't send next phase, just refresh current screen(s) with new data?
    * @param {String} Broadcast to only specific socket ID.
    * @class GameLogic
    * @name ShowScreen
    */
    ShowScreen(screenName, data, uniqueData, refreshCurrent, socketId) {

        let path = 'partials/shared/' + screenName;
        let eventId = refreshCurrent ? 'game:refresh_screen' : 'game:next_phase';
        let round = this._current_round;
        let template = this.Templates;

        if(uniqueData) {

            let arrPlayerUnique = [];
            let playerIndex = 0;

            function sendData(socket) {

                let outputData = data;
                outputData.player = arrPlayerUnique[playerIndex];

                template.Load(path, outputData, (html) => {

                    socket.to(arrPlayerUnique[playerIndex].socket_id).emit(eventId, {html: html});

                    if(playerIndex < arrPlayerUnique.length-1)
                    {
                        playerIndex++;
                        sendData(socket);
                    }

                });
                
            }
            
            var players = this._current_players;
            // Send screen to single, designated socket?
            if(socketId) {
                var thisPlayer = _.findWhere(players, {socket_id: socketId});
                players = {};
                players[thisPlayer.uid] = thisPlayer;
            }

            // Assemble array of targeted players
            _.each(players, function(player, id) {

                let playerData = data.players[id];

                if(!playerData || !player)
                    return;

                if(player.decider)
                    return;

                playerData.socket_id = player.socket_id;

                arrPlayerUnique.push(playerData);
            });

            this.Templates.Load('partials/shared/' + screenName, data, (html) => {

                this.groupSocket.to(this._current_decider.socket_id).emit(eventId, {name: screenName, html: html});

                sendData(this.groupSocket);
            
            });

        }
        else {

            this.Templates.Load('partials/shared/' + screenName, data, (html) => {

                this.groupSocket.to(socketId ? socketId : this.players_id).emit(eventId, {name: screenName, html: html});
            
            });

        }

    }

    StartTimer(socket, timeAdded) {

        let id = this.currentScreens[this.currentPhaseIndex].id;
        let seconds = (id === 'brainstorm') ? this.GetConfig().thinkSeconds : this.GetConfig().pitchSeconds;
        
        if(id === 'deliberate')
            seconds = timeAdded ? this.GetConfig().extraSeconds : this.GetConfig().deliberateSeconds;

        // Begin countdown and assign countdown end event
        let data = {timeLimit: seconds, countdownName: id+'Countdown'};
        if(timeAdded) {
            let name = _.first(this._deliberate_time_queue).username;
            this.groupSocket.to(this.players_id).emit('game:countdown_player', name);
        }
        
        // Advance phase screen for non-deciders
        this.NextScreen(true);

        this.Countdown(this.groupSocket, data, true);

        this.eventEmitter.on('countdownEnded', this.timerCallback);

    }

    AddTime(socket, playerUid) {

        let player = this.GetPlayerByUserId(playerUid);

        if(!player) return;

        // Get current screen id and the new time
        let id = this.currentScreens[this.currentPhaseIndex].id;
        let seconds = (id === 'pitch') ? this.GetConfig().extraSeconds : this.GetConfig().doubledownSeconds;
        let cost = (id === 'pitch') ? this.GetConfig().extraTimeCost : this.GetConfig().doubledownTimeCost;
        let updatedTime = this._countdown_duration + seconds;

        // Take this player's coins
        this.Coins.Take(player, cost, this.groupSocket);
        
        // Begin countdown and assign countdown end event
        let data = {timeLimit: updatedTime, countdownName: id+'Countdown'};
        
        // If in deliberate stage, push player into queue and kick off new timer only if they are first player
        if(id === 'deliberate') {
            this._deliberate_time_queue.push(player);
            
            if(this._deliberate_time_queue.length > 1)
                return;
        }
        else if(id === 'doubledown')
            this.playersDoubledownDone = 0;

        this.groupSocket.to(this.players_id).emit('game:countdown_player', player.username);

        // Add to countdown and assign countdown end event
        this.Countdown(this.groupSocket, data, true);
        
        this.eventEmitter.on('countdownEnded', this.timerCallback);

    }

    PlayerTurnDone(socket) {

        let resetActive = (this._active_player_index === _.keys(this.GetActivePlayers()).length-1);

        if(resetActive)
            this._active_player_index = 0;

        let id = this.currentScreens[this.currentPhaseIndex].id;

        // If doubledown phase, track how many players say 'no' and then advance phase if all have done so
        if(id === 'doubledown') {
            
            this.playersDoubledownDone++;

            if(this.playersDoubledownDone === _.keys(this.GetActivePlayers()).length) {
                this.NextScreen(true);
                return;
            }
            else
                resetActive = false;

        }

        this.groupSocket.to(this.players_id).emit('game:player_done', {end: resetActive, phase: id});

    }

    NextPhase() {

        this.currentPhaseIndex++;
        this._current_screen_index = 0;

        if(this.currentPhaseIndex > this.currentScreens.length-1)
            throw new Error("No screen at index " + this.currentPhaseIndex + "!");

        let id = this.currentScreens[this.currentPhaseIndex].id;

        this.FindScreen(id);

    }

    // Tell players to go to next screen in phase
    NextScreen(force) {

        let forceScreen = force;
        this._current_screen_index++;

        this.groupSocket.to(this.players_id).emit('game:next_screen', {force: forceScreen});

    }


    SkipScreen() {

        let id = this.currentScreens[this.currentPhaseIndex].id;
        let forceScreen = 'true';

        this.groupSocket.to(this.players_id).emit('game:skip_rules', {force: forceScreen});

    }

    NextPlayer() {

        let id = this.currentScreens[this.currentPhaseIndex].id;

        // If doubledown phase, reset active player to cycle 'buy' screen back to first player
        if(id === 'doubledown') {

            // At last player?
            let resetActive = (this._active_player_index === _.keys(this.GetActivePlayers()).length-1);

            if(resetActive) {
                this._active_player_index = 0;
                this.playersDoubledownDone = 0;
            }
            else
                this._active_player_index++;

        }
        else
            this._active_player_index++;

        this.FindScreen(id, true);

    }

    ProposalSelected(winnerUid) {

        let winner = this._current_players[winnerUid];
        this._current_winner = winner;

        // Give winner all pot coins
        this.Coins.GiveWinnerPot(winner, this.groupSocket);

        let roles = _.pluck(_.filter(this._current_players, {decider:false}), 'role');
        let agendaItems = _.map(roles, 
                                 (role) => { 
                                    return role.agendaItems;
                                 });

        this.allAgendaItems = _.flatten(_.map(agendaItems, (item) => { return item;}));

        let id = this.currentScreens[this.currentPhaseIndex].id;
        this.FindScreen(id, true);

    }

    AgendaItemAction(approve) {

        let id = this.currentScreens[this.currentPhaseIndex].id
        let agendaItems = this.GetActivePlayerData().role.agendaItems;
        let rewardAmt = this.GetConfig().rewardAmounts[this.activeAgendaItem];

        // Disperse coins if agenda item approved
        let activePlayer = this.GetActivePlayerData();
        if(approve) {

            let reward = parseInt(rewardAmt);
            this.Coins.Give(activePlayer, reward, this.groupSocket);

        }

        this.groupSocket.to(activePlayer.socket_id).emit('player:agenda_item', {chosen: approve, coins: rewardAmt});

        // If at end of this player's agenda, move on to next one
        if(this.activeAgendaItem === agendaItems.length-1) {

            // Move to next phase (no more players)?
            let advance = (this._active_player_index == Object.keys(this.GetActivePlayers()).length-1);
            if(advance)
                this._active_player_index = 0;
            else {

                this._active_player_index++;
                this.activeAgendaItem = 0;
            }

            // this.FindScreen(id, false, true);
        
        }
        else {

            // Next agenda item for this player
            this.activeAgendaItem++;

        }

        this.groupSocket.to(this.players_id).emit('game:next_item', {chosen: approve});

    }

    /**
    * @override
    */
    AdvanceRound(socket) {

        // Failsafe
        if(!this._current_winner)
            return;

        // Reset defaults
        this.currentPhaseIndex = -1;
        this._deliberate_time_queue = [];
        this.playersDoubledownDone = 0;

        // Restore pot amount
        this.Coins.RestorePot(this.GetActivePlayers(), socket);

        // Invoke common method
        super.AdvanceRound(socket);

        // Go back to 1st screen
        this.NextPhase();

    }

    LoadCurrentScreenForSocket(socketId) {

        let id = this.currentScreens[this.currentPhaseIndex].id;
        this.FindScreen(id, true, socketId);

    }

};

module.exports = GameLogic;