/* global wunderlist, jQuery */
wunderlist.helpers.list = (function(wunderlist, undefined){
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
  function insertPhase2(callback){
    instance.version = 0;
    instance.name = wunderlist.helpers.utils.convertString(instance.name, 255);

    var list = {};
    for (var property in instance) {
      var value = instance[property];
      if ((typeof value).match(/^(number|string|boolean)$/)) {
        if (wunderlist.helpers.utils.in_array(property, properties) === true) {
          list[property] = value;
        }
      }
    }
    wunderlist.database.createListByOnlineId(0, list.name, 0, list.position, 0, 0, 0, callback);
  }

  function insert (callback) {
    if (typeof instance.name !== 'string' || instance.name.length === 0) {
      callback(new Error("Invalid name for the list"));
      return;
    }

    if (typeof instance.position === 'undefined'){
      wunderlist.database.getLastListPosition(function(err, position){
        instance.position = position;
        insertPhase2(callback);
      });
    } else {
      insertPhase2(callback);
    }
  }

  // UPDATE the database list object
  function update(noVersion, callback) {
    var data = {
      version: (noVersion ? "": "version + 1")
    };
    for(var prop in instance){
      if(typeof instance[prop] !== 'undefined'){
        data[prop] = instance[prop];
      }
    }
    wunderlist.database.updateByMap('lists', data, "id="+instance.id, callback);
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
    "setDefaults": setDefaults
  };

  return self;

})(wunderlist);