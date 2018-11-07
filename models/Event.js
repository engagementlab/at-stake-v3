/**
 * @Stake v3
 * 
 * Event Model
 * @module models
 * @class Event
 * @author Johnny Richardson
 * 
 * ==========
 */
"use strict";

var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Event Model
 * ==========
 */
var Event = new keystone.List('Event', {
    label: 'Event',
    map: { name: 'text' }
});
/**
 * Model Fields
 * @main Event
 */
Event.add({
    
    text: { type: String, label: "Event Text", required: true, initial: true },
    dateCreated: { type: Date, noedit: true }

});


Event.schema.pre('save', function(next) {
  
  this.dateCreated = new Date();

  next();

});

/**
 * Registration
 */
Event.register();
exports = module.exports = Event;
