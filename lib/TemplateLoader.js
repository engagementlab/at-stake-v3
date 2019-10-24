    'use strict';

/**
 * @Stake v4
 * Developed by Engagement Lab, 2016-2019
 * ==============
 * Template loader.
 *
 * @class lib
 * @static
 * @author Johnny Richardson
 *
 * ==========
 */

const rootDir = __dirname + '/../templates/';

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

        // Banish HBS!
        /* handlebars
        .render(rootDir + filePath + '.hbs', data)
        .then(function(res) {
            
            callback(res);

        })
        .catch(function(err) {
            console.error("TemplateLoader ERROR:", {
                error: err, 
                file: rootDir + filePath + '.hbs'
            });
        }); */
        callback(data);

    }

}

module.exports = TemplateLoader;