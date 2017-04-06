'use strict';

var hbs = require('handlebars');

module.exports = function() {

    var _helpers = {};

    /**
     * @Stake v3 HBS Helpers
     * ===================
     */

    // Get time in minutes for provided seconds
    _helpers.getMinutes = function (strSeconds) {

        var intSeconds = parseInt(strSeconds);
        var secondsRemainder = (intSeconds % 60);
        var displaySeconds = (secondsRemainder < 10) ? ("0" + secondsRemainder) : secondsRemainder;  

        return Math.round(intSeconds / 60) + ':' + displaySeconds; 

    };

    _helpers.ellipsis = function (limit, currentText) {
     
        if (currentText) 
          return currentText.substr(0, limit) + "...";
        
    }

    _helpers.checkEven = function (num) {
     
        if ( num % 2 == 0) 
            return 'even';
        else 
            return 'odd';
        
    }

    _helpers.namePossessive = function (strName) {
        
        return ( strName.charAt(strName.length-1) === 's' ) ? strName + "'" : strName + "'s";

    }

    // Concatenate all passed in strings (combine is alias)
    _helpers.combine = _helpers.concat = function() {

        let strCombined = '';

        // Skip the last argument.
        for(let i = 0; i < arguments.length - 1; ++i) 
            strCombined += arguments[i];

        return strCombined;
    }

    // Given component params, generate classes that make up its display mode
    _helpers.showHide = function(attr) {

        let strClasses = '';

        // Is this component only visible to decider?
        if(attr.decider && attr.decider === true)
            strClasses = 'decider';

        // For non-decider
        else {

            if(attr.all_players === undefined || attr.all_players === false)
                strClasses = 'player';

            // Is this component only visible to active players or not?
            if(attr.active_player !== undefined)
                strClasses += (attr.active_player === true) ? ' showing' : ' hiding';

            else if(attr.inactive_player !== undefined)
                strClasses += (attr.inactive_player === true) ? ' showing' : ' hiding';
        
        }

        return strClasses;

    }

    // Given decider's speech component params, generate event that fires when 'next' is hit
    _helpers.nextEvent = function(attr) {

        let strEvent = 'game:';

        // Is this speech bubble's button...
        // ... advancing to next phase?
        if(attr.advance && attr.advance === true)
            strEvent += 'next';

        // ... advancing to a timer?
        else if(attr.timer && attr.timer === true)
            strEvent += 'start_timer';

        // ... just moving to next bubble?
        else
            strEvent += 'next_screen';

        return strEvent;

    }

    // Given agenda item's placement in lineup of all items, decide data-next event
    _helpers.nextAgendaEvent = function(playerCount, index, lastItem) {

        let strEvent = '';

        if((playerCount-1 === index) && lastItem)
            strEvent = 'next_screen';
        else
            strEvent = 'next_modal';

        return strEvent;

    }

    // Given agenda item's reward given item's index
    _helpers.agendaReward = function(rewards, index) {

        if(!rewards)
            throw new Error("No agenda item rewards defined!");

        return rewards[index];

    }

    // Get ordinal affix for number
    _helpers.ordinalPosition = function(index) {
        
        var affixes = ["th","st","nd","rd"],
        remainder = (index+1) % 100;

       return (index+1) + (affixes[(remainder - 20) % 10] || affixes[remainder] || affixes[0]);
    
    }

    // Get number sign (if number is negative, positive, or zero) as string
    _helpers.numSignString = function(number) {
        
        var type = 'positive';

        if(number === 0)
            type = 'zero';
        else if(number < 0)
            type = 'negative';

       return type;
    
    }

    // Get number sign (if number is negative, positive, or zero)
    _helpers.numSign = function(number) {
        var type = '';

        if(number > 1)
            type = '+';
        else if(number < 0)
            type = '-';

       return type + number;
    
    }

    return _helpers;


};