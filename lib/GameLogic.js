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

        this.request = require('request'),
        
        this.groupSocket,

        this.currentScreens = [

                                { id: 'roles', shared: true },
                                { id: 'pot', shared: true },
                                { id: 'bio', unique: true },
                                { id: 'agenda', unique: true },
                                { id: 'question' }

                              ],
        
        this.currentScreenIndex = 0;

    }

    GetData(screenName, screenType) {


        let screenData = {};

        if(screenType === 'decider') {

            switch(screenName) {

                // Get question for this round
                case 'question':

                    screenData = { question: this._deck_data.questions[this._current_round] };

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
                
            }

        }
        
        else {

            switch(screenName) {

                case 'roles':

                    screenData = _.map(this._current_players, (player) => { return { name: player.username, title: player.role.title }; });

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
            this.ShowScreen(screenName, true, 'shared', sharedData);
        
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

    }

    ShowSharedScreen(screenName, data) {

        this.ShowScreen(screenName, true, 'shared');

    }*/

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

    }

    Initialize(gameSession) {
        
        // Invoke common method
        super.Initialize(gameSession, () => {

        });

    
    }

    AdvanceRound(socket) {

        // Invoke common method
        super.AdvanceRound(socket);

    }

    Reset() {

        // Invoke common method
        super.Reset();

    }

    StartGame(socket) {

       // Setup group socket (used for some methods dispatched from emitter)
       this.groupSocket = socket;

       this.currentScreenIndex = 0;
       this._current_round = 0;

       this.NextScreen();

    }

    NextScreen() {

       let id = this.currentScreens[this.currentScreenIndex].id;
       this.FindScreen(id);

       this.currentScreenIndex++;

    }
    

};

module.exports = GameLogic;