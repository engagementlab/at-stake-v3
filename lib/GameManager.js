'use strict';

/**
 * @Stake v3
 * Developed by Engagement Lab, 2016
 * ==============
 * Game manager.
 *
 * @class lib
 * @static
 * @author Johnny Richardson
 *
 * ==========
 */

var GameManager = function(gameSession) {
	
	let GameLogic = require('./GameLogic');
	let Game = new GameLogic();

	Game.Initialize(gameSession);

	return Game;

};

module.exports = GameManager;