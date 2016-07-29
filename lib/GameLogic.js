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
                                'shared': ['roles', null],
                                'decider': [null, 'bio'],
                                'play': [null, 'bio']
                            },
        
        this.currentScreenIndex = 0;

    }

    ShowDeciderScreen(screenName, data) {

        this.ShowScreen(screenName, false, data, 'decider');

    }

    ShowPlayerScreen(screenName, data) {

        this.ShowScreen(screenName, false, data, 'player');

    }

    ShowSharedScreen(screenName, data) {

        this.ShowScreen(screenName, true, data);

    }

    ShowScreen(screenName, isShared, data, partialsDir) {

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

        let rolesLimited = _.first(_.values(this._deck_data.roles), Object.keys(this._current_players).length);
        let roleTitles = _.pluck(rolesLimited, 'title');

        this.Templates.Load('partials/shared/roles', roleTitles, (html) => {

            socket.to(this.group_id).emit('game:start', html);
            socket.to(this.players_id).emit('game:start', html);

            this.SaveState('game:start', html);
        
        });

        this.currentScreenIndex++;

    }

    ShowScreen(socket) {

        // let thisScreenId = 
        let rolesLimited = _.first(_.values(this._deck_data.roles), Object.keys(this._current_players).length);

       ShowSharedScreen('pot', undefined);

    }
    

};

module.exports = GameLogic;