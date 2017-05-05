/**
 * @Stake v3
 * Developed by Engagement Lab, 2015
 * ==============
 * Home page view controller.
 *
 * Help: http://keystonejs.com/docs/getting-started/#routesviews-firstview
 *
 * @class index
 * @static
 * @author Johnny Richardson
 *
 * ==========
 */
var keystone = require('keystone'),
    GameConfig = keystone.list('GameConfig'),
    Homepage = keystone.list('Homepage');

exports = module.exports = function(req, res) {

    var view = new keystone.View(req, res);
    var locals = res.locals;

    locals.section = 'homepage';

		// Query to get current game config data
    var queryConfig = GameConfig.model.findOne({}, {}, {
      sort: {
          'createdAt': -1
      }
    });

    // var queryHomepage = Homepage.model.findOne({}, {}, {
    //   sort: {
    //       'createdAt': -1
    //   }
    // }).populate("principalInvestigator");

    var queryHomepage = Homepage.model.findOne({}, {}, {
      sort: {
          'createdAt': -1
      }
    });

    queryConfig.exec(function(err, resultConfig) {

	  	// If game is enabled, get home page content
	    queryHomepage.exec(function(err, resultHomepage) {
	    
	    	locals.content = resultHomepage;
			  
			  // Render the view
		    view.render('index');

		  });
		 

    });


};
