/* @Stake v3 */
/**
 * Route definitions
 *
 * @module routes
 **/
var keystone = require('keystone');
var middleware = require('./middleware');
var importRoutes = keystone.importer(__dirname);

// Import Route Controllers
var routes = {
    api: importRoutes('./api'),
    views: importRoutes('./views')
};

// Setup Route Bindings
exports = module.exports = function(app) {

    app.all('/*', keystone.middleware.cors);

    // Views
    app.get('/', routes.views.index);
    app.get('/play/:debug?', routes.views.game.play);
    app.post('/game', routes.views.game.player);

    app.get('/new', routes.views.decider.index);
    app.get('/game/:accesscode/:debug?', routes.views.decider.game);
    
    app.post('/api/create', keystone.middleware.api, routes.api.gamesession.create);
    app.post('/api/load', keystone.middleware.api, routes.api.templates.load);
    
    // app.post('/login', routes.views.user.login);

  	// app.all('/api/gameuser/create', keystone.initAPI, routes.api.gameusers.create);


};
