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

    _helpers.ellipsis = function (limit, currentText) {
            if (currentText) {
              console.log (currentText, "current text");
              return currentText.substr(0, limit) + "...";
            }
    }

    _helpers.namePossessive = function (strName) {
        
        return ( strName.charAt(strName.length-1) === 's' ) ? strName + "'" : strName + "'s";

    }

    // Concatenate two strings (combine is alias)
    _helpers.combine = _helpers.concat = function(str, str2) {

        return str + str2;

    }

    return _helpers;


};