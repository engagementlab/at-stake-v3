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
    app.get('/play/:accesscode/:debug?', routes.views.decider.game);
    
    app.post('/login', routes.views.game.player);
    // API Endpoints
    app.get('/api/generate', keystone.middleware.api, routes.api.gamesession.generate);
    app.post('/api/create', keystone.middleware.api, routes.api.gamesession.create);
    app.post('/api/load', keystone.middleware.api, routes.api.templates.load);

};
