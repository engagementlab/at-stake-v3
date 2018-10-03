/**
 * @Stake v3
 * Developed by Engagement Lab, 2015
 * ==============
 * Game entry view controller.
 *
 * Help: http://keystonejs.com/docs/getting-started/#routesviews-firstview
 *
 * @class game
 * @static
 * @author Johnny Richardson
 *
 * ==========
 */

var keystone = require('keystone');

exports = module.exports = function(req, res) {

  var view = new keystone.View(req, res);
  var locals = res.locals;

  // locals.section is used to set the currently loaded view
  locals.section = 'play';

  // Save host to allow path specification for socket.io
  locals.socketHost = req.headers.host;
  if(process.env.NODE_ENV !== 'development')
    locals.socketHost = ( (process.env.NODE_ENV === 'staging') ? 'qa.' : '')  +  'atstakegame.org';

  // Enable debugging on staging/dev only
  if(process.env.NODE_ENV !== 'production') {
    if(req.params.mode === 'debug')
      locals.debug = true;

    // Has access code/username in URL? (testing)
    if(req.params.accesscode) 
      locals.accesscode = req.params.accesscode;
    if(req.params.username) 
      locals.username = req.params.username;
  }
  else if(req.params.mode === 'mobile')
    locals.mobile = true;


  view.on('init', function(next) {
    next();
  });

  // Render the view
  view.render('game/player');

};
