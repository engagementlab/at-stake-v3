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

class Coins {

    constructor(playersId) {

        this.playerCoins = {},
        this.currentPot,
        this.playersId = playersId;

    }

    FirstRound(players, config, socket) {

        this.currentPot = config.potCoinCount;

        // Dispense initial coin amounts to all players
        _.each(players, (player, index) => {

            let amt = (player.decider ? config.deciderStartCoinCount : config.playerStartCoinCount);

            this.playerCoins[player.uid] = amt;
            socket.to(player.socket_id).emit('coins:add', {amt: amt, type: 'player'});

        });

        // Send initial pot amount
        socket.to(this.playersId).emit('coins:add', {amt: this.currentPot, type: 'pot'});

    }

    Give(player, amount, socket) {

        this.playerCoins[player.uid] += amount;
        this.currentPot -= amount;

        socket.to(player.socket_id).emit('coins:add', {amt: amount, type: 'player'});
        socket.to(this.playersId).emit('coins:remove', {amt: this.currentPot, type: 'pot'});

    }

    Take(player, amount, socket) {

        this.playerCoins[player.uid] -= amount;
        this.currentPot += amount;

        socket.to(player.socket_id).emit('coins:remove', {amt: amount, type: 'player'});
        socket.to(this.playersId).emit('coins:add', {amt: this.currentPot, type: 'pot'});

    }

}

module.exports = Coins;