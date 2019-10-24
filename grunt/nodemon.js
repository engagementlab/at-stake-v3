module.exports = function(grunt, options) {

	var ignoreFilter = ['../node_modules/.git/', '../node_modules/node_modules/', '../client/'];
	// var watchFilter = [];
	// var fs = require('fs');

	return {
	
		debug: {
			script: 'app.js',
			options: {
				nodeArgs: ['--inspect'],
				verbose: true,
				env: {
					port: 3000
				}
			}
		},

		serve: {
			script: 'app.js',
			options: {
				nodeArgs: ['--inspect'],
				verbose: true,
				ignore: ignoreFilter,
				ext: "js,hbs",
                callback: function (nodemon) {
                    nodemon.on('log', function (event) {
                    console.log(event.colour);
                    });
                    nodemon.on('restart', function (event) {
                    console.log('node restarted');
                    });
                },
			}
		}

	}

};
