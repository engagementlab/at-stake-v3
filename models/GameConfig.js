/**
 * @Stake v3
 * 
 * GameConfig Model
 * @module models
 * @class GameConfig
 * @author Johnny Richardson
 * 
 * For field docs: http://keystonejs.com/docs/database/
 *
 * ==========
 */
var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * GameConfig Model
 * ==========
 */

var GameConfig = new keystone.List('GameConfig', {
		label: 'Games Config',
    track: true,
    candelete: false
});

GameConfig.add(
		{
			name: { type: String, required: true, default: "Game Settings" },
				  
		  playerCountRangeMin: { type: Number, label: "Player Allowed Count Min", required: true, initial: true },
		  playerCountRangeMax: { type: Number, label: "Player Allowed Count Max", required: true, initial: true },
		  timeTimeoutPlayer: { type: Number, label: "Player Disconnect Timeout", note: "Time (seconds) before game ends after player disconnects", required: true, initial: true }
		},
	  
	  /*
		* Coin settings
		*/
		'Coin settings', {
		  potCoinCount: { type: Number, label: "Pot Coin Count", note: "Number of coins that players start with at the beginning of the game", required: true, initial: true },
		  playerStartCoinCount: { type: Number, label: "Player Start Coin Count", note: "Number of coins that players start with at the beginning of the game", required: true, initial: true },
		  deciderStartCoinCount: { type: Number, label: "Decider Start Coin Count", note: "Number of coins that the Decider starts with at the beginning of the game", required: true, initial: true },
		  // playerRoundStartCoinCount: { type: Number, label: "Player Round Start Coin Count", note: "Number of coins that players start with at the beginning of a round (after round 1)", required: true, initial: true },
		  // deciderRoundStartCoinCount: { type: Number, label: "Decider Round Start Coin Count", note: "Number of coins that the Decider starts with at the beginning of a round (after round 1)", required: true, initial: true },
		  rewardAmounts: { type: Types.TextArray, label: "Reward Amounts", note: "Number of coins awarded for having a player's agenda point included in plan", required: false, initial: false },
		  extraTimeCost: { type: Number, label: "Extra Time Cost", note: "Number of coins it costs to get extra time while pitching", required: true, initial: true },
		  doubledownTimeCost: { type: Number, label: "Double-down Time Cost", note: "Number of coins it costs to get Double-down time", required: true, initial: true }
		},

	  /*
		* Time settings
		*/
		'Time settings', {
		  thinkSeconds: { type: Number, label: "Think Seconds", note: 'Amount of time in the "think" segment of the round', required: true, initial: true },
		  pitchSeconds: { type: Number, label: "Pitch Seconds", note: 'Amount of time in the "pitch" segment of the round', required: true, initial: true },
		  extraSeconds: { type: Number, label: "Extra Seconds", note: 'Amount of time given to a player if they choose to use additional time for their pitch', required: true, initial: true },
		  doubledownSeconds: { type: Number, label: "Double-down Seconds", note: 'Amount of time given to a player if they buy Double-down time', required: true, initial: true },
		  deliberateSeconds: { type: Number, label: "Deliberate Seconds", note: 'Amount of time in the "deliberate" segment of the round', required: true, initial: true }
		}, 
		 /*
		* Time settings
		*/
		'Animation settings', {
		  decideDuration: { type: Number, label: "Think Seconds", note: 'Duration of proposal and agenda decide modals', required: true, initial: true }
		}

);

/**
 * Registration
 */

GameConfig.defaultColumns = 'name';
GameConfig.register();
