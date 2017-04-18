
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
        this.playerCoins = new Map(),

        // Track count at start of rounds
        this.startingPlayerCoins = new Map(),

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

    GetTopPlayerId() {

        let highest = 0,
            topUid;

        this.playerCoins.forEach(function(coins, uid) {
          if(coins > highest) {
            highest = coins;
            topUid = uid;
          }
        });

        return topUid;

    }

    GetCoinsForPlayer(playerUid) {

        let start = this.startingPlayerCoins.get(playerUid),
            curr = this.playerCoins.get(playerUid),
            delta = this.GetScoreDelta(start, curr);

        return { 
                    starting: start, 
                    current: curr,
                    delta: delta
               };

    }

    FirstRound(players, config, socket) {

        this.initialPotAmount = this.currentPot = config.potCoinCount;

        // Dispense initial coin amounts to all players
        _.each(players, (player, index) => {

            let amt = (player.decider ? config.deciderStartCoinCount : config.playerStartCoinCount);

            // Map amount for each player
            this.playerCoins.set(player.uid, amt);
            this.startingPlayerCoins.set(player.uid, amt);

            socket.to(player.socket_id).emit('coins:add', {amt: amt, type: 'player'});

        });

        // Send initial pot amount
        socket.to(this.playersId).emit('coins:add', {amt: this.currentPot, type: 'pot'});

    }

    Give(player, amount, socket) {

        let amt = this.playerCoins.get(player.uid) + amount;
        this.playerCoins.set(player.uid, amt);

        // Prevent less the zero in pot
        if(this.currentPot-amount > 0) {
            this.currentPot -= amount;
            socket.to(this.playersId).emit('coins:remove', {amt: this.currentPot, type: 'pot'});
        }

        socket.to(player.socket_id).emit('coins:add', {amt: this.playerCoins.get(player.uid), type: 'player'});

    }

    // I promise this has nothing to do with drugs
    GiveWinnerPot(winner, socket) {

        this.endingPotAmount = this.currentPot;
        this.currentPot = 0;

        let amt = this.playerCoins.get(winner.uid) + this.endingPotAmount;
        this.playerCoins.set(winner.uid, amt);

        socket.to(winner.socket_id).emit('coins:add', {amt: this.playerCoins.get(winner.uid), type: 'player'});
        socket.to(this.playersId).emit('coins:remove', {amt: this.currentPot, type: 'pot'});

    }

    Take(player, amount, socket) {

        let amt = this.playerCoins.get(player.uid) - amount;
        this.playerCoins.set(player.uid, amt);

        // Add to pot
        this.currentPot += amount;

        socket.to(player.socket_id).emit('coins:remove', {amt: this.playerCoins.get(player.uid), type: 'player'});
        socket.to(this.playersId).emit('coins:add', {amt: this.currentPot, type: 'pot'});

    }

    RestorePot(players, socket) {

        // Save the prior round's coin count for all players
        _.each(players, (player, index) => {

            this.startingPlayerCoins.set(player.uid, this.playerCoins.get(player.uid));

        });

        // Reset
        this.currentPot = this.initialPotAmount;

        // Tell all players
        socket.to(this.playersId).emit('coins:add', {amt: this.currentPot, type: 'pot'});

    }

}

module.exports = Coins;