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

        this.currentPlayerIndex = 0,

        this.groupSocket;

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


        this.Templates.Load('partials/shared/roles', this._deck_data.roles, (html) => {

            socket.to(this.group_id).emit('game:start', html);
            socket.to(this.players_id).emit('game:start', html);

            this.SaveState('game:start', html);
        
        });

/*        this.Templates.Load('partials/decider/bio', undefined, (html) => {

            socket.to(this.group_id).emit('game:start', html);

            this.SaveState('game:start', html);
        
        });

        this.Templates.Load('partials/decider/bio', undefined, (html) => {

            socket.to(this.group_id).emit('game:start', html);

            this.SaveState('game:start', html);
        
        });*/

    }
    

};

module.exports = GameLogic;