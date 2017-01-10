/**
 * @Stake v3
 * 
 * Website Model
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
 * Website Model
 * ==========
 */

var Website = new keystone.List('Website', {
    
    label: 'Home Page',
    singular: 'Home Page',
    nodelete: true

});

Website.add({
    
    name: { type: String, default: 'Home Page Content', hidden: true },
    header: { type: String, default: 'At Stake' },
		text: { type: Types.Markdown, label: 'Text' }

});

/**
 * Registration
 */
 Website.defaultColumns = 'name';
 Website.register();
