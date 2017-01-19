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

        this.groupSocket,

        this.currentScreens = [

                                { id: 'roles', shared: true },
                                { id: 'rules', shared: true },
                                { id: 'bio', unique: true },
                                { id: 'agenda', unique: true },
                                { id: 'question' },
                                { id: 'think_instructions' },
                                { id: 'think', unique: true },
                                { id: 'pitch', unique: true },
                                { id: 'deliberate_instructions' },
                                { id: 'deliberate', unique: true },
                                { id: 'decide' },
                                { id: 'winner', shared: true }
                              ],
        
        this.currentScreenIndex = 0;
        this.currentWinner;

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
                                    players: _.map(this._current_players, function(player) {
                                                return { username: player.username, uid: player.uid };
                                            })
                                 };

                    break;

            }

        }

        else if(screenType === 'player') {

            switch(screenName) {

                // Get bio screen data for all players
                case 'bio':

                    screenData = _.mapObject(this._current_players, 
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

                    screenData = _.mapObject(this._current_players, 
                                             (player) => { 
                                                return { 
                                                        name: player.username,
                                                        title: player.role.title,
                                                        agendaItems: [player.role.firstItem, player.role.secondItem] 
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

                    let activePlayerInfo = this.GetActivePlayerData();

                    // Get both common and unique data for each player
                    screenData = _.mapObject(this._current_players, 
                                     (player) => { 
                                        return { 
                                            name: player.username,
                                            title: player.role.title,
                                            agendaItems: [player.role.firstItem, player.role.secondItem],
                                            question: this._deck_data.questions[this._current_round],
                                            activePlayer: activePlayerInfo,
                                            isActive: (player.uid === activePlayerInfo.uid)
                                        }; 
                                    });

                    break;
                
            }

        }
        
        else {

            switch(screenName) {

                case 'roles':

                    screenData = _.map(this._current_players, (player) => { return { name: player.username, title: player.role.title }; });

                    break;

                case 'winner':

                    screenData = { name: this.currentWinner.username };

                    break;

                
            }

        }

        // Apply to data for all screens
        screenData.config = this._config;
        screenData.decider = this._decider_name;
        screenData.round = this._current_round+1;

        return screenData;

    }

    FindScreen(screenName) {

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
            this.ShowScreen(screenName, false, 'decider', deciderData);

        }

    }

    /*ShowPlayerScreen(screenName, data) {

        this.ShowScreen(screenName, false, 'player');

    }*/

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

                    this.groupSocket.to(this.group_id).emit('game:next', html);

                });
            }
            else {

                if(uniqueData) {

                    for(var playerId in this._current_players) {

                        let thisPlayer = this._current_players[playerId];

                        if(thisPlayer.decider)
                            continue;

                        let playerData = data[playerId];

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

                this.groupSocket.to(this.group_id).emit('game:next', html);
                this.groupSocket.to(this.players_id).emit('game:next', html);
            
            });
       
       }

       // Trigger any other logic (countdowns, etc)
       switch(screenName) {

            case 'pitch':

                break;


       }

    }

    Initialize(gameSession) {
        
        // Invoke common method
        super.Initialize(gameSession, () => {

        });

    
    }

    StartGame(socket) {

       // Setup group socket (used for some methods dispatched from emitter)
       this.groupSocket = socket;

       this.currentScreenIndex = 0;
       this._current_round = 0;

       this.NextScreen();

    }

    StartTimer(socket) {

        let id = this.currentScreens[this.currentScreenIndex].id;
        let seconds = (id === 'think') ? this._config.thinkSeconds : this._config.pitchSeconds;

        // Begin pitch countdown and assign countdown end event
        this.Countdown(this.groupSocket, {timeLimit: seconds, countdownName: id+'Countdown'}, true);
        this.eventEmitter.on('countdownEnded', (hashtagData, socket) => {
            
        });

    }

    AddTime() {

        let id = this.currentScreens[this.currentScreenIndex].id;
        let updatedTime = this._countdown_duration + this._config.extraSeconds;

        // Add to pitch countdown and assign countdown end event
        this.Countdown(this.groupSocket, {timeLimit: updatedTime, countdownName: id+'Countdown'}, true);
        this.eventEmitter.on('countdownEnded', (hashtagData, socket) => {
            
        });

    }

    PlayerTurnDone(socket) {

        let resetActive = (this._active_player_index == this._current_players.length-2);

        // If no non-decider players left, decider can move to next phase 
        let state = resetActive ? 'phase_over' : 'player_done';

        if(resetActive)
            this._active_player_index = 0;

        this.groupSocket.to(this.group_id).emit('game:' + state);

    }

    NextScreen() {

       this.currentScreenIndex++;

       let id = this.currentScreens[this.currentScreenIndex].id;
       this.FindScreen(id);

    }

    NextPlayer() {

        this._active_player_index++;

        let id = this.currentScreens[this.currentScreenIndex].id;
        this.FindScreen(id);

    }

    ProposalSelected(winnerUid) {

        let winner = this._current_players[winnerUid];
        this.currentWinner = winner;

        this.NextScreen();

        // TODO: give coins

    }


    LoadScreenAtIndex(index) {

        this.currentScreenIndex = index-1;

        let id = this.currentScreens[this.currentScreenIndex].id;
        this.FindScreen(id);

    }
    

};

module.exports = GameLogic;