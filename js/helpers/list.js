/* global wunderlist, jQuery */
wunderlist.helpers.list = (function($, wunderlist, undefined){
  "use strict";


  // Instance object
  // TODO: take a decision if this should be an object or a class
  // A class can bind itself to dom nodes MVC style
  var instance = {}, self;

  // fields in the list object
  var properties = ['online_id', 'name', 'position', 'deleted', 'shared', 'inbox'];

  // Set values on the instance
  function set(map){
    for(var prop in map) {
      // set only if property by that name already exists
      if(instance.hasOwnProperty(prop)) {
        instance[prop] = map [prop];
      }
    }
    return self;
  }

  // INSERT a new database list object
  function insert (callback) {
    wunderlist.database.insertList(instance, callback);
  }

  // UPDATE the database list object
  function update(noVersion, callback) {
    wunderlist.database.updateList(noVersion, instance, callback);
  }

  // Reset the list object to defaults
  function setDefaults() {
    instance.id = undefined;
    for(var i = 0, count = properties.length; i < count; i++){
      instance[properties[i]] = undefined;
    }
  }

  // Initial the list object for first time
  setDefaults();

  self = {
    "properties": properties,
    "insert": insert,
    "update": update,
    "set": set,
    "setDefault": setDefaults
  };

  return self;

})(jQuery, wunderlist);