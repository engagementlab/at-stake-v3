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
                                { id: 'decide', unique: true },
                                { id: 'scoreboard' }

                              ],
        
        this.currentScreenIndex = -1,
        this.allAgendaItems,
        this.activeAgendaItem = 0;
    
        this.timerCallback = (data, socket) => {
            
        }

    }


    Initialize(gameSession) {
        
        // Invoke common method
        super.Initialize(gameSession, () => {

            var CoinsLib = require('./Coins');
            this.Coins = new CoinsLib(this.players_id);

        });

    
    }

    StartGame(socket) {

        // Setup group socket (used for some methods dispatched from emitter)
        this.groupSocket = socket;

        // Tell first decider to start being decider
        this.groupSocket.to(this._current_decider.socket_id).emit('game:decider', true);

        this.currentScreenIndex = -1;
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
            case 'deliberate':

                // Get both common and unique data for each player
                screenData.players = _.mapObject(this.GetActivePlayers(), 
                                 (player) => { 
                                    return { 
                                        username: player.username,
                                        uid: player.uid, 
                                        title: player.role.title,
                                        agendaItems: player.role.agendaItems,
                                        question: this._deck_data.questions[this._current_round],
                                        isActive: (player.uid === activePlayerInfo.uid),
                                        isInactive: !(player.uid === activePlayerInfo.uid)
                                    }; 
                                });

                break;

            case 'decide':

                screenData = {
                                players: _.mapObject(this.GetActivePlayers(), (player) => { 
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

                break;

        }

        // Apply to data for all screens
        screenData.config = this.GetConfig();
        screenData.decider = this._current_decider.username;
        screenData.round = this._current_round+1;
        screenData.activePlayer = activePlayerInfo;
        screenData.repeatScreen = (this._active_player_index < Object.keys(this.GetActivePlayers()).length-1);
        return screenData;

    }

    FindScreen(screenName, refreshCurrent) {

        let screenInfo = _.where(this.currentScreens, {id: screenName})[0];
        let isUnique = screenInfo.unique;
      
        let data = this.GetData(screenName);
        this.ShowScreen(screenName, data, isUnique, refreshCurrent);
     
    }

    /**
    * Load and dispatch game screen to players.
    *
    * @param {String} Name of the screen
    * @param {Object} Data for the screen
    * @param {Boolean} Data is unique for each player (data must be an array where indexes are playerId)?
    * @param {Boolean} Don't send next phase, just refresh current screen(s) with new data?
    * @class GameLogic
    * @name ShowScreen
    */
    ShowScreen(screenName, data, uniqueData, refreshCurrent) {

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

                    socket.to(arrPlayerUnique[playerIndex].socket_id).emit(eventId, html);

                    if(playerIndex < arrPlayerUnique.length-1)
                    {
                        playerIndex++;
                        sendData(socket);
                    }

                });
                
            }

            _.each(this._current_players, function(player, id) {

                if(player.decider)
                    return;

                let playerData = data.players[id];
                playerData.socket_id = player.socket_id;

                arrPlayerUnique.push(playerData);
            });

            this.Templates.Load('partials/shared/' + screenName, data, (html) => {

                this.groupSocket.to(this._current_decider.socket_id).emit(eventId, html);

                sendData(this.groupSocket);
            
            });

        }
        else {

            this.Templates.Load('partials/shared/' + screenName, data, (html) => {

                this.groupSocket.to(this.players_id).emit(eventId, html);
            
            });

        }

    }

    StartTimer(socket, timeAdded) {

        let id = this.currentScreens[this.currentScreenIndex].id;
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
        this.NextScreen();

        this.Countdown(this.groupSocket, data, true);

        this.eventEmitter.on('countdownEnded', this.timerCallback);

    }

    AddTime(socket, playerUid) {

        let player = this.GetPlayerByUserId(playerUid);

        // Take this player's coins
        this.Coins.Take(player, this.GetConfig().extraTimeCost, this.groupSocket);

        // Get current screen id and the new time
        let id = this.currentScreens[this.currentScreenIndex].id;
        let updatedTime = this._countdown_duration + this.GetConfig().extraSeconds;
        
        // Begin countdown and assign countdown end event
        let data = {timeLimit: updatedTime, countdownName: id+'Countdown'};
        
        // If in deliberate stage, push player into queue and kick off new timer only if they are first player
        if(id === 'deliberate') {
            this._deliberate_time_queue.push(player);
            
            if(this._deliberate_time_queue.length > 1)
                return;
        }

        this.groupSocket.to(this.players_id).emit('game:countdown_player', player.username);

        // Add to countdown and assign countdown end event
        this.Countdown(this.groupSocket, data, true);
        
        this.eventEmitter.on('countdownEnded', this.timerCallback);

    }

    PlayerTurnDone(socket) {

        let resetActive = (this._active_player_index == Object.keys(this._current_players).length-2);

        if(resetActive)
            this._active_player_index = 0;

        this.groupSocket.to(this.players_id).emit('game:player_done');

    }

    NextPhase() {

        this.currentScreenIndex++;

        if(this.currentScreenIndex > this.currentScreens.length-1)
            throw new Error("No screen at index " + this.currentScreenIndex + "!");

        let id = this.currentScreens[this.currentScreenIndex].id;

        this.FindScreen(id);

    }

    // Tell players to go to next screen in phase
    NextScreen() {

        this.groupSocket.to(this.players_id).emit('game:next_screen');

    }

    NextPlayer() {

        this._active_player_index++;

        let id = this.currentScreens[this.currentScreenIndex].id;
        this.FindScreen(id, true);

    }

    NextAgendaItem() {

        // let id = this.currentScreens[this.currentScreenIndex].id;
        // this.FindScreen(id);

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

        let id = this.currentScreens[this.currentScreenIndex].id;
        this.FindScreen(id, true);

    }

    AgendaItemAction(approve) {

        let id = this.currentScreens[this.currentScreenIndex].id
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
            
        // this.FindScreen(id, true);

        // this.groupSocket.to(this._current_decider.socket_id).emit('game:next_item', {chosen: approve});
        this.groupSocket.to(this.players_id).emit('game:next_item', {chosen: approve});

    }

    /**
    * @override
    */
    AdvanceRound(socket) {

        // Failsafe
        if(!this._current_winner)
            return;

        this.currentScreenIndex = -1;
        this._deliberate_time_queue = [];

        // Restore pot amount
        this.Coins.RestorePot(this.GetActivePlayers(), socket);

        // Invoke common method
        super.AdvanceRound(socket);

        // Go back to 1st screen
        this.NextPhase();

    }

    LoadScreenAtIndex(index) {

        this.currentScreenIndex = index-1;

        let id = this.currentScreens[this.currentScreenIndex].id;
        this.FindScreen(id);

    }

};

module.exports = GameLogic;