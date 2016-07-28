/**
 * @Stake v3
 * 
 * Deck Model
 * @module models
 * @class Deck
 * @author Johnny Richardson
 * 
 * ==========
 */
"use strict";

var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Deck Model
 * ==========
 */
var Deck = new keystone.List('Deck', {
    track: true
});

/**
 * Model Fields
 * @main Deck
 */
Deck.add({

	name: { type: String, required: true, initial: true },
	description: { type: String, required: true, initial: true },
	questions: { type: Types.TextArray },
	roles: {
		      type: Types.Relationship,
		      ref: 'Role',
		      many: true,
		      required: true,
		      initial: true,
		      label: 'Roles'
	},
  dateCreated: { type: Date, noedit: true }

});


Deck.schema.pre('save', function(next) {
  
  this.dateCreated = new Date();

  next();

});

Deck.defaultColumns = 'name, description';

/**
 * Registration
 */
Deck.register();
exports = module.exports = Deck;
