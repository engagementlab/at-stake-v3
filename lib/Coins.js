'use strict';

/**
 * @Stake v3
 * Developed by Engagement Lab, 2016
 * ==============
 * Currency controller
 *
 * @class lib/games
 * @static
 * @author Johnny Richardson
 *
 * ==========
 */

var GameLogic = require('./GameLogic');

class Coins extends GameLogic {

    constructor() {

        super();

        this.playerCoins = {},
        this.currentPot,

    }

    Initialize(gameSession, callback) {

        super.Initialize(gameSession, () => {

        });
                
    }

    StartGame(socket) {

        super.StartGame(socket);

        console.log('coins');

    }

}

module.exports = Coins;