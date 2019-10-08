    'use strict';

/**
 * @Stake v3
 * Developed by Engagement Lab, 2016-2017
 * ==============
 * Template loader.
 *
 * @class lib
 * @static
 * @author Johnny Richardson
 *
 * ==========
 */

var fs = require('fs');
var handlebars = require('keystone').get('handlebars');

class TemplateLoader {

    constructor(gameType) {
        
        this.gameType = gameType;
    }

    Load(filePath, data, callback) {

        if(!data) 
            data = {};

        // Apply game type to all template input data
        data.gameType = this.gameType;

        logger.info('TemplateLoader', 'Loading ' + rootDir + '/templates/' + filePath + '.hbs');

        handlebars
        .render(rootDir + '/templates/' + filePath + '.hbs', data)
        .then(function(res) {
          
            callback(res);

        })
        .catch(function(err) {

            console.error("TemplateLoader ERROR:", {
                                                    error: err, 
                                                    file: rootDir + '/templates/' + filePath + '.hbs'
                                                   });

        });

    }


}

module.exports = TemplateLoader;