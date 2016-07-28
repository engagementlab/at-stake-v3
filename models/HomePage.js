/**
 * @Stake v3
 * 
 * HomePage Model
 * @module homepage
 * @class homepage
 * @author Johnny Richardson
 * 
 * For field docs: http://keystonejs.com/docs/database/
 *
 * ==========
 */
var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * HomePage Model
 * ==========
 */

var HomePage = new keystone.List('HomePage', {
    
    label: 'Home Page',
    singular: 'Home Page',
    nodelete: true

});

HomePage.add({
    
    name: { type: String, default: 'Home Page Content', hidden: true },
		introText: { type: Types.Markdown, label: 'Intro', required: true, initial: true }

});

/**
 * Registration
 */
 HomePage.defaultColumns = 'name';
 HomePage.register();
