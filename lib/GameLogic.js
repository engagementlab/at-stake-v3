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

                                { id: 'meet', shared: true },
                                { id: 'brainstorm', shared: true },
                                { id: 'pitch', shared: true, unique: true },
                                { id: 'deliberate', shared: true }
                                { id: 'decide', shared: true }
                                // { id: 'scoreboard', shared: true }
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

            console.log('queue', this._deliberate_time_queue.length)

        }

    }

    GetAllScreens() {

        return _.pluck(this.currentScreens, 'id');
    
    }

    GetData(screenName, screenType) {

        let screenData = {};
        let activePlayerInfo = this.GetActivePlayerData();

        if(screenType === 'decider') {

            switch(screenName) {

                case 'pitch':

                    let activePlayerInfo = this.GetActivePlayerData();

                    screenData = { 
                                    question: this._deck_data.questions[this._current_round],
                                    activePlayer: activePlayerInfo,
                                    firstPlayer: (this._active_player_index===1)
                                 };

                    break;

                case 'decide':

                    screenData = { 
                                    players: _.map(this.GetActivePlayers(), function(player) {
                                                return { username: player.username, uid: player.uid };
                                            })
                                 };

                    break;

                case 'agenda_item':

                    screenData = { 
                                    players: _.map(this.GetActivePlayers(), function(player) {
                                                return { username: player.username, uid: player.uid, role: player.role };
                                            })
                                 };


                    break;

            }

        }

        else if(screenType === 'player') {

            switch(screenName) {

                // Get bio screen data for all players
                case 'bio':

                    screenData = _.mapObject(this.GetActivePlayers(), 
                                             (player) => { 
                                                return { 
                                                        name: player.username,
                                                        title: player.role.title,
                                                        bio: player.role.bio 
                                                        
                                                }; 
                                             });

                    break;

                // Get agenda screen data for all players
                case 'agenda':
                case 'think':

                    screenData = _.mapObject(this.GetActivePlayers(), 
                                             (player) => { 
                                                return { 
                                                        name: player.username,
                                                        title: player.role.title,
                                                        agendaItems: player.role.agendaItems
                                                }; 
                                             });

                    break;

                // Get question for this round
                case 'question':

                    screenData = { question: this._deck_data.questions[this._current_round] };

                    break;

                case 'agenda_item':

                    // Get both common and unique data for each player
                    screenData = _.mapObject(this.GetActivePlayers(), 
                                     (player) => { 
                                        return { 
                                            agendaItems: activePlayerInfo.role.agendaItems,
                                            activeIndex: this.activeAgendaItem,
                                            activeUser: activePlayerInfo.username,
                                            isActive: (player.uid === activePlayerInfo.uid)
                                        }; 
                                    });

                    break;
                
            }

        }
        
        else {

            switch(screenName) {

                case 'roles':
                case 'scoreboard':

                    let players = _.map(this.GetActivePlayers(), 
                                                (player) => { 
                                                    return { 
                                                        username: player.username, 
                                                        icon: player.index,
                                                        title: player.role.title,
                                                        coins: this.Coins.GetCoinsForPlayer(player.uid)
                                                    }; 
                                                });

                    let sortedPlayers = _.sortBy(players, function(player) {return player.coins.current});

                    screenData.players = sortedPlayers;

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
                case 'deliberate':

                    // Get both common and unique data for each player
                    screenData.players = _.mapObject(this.GetActivePlayers(), 
                                     (player) => { 
                                        return { 
                                            name: player.username,
                                            title: player.role.title,
                                            agendaItems: player.role.agendaItems,
                                            question: this._deck_data.questions[this._current_round],
                                            isActive: (player.uid === activePlayerInfo.uid),
                                            isInactive: !(player.uid === activePlayerInfo.uid)
                                        }; 
                                    });

                    break;

                case 'winner':

                    if(!this._current_winner)
                        throw new Error("Unable to find winner!");

                    screenData = { name: this._current_winner.username, coins: this.Coins.GetPotAmount() };

                    break;

                case 'decide':

                    screenData = {
                                    players: _.map(this.GetActivePlayers(), function(player) {
                                                return { username: player.username, uid: player.uid, role: player.role };
                                    }),
                                    winner: this._current_winner,
                                    activePlayer: activePlayerInfo
                                 };

                    break;

            }

        }

        // Apply to data for all screens
        screenData.config = this.GetConfig();
        screenData.decider = this._current_decider.username;
        screenData.round = this._current_round+1;
        screenData.activePlayer = activePlayerInfo;
        screenData.repeatScreen = (this._active_player_index < Object.keys(this.GetActivePlayers()).length-1);
        return screenData;

    }

    FindScreen(screenName, isPlayerOnly, refreshCurrent) {

        let screenInfo = _.where(this.currentScreens, {id: screenName})[0];
        let isUnique = screenInfo.unique;
        let isShared = screenInfo.shared;

        // Load a shared screen to all clients?
        if(isShared) {

            let sharedData = this.GetData(screenName, 'shared');
            this.ShowSharedScreen(screenName, sharedData, isUnique, refreshCurrent);
        
        }
        else {

            let playersData = this.GetData(screenName, 'player');
            let deciderData = this.GetData(screenName, 'decider');

            this.ShowScreen(screenName, false, 'player', playersData, isUnique, refreshCurrent);

            if(!isPlayerOnly)
                this.ShowScreen(screenName, false, 'decider', deciderData, false, refreshCurrent);

        }

    }

    ShowSharedScreen(screenName, data, isUnique, refreshCurrent) {

        this.ShowScreen(screenName, true, 'shared', data, isUnique, refreshCurrent);

    }

    /**
    * Load and dispatch game screen to players.
    *
    * @param {String} Name of the screen
    * @param {Boolean} Is shared between decider and others?
    * @param {String} Partials folder to load from
    * @param {Object} Data for the screen
    * @param {Boolean} Data is unique for each player (data must be an array where indexes are playerId)?
    * @param {Boolean} Don't send next phase, just refresh current screen(s) with new data?
    * @class GameLogic
    * @name ShowScreen
    */
    ShowScreen(screenName, isShared, partialsDir, data, uniqueData, refreshCurrent) {

        let path = 'partials/' + partialsDir + '/' + screenName;
        let eventId = refreshCurrent ? 'game:refresh_screen' : 'game:next_phase';

        if(!isShared) {
       
            if(partialsDir === 'decider') {
                this.Templates.Load(path, data, (html) => {

                    this.groupSocket.to(this._current_decider.socket_id).emit(eventId, html);

                });
            }
       
       }

       else {

            if(uniqueData) {

                for(var playerId in this._current_players) {

                    let thisPlayer = this._current_players[playerId];

                    if(thisPlayer.decider)
                        continue;

                    let outputData = _.omit(data, 'players');
                    let playerData = data.players[playerId];
                    playerData.playerUid = thisPlayer.uid;
                    outputData.player = playerData;

                    this.Templates.Load(path, outputData, (html) => {

                        this.groupSocket.to(thisPlayer.socket_id).emit(eventId, html);

                    });
                }

                this.Templates.Load('partials/shared/' + screenName, data, (html) => {

                    this.groupSocket.to(this._current_decider.socket_id).emit(eventId, html);
                
                });

            }
            else {

               this.Templates.Load('partials/shared/' + screenName, data, (html) => {

                    this.groupSocket.to(this._current_decider.socket_id).emit(eventId, html);
                    this.groupSocket.to(this.players_id).emit(eventId, html);
                
                });

            }
       
       }

       // Trigger any other logic (countdowns, etc)
       switch(screenName) {

            case 'pitch':

                break;


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

            this.groupSocket.to(this.players_id).emit('game:countdown_player', player.username);
        }

        // Add to countdown and assign countdown end event
        this.Countdown(this.groupSocket, data, true);
        
        this.eventEmitter.on('countdownEnded', this.timerCallback);

    }

    PlayerTurnDone(socket) {

        let resetActive = (this._active_player_index == Object.keys(this._current_players).length-2);

        if(resetActive)
            this._active_player_index = 0;

        this.groupSocket.to(this._current_decider.socket_id).emit('game:player_done');

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
        this.FindScreen(id, false, true);

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
        this.FindScreen(id, false, true);

        // this.NextPhase();

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
            if(advance) {
                this._active_player_index = 0;

                this.NextScreen();
                return;
            }

            this._active_player_index++;
            this.activeAgendaItem = 0;
            
            this.FindScreen(id, false, true);
        
        }
        else {

            // Next agenda item for this player
            this.activeAgendaItem++;;

        }
            
        // this.FindScreen(id, false, true);

        this.groupSocket.to(this._current_decider.socket_id).emit('game:next_item');

    }


    AdvanceRound(socket) {

        this.currentScreenIndex = -1;
        this._deliberate_time_queue = [];

        // Restore pot amount
        this.Coins.RestorePot(this.GetActivePlayers(), socket);

        // Invoke common method
        super.AdvanceRound(socket);

        // Go back to 1st screen
        this.NextScreen();

    }

    LoadScreenAtIndex(index) {

        this.currentScreenIndex = index-1;

        let id = this.currentScreens[this.currentScreenIndex].id;
        this.FindScreen(id);

    }
    

};

module.exports = GameLogic;