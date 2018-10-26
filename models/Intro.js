/**
 * @Stake v3
 * 
 * Intro Model
 * @module models
 * @class Intro
 * @author Johnny Richardson
 * 
 * ==========
 */
"use strict";

var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Intro Model
 * ==========
 */
var Intro = new keystone.List('Intro', {
    label: 'Intro Text',
    singular: 'Intro Text',
});
/**
 * Model Fields
 * @main Intro
 */
Intro.add({
    
    text: { type: Types.TextArray, label: "Intro Text", note: "One string per screen.", required: true, initial: true },
    dateCreated: { type: Date, noedit: true }

});


Intro.schema.pre('save', function(next) {
  
  this.dateCreated = new Date();

  next();

});

/**
 * Registration
 */
Intro.register();
exports = module.exports = Intro;
