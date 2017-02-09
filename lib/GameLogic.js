'use strict';

/**
 * @Stake v3
 * Developed by Engagement Lab, 2016
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

                                { id: 'roles', shared: true },
                                { id: 'rules', shared: true, initial: true },
                                { id: 'bio', unique: true },
                                { id: 'agenda', unique: true },
                                { id: 'question' },
                                { id: 'think_instructions' },
                                { id: 'think', unique: true },
                                { id: 'pitch', unique: true },
                                { id: 'deliberate_instructions' },
                                { id: 'deliberate', unique: true },
                                { id: 'decide' },
                                { id: 'winner', shared: true },

                                { id: 'agenda_item_instructions' }, 
                                { id: 'agenda_item', unique: true },
                                { id: 'scoreboard', shared: true }
                              ],
        
        this.currentScreenIndex = 0,
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

        if(screenType === 'decider') {

            switch(screenName) {

                // Get question for this round
                case 'question':
                case 'think':
                case 'pitch':
                case 'deliberate':

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

            let activePlayerInfo = this.GetActivePlayerData();

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

                // Get pitch data for this round
                case 'pitch':
                case 'deliberate':

                    // Get both common and unique data for each player
                    screenData = _.mapObject(this.GetActivePlayers(), 
                                     (player) => { 
                                        return { 
                                            name: player.username,
                                            title: player.role.title,
                                            agendaItems: player.role.agendaItems,
                                            question: this._deck_data.questions[this._current_round],
                                            activePlayer: activePlayerInfo,
                                            isActive: (player.uid === activePlayerInfo.uid)
                                        }; 
                                    });

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
                                                        title: player.role.title,
                                                        coins: this.Coins.GetCoinsForPlayer(player.uid)
                                                    }; 
                                                });

                    let sortedPlayers = _.sortBy(players, function(player) {return player.coins.current});

                    screenData.players = sortedPlayers;

                    break;

                case 'winner':

                    if(!this._current_winner)
                        throw new Error("Unable to find winner!");

                    screenData = { name: this._current_winner.username, coins: this.Coins.GetPotAmount() };

                    break;

                
            }

        }

        // Apply to data for all screens
        screenData.config = this._config;
        screenData.decider = this._current_decider.username;
        screenData.round = this._current_round+1;

        return screenData;

    }

    FindScreen(screenName, isPlayerOnly) {

        let screenInfo = _.where(this.currentScreens, {id: screenName})[0];
        let isShared = screenInfo.shared;

        // Load a shared screen to all clients?
        if(isShared) {

            let sharedData = this.GetData(screenName, 'shared');
            this.ShowSharedScreen(screenName, sharedData);
        
        }
        else {

            let playersData = this.GetData(screenName, 'player');
            let deciderData = this.GetData(screenName, 'decider');
            let isUnique = screenInfo.unique;

            this.ShowScreen(screenName, false, 'player', playersData, isUnique);

            if(!isPlayerOnly)
                this.ShowScreen(screenName, false, 'decider', deciderData);

        }

    }

    ShowSharedScreen(screenName, data) {

        this.ShowScreen(screenName, true, 'shared', data);

    }

    /**
    * Load and dispatch game screen to players.
    *
    * @param {String} Name of the screen
    * @param {Boolean} Is shared between decider and others?
    * @param {String} Partials folder to load from
    * @param {Object} Data for the screen
    * @param {Boolean} Data is unique for each player (data must be an array where indexes are playerId)?
    * @class GameLogic
    * @name ShowScreen
    */
    ShowScreen(screenName, isShared, partialsDir, data, uniqueData) {

        let path = 'partials/' + partialsDir + '/' + screenName;

        if(!isShared) {
       
            if(partialsDir === 'decider') {
                this.Templates.Load(path, data, (html) => {

                    this.groupSocket.to(this._current_decider.socket_id).emit('game:next', html);

                });
            }
            else {

                if(uniqueData) {

                    for(var playerId in this._current_players) {

                        let thisPlayer = this._current_players[playerId];

                        if(thisPlayer.decider)
                            continue;

                        let playerData = data[playerId];
                        playerData.playerUid = thisPlayer.uid;

                        this.Templates.Load(path, playerData, (html) => {

                            this.groupSocket.to(thisPlayer.socket_id).emit('game:next', html);

                        });
                    }

                }
                else {

                    this.Templates.Load(path, data, (html) => {

                        this.groupSocket.to(this.players_id).emit('game:next', html);

                    });

                }
            }
       
       }

       else {

           this.Templates.Load('partials/shared/' + screenName, data, (html) => {

                this.groupSocket.to(this._current_decider.socket_id).emit('game:next', html);
                this.groupSocket.to(this.players_id).emit('game:next', html);
            
            });
       
       }

       // Trigger any other logic (countdowns, etc)
       switch(screenName) {

            case 'pitch':

                break;


       }

    }

    StartGame(socket) {

        // Setup group socket (used for some methods dispatched from emitter)
        this.groupSocket = socket;

        // Tell first decider to start being decider
        this.groupSocket.to(this._current_decider.socket_id).emit('game:decider', true);

        this.currentScreenIndex = 0;
        this._current_round = 0;

        this.Coins.FirstRound(this._current_players, this._config, socket);

        this.NextScreen();

    }

    StartTimer(socket, timeAdded) {

        let id = this.currentScreens[this.currentScreenIndex].id;
        let seconds = (id === 'think') ? this._config.thinkSeconds : this._config.pitchSeconds;
        
        if(id === 'deliberate')
            seconds = timeAdded ? this._config.extraSeconds : this._config.deliberateSeconds;

        // Begin countdown and assign countdown end event
        let data = {timeLimit: seconds, countdownName: id+'Countdown'};
        if(timeAdded) {
            let name = _.first(this._deliberate_time_queue).username;
            this.groupSocket.to(this.players_id).emit('game:countdown_player', name);
        }

        this.Countdown(this.groupSocket, data, true);

        this.eventEmitter.on('countdownEnded', this.timerCallback);

    }

    AddTime(socket, playerUid) {

        let player = this.GetPlayerByUserId(playerUid);

        // Take this player's coins
        this.Coins.Take(player, this._config.extraTimeCost, this.groupSocket);

        // Get current screen id and the new time
        let id = this.currentScreens[this.currentScreenIndex].id;
        let updatedTime = this._countdown_duration + this._config.extraSeconds;
        
        // Begin countdown and assign countdown end event
        let data = {timeLimit: updatedTime, countdownName: id+'Countdown'};
        
        // If in deliberate stage, push player into queue and kick off new timer only if they are first player
        if(id === 'deliberate') {
            this._deliberate_time_queue.push(player);

            console.log('queue', this._deliberate_time_queue.length)
            
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

        // If no non-decider players left, decider can move to next phase 
        let state = resetActive ? 'phase_over' : 'player_done';

        if(resetActive)
            this._active_player_index = 0;

        this.groupSocket.to(this._current_decider.socket_id).emit('game:' + state);

    }

    NextScreen() {

        this.currentScreenIndex++;

        if(this.currentScreenIndex > this.currentScreens.length-1)
            throw new Error("No screen at index " + this.currentScreenIndex + "!");

        // Skip 'initial' screens after round 1
        if(this.currentScreens[this.currentScreenIndex].initial && this._current_round > 0)
            this.currentScreenIndex++;

        let id = this.currentScreens[this.currentScreenIndex].id;
        console.log(this.currentScreenIndex, id)
        this.FindScreen(id);

    }

    NextPlayer() {

        this._active_player_index++;

        let id = this.currentScreens[this.currentScreenIndex].id;
        this.FindScreen(id);

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

        this.NextScreen();

    }

    AgendaItemAction(approve) {

        let id = this.currentScreens[this.currentScreenIndex].id
        let agendaItems = this.GetActivePlayerData().role.agendaItems;
        let rewardAmt = this._config.rewardAmounts[this.activeAgendaItem];

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

            this.FindScreen(id, true);
        
        }
        else {

            // Next agenda item for this player
            this.activeAgendaItem++;;

            this.FindScreen(id, true);

        }
        this.groupSocket.to(this._current_decider.socket_id).emit('game:next_item');

    }


    AdvanceRound(socket) {

        this.currentScreenIndex = 0;
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