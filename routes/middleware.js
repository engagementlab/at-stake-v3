/* @Stake v3 */
/**
 * Route middleware
 * This file contains the common middleware used by all routes. Extend or replace these functions as the application requires.
 *
 * @class middleware
 * @namespace routes
 * @constructor
 * @author Johnny Richardson
 * @static
 **/

exports.locals = function(req, res, next) {

    res.locals.env = process.env.NODE_ENV;
    next();

};