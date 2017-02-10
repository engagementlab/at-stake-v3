/**
 * @Stake Website
 * 
 * Homepage Model
 * @module Homepage
 * @class Homepage
 * @author Matt Benson
 * 
 * For field docs: http://keystonejs.com/docs/database/
 *
 * ==========
 */

var keystone = require('keystone');
var Types = keystone.Field.Types;

var TeamMembers = new keystone.List('TeamMembers', 
	{
		label: 'Team Members',
		singular: 'Team Member',
		track: true
	});

TeamMembers.add({
	name: { 
 		type: String, 
 		required: true,
 		initial: true
 	}
});

TeamMembers.defaultSort = '-createdAt';
TeamMembers.defaultColumns = 'name, updatedAt';
TeamMembers.register();
exports = module.exports = TeamMembers;