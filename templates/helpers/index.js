'use strict';

var hbs = require('handlebars');

module.exports = function() {

    var _helpers = {};

    /**
     * @Stake v3 HBS Helpers
     * ===================
     */


    //  ### less than checker
    _helpers.iflt = function(a, b, options) {

        if (a < b) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }

    };

    // run a function
    _helpers.runFunction = function(funcName) {

        eval(funcName);

        return null;

    };

    //  ### int addition helper
    // Used for increasing int by amount
    //
    //  @amt: Amount to offset
    //
    //  *Usage example:*
    //  `{{sum @index 3}}

    _helpers.sum = function(ind, amt) {
 
        return parseInt(ind) + amt;

    };

    //  ### int multiplier helper
    // Used for multiplying int by factor
    //
    //  @factor: Factor to multiply by
    //
    //  *Usage example:*
    //  `{{multiply 3 @index}}

    _helpers.multiply = function(ind, factor) {
 
        return parseInt(ind) * parseInt(factor);

    };

    // Remove <p> tag from html string
    _helpers.removePara = function (str) {

        if(!str)
            return '';

        str = str.replace (/<p>/g, '').replace (/<\/p>/g, '');
        return str;

    };

    // Get time in minutes for provided seconds
    _helpers.getMinutes = function (strSeconds) {

        var intSeconds = parseInt(strSeconds);
        var secondsRemainder = (intSeconds % 60);
        var displaySeconds = (secondsRemainder < 10) ? ("0" + secondsRemainder) : secondsRemainder;  

        return Math.round(intSeconds / 60) + ':' + displaySeconds; 

    };

    _helpers.ordinalPosition = function(index) {
        
        var affixes = ["th","st","nd","rd"],
        remainder = (index+1) % 100;

       return (index+1) + (affixes[(remainder - 20) % 10] || affixes[remainder] || affixes[0]);
    
    }

    _helpers.ellipsis = function (limit, currentText) {
            if (currentText) {
              console.log (currentText, "current text");
              return currentText.substr(0, limit) + "...";
            }
    }

    _helpers.namePossessive = function (strName) {
        
        return ( strName.charAt(strName.length-1) === 's' ) ? strName + "'" : strName + "'s";

    }

    return _helpers;


};