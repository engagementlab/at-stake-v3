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
var Common = require('./Common');

class Coins extends Common {

    constructor() {

        super();

        this.playerCoins = {},
        this.currentPot;

    }

    FirstRound() {

        _.each(this._current_players, (player, index) => {

            if(player.decider)
                player.coins = this._config.deciderStartCoinCount;
            else
                player.coins = this._config.playerStartCoinCount;

            this.groupSocket.to(player.socket_id).emit('coins:add', {amt: player.coins, type: 'player'});
        });

        // Send initial pot amount
        this.groupSocket.to(this.players_id).emit('coins:add', {amt: this._config.potCoinCount, type: 'pot'});

    }

    GiveCoins(player) {



    }

}

module.exports = Coins;