
'use strict';

/**
 * @Stake v3
 * Developed by Engagement Lab, 2016-2017
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

        // Track current count
        this.playerCoins = {},

        // Track count at start of rounds
        this.startingPlayerCoins = {},

        this.currentPot,
        this.endingPotAmount,
        this.initialPotAmount,
        this.playersId = playersId;

    }

    GetLastPotAmount() {

        return this.endingPotAmount;

    }

    GetScoreDelta(starting, current) {

        return (starting > current) ? (starting - current) : (current - starting);

    }

    GetCoinsForPlayer(playerUid) {

        return { 
                    starting: this.startingPlayerCoins[playerUid], 
                    current: this.playerCoins[playerUid],
                    delta: this.GetScoreDelta(this.startingPlayerCoins[playerUid], this.playerCoins[playerUid])
               };

    }

    FirstRound(players, config, socket) {

        this.initialPotAmount = this.currentPot = config.potCoinCount;

        // Dispense initial coin amounts to all players
        _.each(players, (player, index) => {

            let amt = (player.decider ? config.deciderStartCoinCount : config.playerStartCoinCount);

            this.playerCoins[player.uid] = this.startingPlayerCoins[player.uid] = amt;
            socket.to(player.socket_id).emit('coins:add', {amt: amt, type: 'player'});

        });

        // Send initial pot amount
        socket.to(this.playersId).emit('coins:add', {amt: this.currentPot, type: 'pot'});

    }

    Give(player, amount, socket) {

        console.log(amount, " give this amount");
        console.log(this.playerCoins[player.iud], " is this the total?");

        this.playerCoins[player.uid] += amount;

        // Prevent less the zero in pot
        if(this.currentPot-amount > 0) {
            this.currentPot -= amount;
            socket.to(this.playersId).emit('coins:remove', {amt: this.currentPot, type: 'pot'});
        }

        socket.to(player.socket_id).emit('coins:add', {amt: this.playerCoins[player.uid], type: 'player'});

    }

    // I promise this has nothing to do with drugs
    GiveWinnerPot(winner, socket) {

        this.endingPotAmount = this.currentPot;
        this.playerCoins[winner.uid] += this.currentPot;
        this.currentPot = 0;

        socket.to(winner.socket_id).emit('coins:add', {amt: this.playerCoins[winner.uid], type: 'player'});
        socket.to(this.playersId).emit('coins:remove', {amt: this.currentPot, type: 'pot'});

    }

    Take(player, amount, socket) {

        this.playerCoins[player.uid] -= amount;
        this.currentPot += amount;

        socket.to(player.socket_id).emit('coins:remove', {amt: this.playerCoins[player.uid], type: 'player'});
        socket.to(this.playersId).emit('coins:add', {amt: this.currentPot, type: 'pot'});

    }

    RestorePot(players, socket) {

        // Save the prior round's coin count for all players
        _.each(players, (player, index) => {

            this.startingPlayerCoins[player.uid] = this.playerCoins[player.uid];

        });

        // Reset
        this.currentPot = this.initialPotAmount;

        // Tell all players
        socket.to(this.playersId).emit('coins:add', {amt: this.currentPot, type: 'pot'});

    }

}

module.exports = Coins;