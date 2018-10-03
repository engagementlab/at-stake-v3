/* @Stake v3 */
/**
 * Route definitions
 *
 * @module routes
 **/
var express = require('express');
var router = express.Router();
var keystone = require('keystone');
var middleware = require('./middleware');
var importRoutes = keystone.importer(__dirname);

// Import Route Controllers
var routes = {
    api: importRoutes('./api'),
    views: importRoutes('./views')
};

// Setup Route Bindings
router.all('/*', keystone.middleware.cors);

// Views
router.get('/', routes.views.index);
router.get('/play/host/:accesscode/:debug?', routes.views.decider.game);
router.get('/play/:accesscode?/:username?/:mode?', routes.views.game.play);

router.post('/login', routes.views.game.player);
// API Endpoints
router.get('/api/generate', keystone.middleware.api, routes.api.gamesession.generate);
router.post('/api/create', keystone.middleware.api, routes.api.gamesession.create);
router.post('/api/load', keystone.middleware.api, routes.api.templates.load);

module.exports = router;