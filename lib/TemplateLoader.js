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

const fs = require('fs'),
      handlebars = global.hbsInstance, 
      rootDir = __dirname + '/../templates/';

class TemplateLoader {

    constructor(gameType) {
        
        this.gameType = gameType;
    }

    Load(filePath, data, callback) {

        if(!data) 
            data = {};

        // Apply game type to all template input data
        data.gameType = this.gameType;

        logger.info('TemplateLoader', 'Loading ' + rootDir + filePath + '.hbs');

        handlebars
        .render(rootDir + filePath + '.hbs', data)
        .then(function(res) {
            
            callback(res);

        })
        .catch(function(err) {
            console.error("TemplateLoader ERROR:", {
                error: err, 
                file: rootDir + filePath + '.hbs'
            });
        });

    }

}

module.exports = TemplateLoader;