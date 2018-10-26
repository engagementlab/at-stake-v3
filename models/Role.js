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
    map: { name: 'title' }
});

/**
 * Model Fields
 * @main Role
 */
Role.add(
	{

		title: { type: String, required: true, initial: true },
		isFacilitator: { type: Boolean, note: "Only one facilitator needs to exist across all decks." },
		bio: { type: Types.Markdown, note: "(Instructions for facilitator)" },
		needs: { type: Types.TextArray, dependsOn: { isFacilitator: false } },
		secretGoal: { type: String, dependsOn: { isFacilitator: false } },
		icon: { type: Types.CloudinaryImage, label: 'Unique icon'},
		dateCreated: { type: Date, noedit: true }

	}

);


Role.schema.pre('save', function(next) {
  
  this.dateCreated = new Date();

  next();

});

Role.defaultColumns = 'title, isFacilitator';

/**
 * Registration
 */
Role.register();
exports = module.exports = Role;
