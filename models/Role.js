/**
 * @Stake v3
 * 
 * Role Model
 * @module models
 * @class Role
 * @author Johnny Richardson
 * 
 * ==========
 */
"use strict";

var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Role Model
 * ==========
 */
var Role = new keystone.List('Role', {
    track: true,
    map: { name: 'title' }
});

/**
 * Model Fields
 * @main Role
 */
Role.add(
	{

		title: { type: String, required: true, initial: true },
		bio: { type: Types.Markdown, required: true, initial: true },
		agendaItems: { type: Types.TextArray },
		icon: { type: Types.CloudinaryImage, label: 'Unique icon'},
		dateCreated: { type: Date, noedit: true }

	}

);


Role.schema.pre('save', function(next) {
  
  this.dateCreated = new Date();

  next();

});

Role.defaultColumns = 'name';

/**
 * Registration
 */
Role.register();
exports = module.exports = Role;
