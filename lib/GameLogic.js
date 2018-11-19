'use strict';

/**
 * @Stake v3
 * Developed by Engagement Lab, 2016-2017
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

        this.Coins,

        this.currentScreens = [
                                
            { id: 'meet', unique: true },
            { id: 'deliberate' },
            { id: 'ranking' },
                                
                              ],
        
        this.currentPhaseIndex = -1,
        this.currentScreenIndex = 0,
        this.allAgendaItems,
        this.activeAgendaItem = 0,
        this.voteCallerSocketId,
        this.votesReceived = 0,
        this.votesYes = 0,

        // Track players finished w/ doubledown
        this.playersDoubledownDone = 0,

        // Player count who are ready for next step 
        this.playersReady = 0,

        // Player count who met secret goal
        this.playersMetGoal = 0,

        this.maxScore = 0,

        // Enable/disables tutorial in first phase
        this.tutorialEnabled = false,

        this.timerRunning = false,
    
        this.timerCallback = (data, socket) => {
            this.timerRunning = false;
        }

    }

    Shuffler(obj) {
        
        for(var j, x, i = obj.length; i; j = Math.floor(Math.random() * i), x = obj[--i], obj[i] = obj[j], obj[j] = x);
        return obj;
    
    }

    Initialize(gameSession) {

        // Invoke common method
        super.Initialize(gameSession, () => {

            var CoinsLib = require('./Coins');
            this.Coins = new CoinsLib(this.players_id);

            this.eventEmitter.on('playerReconnected', (socket) => {

                if(this.currentPhaseIndex > -1) {
                    let id = this.currentScreens[this.currentPhaseIndex].id;
                    this.FindScreen(id, true, socket, false);
                }
            });

        });

    
    }

    Intro(socket) {

        socket.to(this.players_id).emit('game:intro');        

    }

    PlayerDone(data) {

        this.playersReady++;

        if(this.playersReady === _.keys(this.GetActivePlayers()).length) {
            this.groupSocket.to(this._current_decider.socket_id).emit('game:ready', data);
            this.playersReady = 0;
        }

    }

    StartGame(socket, showTutorial) {

        let players = this.GetActivePlayers();
        this.tutorialEnabled = showTutorial;
        this.currentPhaseIndex = -1;

        this._game_in_session = true;

        // Calc possible max score (needs * secret goal * num of players + ratings)
        this.maxScore = (3 * _.keys(this.GetActivePlayers()).length) + 15;

        // Load team info
        this.Templates.Load('partials/shared/teaminfo', players, (teamHtml) => {

            // Tell facilitator team info
            if(this.groupSocket)
                this.groupSocket.to(this._current_decider.socket_id).emit('game:team_info', teamHtml);
        });

        this.NextPhase();

    }

    // Core method invocation
    StopCountdown() {

        this.timerRunning = false;

        super.StopCountdown();

        // Start timer again if somebody bought more deliberation time       
        /* if(this._deliberate_time_queue.length > 0) {

            this.StartTimer(this.groupSocket, true);

            this.eventEmitter.on('countdownEnded', this.timerCallback);

            // Remove first player in queue
            this._deliberate_time_queue.shift();

        } */

    }

    GetAllScreens() {

        return _.pluck(this.currentScreens, 'id');
    
    }

    GetData(screenName) {

        let screenData = {};
        let activePlayerInfo = this.GetActivePlayerData();

        let playerMap = _.map(this._current_players, 
                        (player) => { 
                            return { 
                                username: player.username,
                                decider: player.decider, 
                                title: player.role.title,
                                icon: player.index,
                                coins: this.Coins.GetCoinsForPlayer(player.uid).current,
                                isFacilitator: player.role.isFacilitator
                            }; 
                        });

        switch(screenName) {
            
            case 'meet':

                screenData = { 
                                // tutorial: (this.tutorialEnabled && (this._current_round+1 === 1)),
                                question: this._deck_data.questions[0],
                                playerMap: playerMap,
                                players: _.mapObject(this._current_players, (player) => { 
                                    return { 
                                        role: player.role
                                    };
                                })
                             };

                break;
            
            case 'deliberate':

                screenData = { 
                                question: this._deck_data.questions[0],
                                events: this._game_events,
                                players: _.mapObject(this._current_players, (player) => { 
                                    return {
                                        username: player.username,
                                        needs: player.role.needs,
                                        isFacilitator: player.role.isFacilitator
                                    };
                                })
                             };

                break;

            case 'ranking':

                screenData.players = _.map(this.GetActivePlayers(), 
                    (player) => { 
                        return { 
                            username: player.username, 
                            needs: player.role.needs
                        }; 
                });

                break;

        }

        // Apply to data for all screens
        screenData.config = _.omit(this.GetConfig(), 'debriefQuestions');
        screenData.decider = this._current_decider.username;
        screenData.round = this._current_round+1;
        screenData.timerRunning = this.timerRunning;
        screenData.repeatScreen = (this._active_player_index < Object.keys(this.GetActivePlayers()).length-1);
        return screenData;

    }

    FindScreen(screenName, refreshCurrent, socket, uniqueOverride) {

        let screenInfo = _.where(this.currentScreens, {id: screenName})[0];
        let isUnique = screenInfo.unique;
        if(uniqueOverride !== undefined)
            isUnique = uniqueOverride;
      
        let data = this.GetData(screenName);
        this.ShowScreen(screenName, data, isUnique, refreshCurrent, socket);
     
    }

    /**
    * Load and dispatch game screen to players.
    *
    * @param {String} Name of the screen
    * @param {Object} Data for the screen
    * @param {Boolean} Data is unique for each player (data must be an array where indexes are playerId)?
    * @param {Boolean} Don't send next phase, just refresh current screen(s) with new data?
    * @class GameLogic
    * @name ShowScreen
    */
    ShowScreen(screenName, data, uniqueData, refreshCurrent, socket) {

        let path = 'partials/shared/' + screenName;
        let eventId = refreshCurrent ? 'game:refresh_screen' : 'game:next_phase';
        let round = this._current_round;
        let template = this.Templates;
        let seconds = (screenName === 'meet') ? this.GetConfig().thinkSeconds : this.GetConfig().deliberateSeconds;

        if(uniqueData) {

            let arrPlayerUnique = [];
            let playerIndex = 0;

            function sendData(socket, phase, screen) {

                let outputData = data;
                outputData.player = arrPlayerUnique[playerIndex];

                template.Load(path, outputData, (html) => {

                    if(phase !== undefined && screen !== undefined)
                        socket.to(arrPlayerUnique[playerIndex].socket_id).emit(eventId, {
                                                                                        name: screenName,
                                                                                        html: html,
                                                                                        phase: phase,
                                                                                        screen: screen,
                                                                                        timerDuration: seconds});
                    else
                        socket.to(arrPlayerUnique[playerIndex].socket_id).emit(eventId, {
                                                                                        name: screenName,
                                                                                        html: html,
                                                                                        timerDuration: seconds});

                    if(playerIndex < arrPlayerUnique.length-1)
                    {
                        playerIndex++;
                        sendData(socket, phase, screen);
                    }

                });
                
            }

            _.each(this._current_players, function(player, id) {

                // if(player.decider)
                //     return;

                let playerData = data.players[id];
                playerData.socket_id = player.socket_id;

                arrPlayerUnique.push(playerData);

            });

            /* this.Templates.Load('partials/shared/' + screenName, data, (html) => {

                this.groupSocket.to(this._current_decider.socket_id).emit(eventId, {
                                                                            name: screenName,
                                                                            html: html,
                                                                            phase: this.currentPhaseIndex,
                                                                            screen: this.currentScreenIndex,
                                                                            timerDuration: seconds});
            
            }); */

            sendData(this.groupSocket, this.currentPhaseIndex, this.currentScreenIndex);

        }
        else {

            this.Templates.Load('partials/shared/' + screenName, data, (html) => {
                // Emit only to given socket, if specified
                if(socket !== undefined)
                    socket.emit(eventId, {name: screenName, 
                                         html: html,
                                         timerDuration: seconds,
                                         phase: this.currentPhaseIndex,
                                         screen: this.currentScreenIndex});
                else
                    this.groupSocket.to(this.players_id).emit(eventId, {name: screenName, html: html, timerDuration: seconds});
            
            });

        }

    }

    StartTimer(socket, timeAdded) {

        let id = this.currentScreens[this.currentPhaseIndex].id;
        let seconds = (id === 'meet') ? this.GetConfig().thinkSeconds : this.GetConfig().deliberateSeconds;
        
        // Begin countdown and assign countdown end event
        let data = {timeLimit: seconds, countdownName: id+'Countdown'};
        if(timeAdded) {
            let name = _.first(this._deliberate_time_queue).username;
            this.groupSocket.to(this.players_id).emit('game:countdown_player', name);
        }
        
        this.timerRunning = true;

        // Advance phase screen for non-deciders
        this.NextScreen();

        this.Countdown(this.groupSocket, data, true);

        this.eventEmitter.on('countdownEnded', this.timerCallback);

    }

    AddTime(socket, playerUid) {

        let player = this.GetPlayerByUserId(playerUid);

        if(!player) return;

        // Get current screen id and the new time
        let id = this.currentScreens[this.currentPhaseIndex].id;
        let seconds = (id === 'pitch') ? this.GetConfig().extraSeconds : this.GetConfig().doubledownSeconds;
        let cost = (id === 'pitch') ? this.GetConfig().extraTimeCost : this.GetConfig().doubledownTimeCost;
        let updatedTime = this._countdown_duration + seconds;

        // Take this player's coins
        this.Coins.Take(player, cost, this.groupSocket);
        
        // Begin countdown and assign countdown end event
        let data = {timeLimit: updatedTime, countdownName: id+'Countdown'};
        
        // If in deliberate stage, push player into queue and kick off new timer only if they are first player
        if(id === 'deliberate') {
            this._deliberate_time_queue.push(player);
            
            if(this._deliberate_time_queue.length > 1)
                return;
        }
        else if(id === 'doubledown')
            this.playersDoubledownDone = 0;

        this.groupSocket.to(this.players_id).emit('game:countdown_player', player.username);

        // Add to countdown and assign countdown end event
        this.Countdown(this.groupSocket, data, true);
        
        this.eventEmitter.on('countdownEnded', this.timerCallback);

    }

    PlayerTurnDone(socket) {

        let resetActive = (this._active_player_index === _.keys(this.GetActivePlayers()).length-1);

        if(resetActive)
            this._active_player_index = 0;

        let id = this.currentScreens[this.currentPhaseIndex].id;

        // If doubledown phase, track how many players say 'no' and then advance phase if all have done so
        if(id === 'doubledown') {
            
            this.playersDoubledownDone++;

            if(this.playersDoubledownDone === _.keys(this.GetActivePlayers()).length) {
                this.NextScreen(true);
                return;
            }
            else
                resetActive = false;

        }

        this.groupSocket.to(this.players_id).emit('game:player_done', {end: resetActive, phase: id});

    }

    NextPhase() {

        this.StopCountdown();

        this.currentPhaseIndex++;
        this.currentScreenIndex = 0;

        if(this.currentPhaseIndex > this.currentScreens.length-1)
            throw new Error("No screen at index " + this.currentPhaseIndex + "!");

        let id = this.currentScreens[this.currentPhaseIndex].id;
        this.FindScreen(id);

    }

    // Tell players to go to next screen in phase
    NextScreen(force) {

        let forceScreen = force;
        this.currentScreenIndex++;
        this.groupSocket.to(this.players_id).emit('game:next_screen', {force: forceScreen});

    }


    SkipScreen() {

        let id = this.currentScreens[this.currentPhaseIndex].id;
        let forceScreen = 'true';

        this.groupSocket.to(this.players_id).emit('game:skip_rules', {force: forceScreen});

    }

    NextPlayer() {

        let id = this.currentScreens[this.currentPhaseIndex].id;

        // At last player?
        let resetActive = (this._active_player_index === _.keys(this.GetActivePlayers()).length-1);

        // If doubledown phase, reset active player to cycle 'buy' screen back to first player
        if(id === 'doubledown') {

            if(resetActive) {
                this._active_player_index = 0;
                this.playersDoubledownDone = 0;
            }
            else
                this._active_player_index++;

        }
        else if(id === 'pitch') {

            if(resetActive) {
                this._active_player_index = 0;
                this.currentScreenIndex++;
            
            }
            else
                this._active_player_index++;
        }
        else
            this._active_player_index++;

        this.FindScreen(id, true);

    }

    ProposalSelected(winnerUid) {

        let winner = this._current_players[winnerUid];
        this._current_winner = winner;

        // Give winner all pot coins
        this.Coins.GiveWinnerPot(winner, this.groupSocket);

        let roles = _.pluck(_.filter(this._current_players, {decider:false}), 'role');
        let agendaItems = _.map(roles, 
                                 (role) => { 
                                    return role.agendaItems;
                                 });

        this.allAgendaItems = _.flatten(_.map(agendaItems, (item) => { return item;}));

        let id = this.currentScreens[this.currentPhaseIndex].id;
        this.FindScreen(id, true);

    }

    AgendaItemAction(approve) {

        let id = this.currentScreens[this.currentPhaseIndex].id
        let agendaItems = this.GetActivePlayerData().role.agendaItems;
        let rewardAmt = this.GetConfig().rewardAmounts[this.activeAgendaItem];

        // Disperse coins if agenda item approved
        let activePlayer = this.GetActivePlayerData();
        if(approve) {

            let reward = parseInt(rewardAmt);
            this.Coins.Give(activePlayer, reward, this.groupSocket);

        }

        this.groupSocket.to(activePlayer.socket_id).emit('player:agenda_item', {chosen: approve, coins: rewardAmt});

        // If at end of this player's agenda, move on to next one
        if(this.activeAgendaItem === agendaItems.length-1) {

            // Move to next phase (no more players)?
            let advance = (this._active_player_index == Object.keys(this.GetActivePlayers()).length-1);
            if(advance)
                this._active_player_index = 0;
            else {

                this._active_player_index++;
                this.activeAgendaItem = 0;
            }
        
        }
        else {

            // Next agenda item for this player
            this.activeAgendaItem++;

        }

        this.groupSocket.to(this.players_id).emit('game:next_item', {chosen: approve});

    }

    /**
    * @override
    */
    AdvanceRound(socket) {

        // Failsafe
        if(!this._current_winner)
            return;

        // Reset defaults
        this.currentPhaseIndex = -1;
        this._deliberate_time_queue = [];
        this.playersDoubledownDone = 0;

        // Restore pot amount
        this.Coins.RestorePot(this.GetActivePlayers(), socket);

        // Invoke common method
        super.AdvanceRound(socket);

        // Go back to 1st screen
        this.NextPhase();

    }

    LoadScreenAtIndex(index) {

        this.currentPhaseIndex = index-1;

        let id = this.currentScreens[this.currentPhaseIndex].id;
        this.FindScreen(id);

    }

    PlayerRejoined(socket) {

        let id = this.currentScreens[this.currentPhaseIndex].id;
        this.FindScreen(id, false, socket);

    }

    ShowEvent(state, index) {

        if(state === 'reject') return;
        this.groupSocket.to(this.players_id).emit('player:show_event', index);        

    }

    PlayerMetGoal(playerUid) {

        let player = this.GetPlayerByUserId(parseInt(playerUid));
        this.playersMetGoal++;

        this.groupSocket.to(this.players_id).emit('game:met_goal', player.username);

    }

    PlayerCallVote(socket) {

        let player = this.GetPlayerById(socket.id);
        let data = {username: player.username, question: this._deck_data.questions[0]};
        this.voteCallerSocketId = player.uid;
        this.Templates.Load('partials/shared/vote', data, (html) => {
            this.groupSocket.to(this.players_id).emit('player:callvote', html);
        });

    }

    PlayerVote(socket, vote) {

        this.votesReceived++;
        if(vote === 'yes')
            this.votesYes++;

        if(this.votesReceived === _.keys(this.GetActivePlayers()).length) {
            let voteWon = (this.votesYes === _.keys(this.GetActivePlayers()).length);
            this.groupSocket.to(this.players_id).emit('players:voted', {yes: voteWon, votecallerid: this.voteCallerSocketId});
            this.votesYes = 0;
            this.votesReceived = 0;
        }

    }

    PlayerVoteEnd() {
        
        this.groupSocket.to(this.players_id).emit('players:vote_ended');
    
    }

    GameRating(ratingData) {
        
        let calcRating = (total, num) => total + Number(num);
        let scales = Object.values(ratingData.rating).reduce(calcRating, 0);
        let score = scales + ratingData.needs;
        // Decide win state (is fractional val over threshold)
        let thresholdPerc = this.GetConfig().minWinThreshold / 100;
        let didWin = (score / this.maxScore) >= thresholdPerc;

        this.Templates.Load('partials/shared/end', {won: didWin}, (html) => {
            this.groupSocket.to(this.players_id).emit('game:end', html);
        });

    }

};

module.exports = GameLogic;