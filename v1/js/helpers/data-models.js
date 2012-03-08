/* globals wunderlist */
(function(wunderlist, undefined){

  "use strict";

  function model(_type, _properties){
    var properties = _properties,
        type = _type;
    
    var instance = {}, self;

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

      var obj = {};
      for (var property in instance) {
        var value = instance[property];
        if ((typeof value).match(/^(number|string|boolean)$/)) {
          if (wunderlist.helpers.utils.in_array(property, properties) === true) {
            obj[property] = value;
          }
        }
      }

      if(type === 'list') {
         wunderlist.database.createListByOnlineId(0, obj.name, 0, obj.position, 0, 0, 0, callback);
      } else if(type === 'task') {
        wunderlist.database.createTaskByOnlineId(0, obj.name, 0, 0, obj.list_id, obj.position, 0, 0, 0, 0, '', callback);
      }
    }

    function insert (callback) {
      if (typeof instance.name !== 'string' || instance.name.length === 0) {
        return callback(new Error("Invalid name for the " + type));
      }

      if (typeof instance.position === 'undefined'){
        if(type === 'list') {
          wunderlist.database.getLastListPosition(function(err, position){
            instance.position = position;
            insertPhase2(callback);
          });
        } else if(type === 'task') {
          wunderlist.database.getLastTaskPosition(instance.list_id, function(err, position){
            instance.position = position;
            insertPhase2(callback);
          });
        }
      } else {
        insertPhase2(callback);
      }
    }

    // UPDATE the database list object
    function update(noVersion, callback) {
      var data = {
        version: (noVersion ? "": "version + 1")
      };

      callback = callback || wunderlist.nop;

      for(var prop in instance){
        if(typeof instance[prop] !== 'undefined'){
          data[prop] = instance[prop];
        }
      }

      wunderlist.database.updateByMap( type + 's', data, "id="+instance.id, function(){
        callback(instance);
      });
    
      return self;
    }

    // Reset the list object to defaults
    function setDefaults() {
      instance.id = undefined;
      for(var i = 0, count = properties.length; i < count; i++){
        instance[properties[i]] = undefined;
      }
    }

    // Initial the task object for first time
    setDefaults();

    self = {
      "set": set,
      "setDefaults": setDefaults,
      "insert": insert,
      "update": update
    };

    return self;
  }

  wunderlist.helpers.list = model('list', ['online_id', 'name', 'position', 'deleted', 'shared', 'inbox']);
  wunderlist.helpers.task = model('task', ['list_id', 'online_id', 'name', 'note', 'date', 'important', 'position', 'deleted', 'done', 'done_date']);

})(wunderlist);
