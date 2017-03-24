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
            strClasses = 'player';

            // Is this component only visible to active players or not?
            if(attr.active_player !== undefined)
                strClasses += (attr.active_player === true) ? ' showing ACTIVE' : ' hiding ACTIVE';

            else if(attr.inactive_player !== undefined)
                strClasses += (attr.inactive_player === true) ? ' showing INACTIVE' : ' hiding INACTIVE';
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

    return _helpers;


};