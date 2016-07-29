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

        this.currentScreens = {

                                'pot': true,
                                'bio': false

                              },
        
        this.currentScreenIndex = 0;

    }

    GetData(screenName, screenType) {

        let screenData = {};

        if(screenType === 'decider') {

            switch(screenName) {

            }

        }

        else if(screenType === 'player') {

            switch(screenName) {

                // Get bio screen data for all players
                case 'bio':

                    screenData = _.pluck(this._current_players, 'role');

                    break;
                
            }

        }
        
        else {

            switch(screenName) {
                
            }

        }

        return screenData;

    }

    FindScreen(screenName) {

        var isShared = this.currentScreens[screenName];

        // Load a shared screen to all clients?
        if(isShared) {

            let sharedData = this.GetData(screenName, 'shared');
            this.ShowScreen(screenName, true, 'shared', sharedData);
        
        }
        else {

            let playersData = this.GetData(screenName, 'player');
            let deciderData = this.GetData(screenName, 'decider');

            this.ShowScreen(screenName, false, 'player', playersData);
            this.ShowScreen(screenName, false, 'decider', deciderData);

        }

    }

    /*ShowPlayerScreen(screenName, data) {

        this.ShowScreen(screenName, false, 'player');

    }

    ShowSharedScreen(screenName, data) {

        this.ShowScreen(screenName, true, 'shared');

    }*/

    ShowScreen(screenName, isShared, partialsDir, data) {

        let path = 'partials/' + partialsDir + '/' + screenName;

        data.config = this._config;
        data.decider = this._decider_name;

        if(!isShared) {
       
           this.Templates.Load(path, data, (html) => {

                if(partialsDir === 'decider')
                    this.groupSocket.to(this.group_id).emit('game:next', html);
                else
                    this.groupSocket.to(this.players_id).emit('game:next', html);
            
            }); 
       
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

        let data = _.map(this._current_players, (player) => { return { name: player.username, title: player.role.title }; });

        this.Templates.Load('partials/shared/roles', data, (html) => {

            socket.to(this.group_id).emit('game:start', html);
            socket.to(this.players_id).emit('game:start', html);

            this.SaveState('game:start', html);
        
        });

        this.currentScreenIndex++;

    }

    NextScreen() {

       this.FindScreen(
                        Object.keys(this.currentScreens)[this.currentScreenIndex]
                      );

    }
    

};

module.exports = GameLogic;