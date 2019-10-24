module.exports = function(grunt, options) {

  "use strict";

  const sass = require('node-sass');
  var destPath = __dirname + '/../public/styles/core.css';
  var srcPath = __dirname + '/../public/styles/core.scss';

	var dist = {
    options: {
      style: 'expanded',
      trace: true,
      sourceMap: true,
			implementation: sass
    },
    files: {
      
    }
  }

  dist.files[destPath] = srcPath;

  return {'dist': dist};

};
