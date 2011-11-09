/* global wunderlist, jQuery */
wunderlist.task = (function($, wunderlist, undefined){
  "use strict";


  // Instance object
  // TODO: take a decision if this should be an object or a class
  // A class can bind itself to dom nodes MVC style
  var instance = {}, self;

  // fields in the task object
  var properties = ['list_id', 'online_id', 'name', 'note', 'date', 'important', 'position', 'deleted', 'done', 'done_date'];

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

  // INSERT a new database task object
  function insert (callback) {
    wunderlist.database.insertTask(callback);
  }

  // UPDATE the database task object
  function update(noVersion, callback) {
    wunderlist.database.updateTask(noVersion, callback);
  }

  // Reset the task object to defaults
  function setDefaults() {
    instance.id = undefined;
    for(var i = 0, count = properties.length; i < count; i++){
      instance[properties[i]] = undefined;
    }
  }

  // Initial the task object for first time
  setDefaults();

  return {
    "properties": properties,
    "insert": insert,
    "update": update,
    "setDefault": setDefaults
  };

})(jQuery, wunderlist);

var task = wunderlist.task;


// UPDATE the task done status in HTML
task.updateDone = function() {
  if (task.id !== undefined && task.id > 0 && task.done !== undefined) {
    var liElement = $('li#' + task.id), 
        lastLiElement, firstDoneLiElement, doneLiElementCount,  
        ulElement = 'ul.mainlist';
    
    if (task.done === 1) {
      liElement.addClass('done');

      // If it is not the search / filter site, create a done list at the bottom
      if ($('ul.searchlist').length === 0 && $('ul.filterlist').length === 0) {
        if ($("ul#donelist_list_today").length === 0) {
          $("ul.mainlist").after("<h3 class='head_today'>" + wunderlist.language.data.done_today + "</h3>");
          $("div#content h3.head_today").after("<ul id='donelist_list_today' class='donelist'></ul>");
        }

        liElement.slideUp('fast', function() {
          liElement.prependTo('ul#donelist_list_today').slideDown();
        });
      }
      // On the search list, just append the checked task to the end of the searchlist
      else if ($('ul.searchlist').length > 0) {
        // Get the last searched task
        lastLiElement = liElement.parent('ul.searchlist').find('li:last');        
        
        if (liElement.attr('id') != lastLiElement.attr('id')) {
          liElement.slideUp('fast', function() {
            liElement.appendTo('ul.searchlist').slideDown();
          });
        }
      }
      // On the filter and search list, just append the checked task to the end of the parent filterlist
      else {
        // Get the last task
        lastLiElement = liElement.parent('ul.filterlist').find('li:last');        
        
        if (liElement.attr('id') != lastLiElement.attr('id')) {
          liElement.slideUp('fast', function() {
            liElement.appendTo('ul#filterlist' + liElement.attr('rel')).slideDown();
          });
        }
      }
    }

    if (task.done === 0) {
      if ($('a#done').hasClass('active')) {
        if (liElement.parent('ul.filterlist').find('li').length === 1) {
          liElement.parent().prev().remove();
          liElement.parent().remove();
        }
        
        liElement.remove();
        return;
      }

      if (liElement.parent('ul.donelist').find('li').length === 1) {
        liElement.parent().prev().remove();
        liElement.parent().remove();
      }

      
      if ($('ul.filterlist').length > 0 || $('ul.searchlist').length > 0) {
        var parentElement = liElement.parent($('ul.filterlist').length > 0 ? 'ul.filterlist' : 'ul.searchlist');
        
        // Get the last task
        lastLiElement      = parentElement.find('li:last');
        firstDoneLiElement = parentElement.find('li.done:first');
        doneLiElementCount = parentElement.find('li.done').length;
        
        ulElement = $('ul.filterlist').length > 0 ? 'ul#filterlist' + liElement.attr('rel') : 'ul.searchlist';
      }
      
      if (doneLiElementCount !== undefined) {
        if (doneLiElementCount > 1) {
          if (liElement.attr('id') == lastLiElement.attr('id') || 
             (liElement.attr('id') != lastLiElement.attr('id') && 
             liElement.attr('id') != firstDoneLiElement.attr('id'))) {
            liElement.slideUp('fast', function() {
              if (liElement.find('span.fav').length === 1){
                liElement.prependTo(ulElement).slideDown();
              } else {
                liElement.insertBefore(firstDoneLiElement).slideDown();
              }
            });
          }
        }
      } else {
        liElement.slideUp('fast', function() {
          if(liElement.find('span.fav').length === 1){
            liElement.prependTo(ulElement).slideDown();
          } else {
            liElement.appendTo(ulElement).slideDown();
          }
        });
      }
            
      liElement.removeClass('done');
      html.make_timestamp_to_string();
      
      liElement.children('input.datepicker').remove();
      liElement.children('img.ui-datepicker-trigger').remove();
      
      if (liElement.children('span.showdate').length === 0) {
        datepickerHTML = '<input type="hidden" class="datepicker" value="0"/>';
        $(datepickerHTML).insertAfter(liElement.children('span.description'));
      }
      
      html.createDatepicker();
    }
  }
};

// UPDATE the positions of all tasks
task.updatePositions = function() {
    // Get all tasks from current list
    var tasks = $("#content .mainlist li");
    i = 0;

    // Call async function to update the position
    jQuery.eachAsync(tasks, {
        delay : 0,
        bulk  : 0,
        loop  : function() {        
            task.id       = tasks.eq(i).attr("id");
            task.position = i + 1;
            task.list_id  = tasks.eq(i).attr('rel');
            update();
            i++;
        }
    });
};

// UPDATE the task priority in HTML
task.updateImportant = function() {
  if (task.important !== undefined && task.id !== undefined && task.id > 0) {
    var taskElement = $('li#' + task.id);
    var ulElement   = taskElement.parent('ul');
    var item;
    
    if (task.important === 0) {
      // Get the last important task
      item = ulElement.find('span.fav:last').parent();

      taskElement.children('span.fav').addClass('favina').removeClass('fav');

      if(taskElement.attr('id') !== item.attr('id') && ulElement.children('li').length > 1) {
        taskElement.slideUp('fast', function() {
          taskElement.insertAfter(item).slideDown(400, task.updatePositions);
        });
      }
    }

    if (task.important === 1) {
      // Get the first task
      item = ulElement.find('li:first');
      
      taskElement.children('span.favina').removeClass('favina').addClass('fav');
      
      if (ulElement.children('li').length > 1 && taskElement.attr('id') !== item.attr('id')) {
        taskElement.slideUp('fast', function() {
          taskElement.prependTo(ulElement).slideDown(400, task.updatePositions);
        });
      }
    }
  }
};

// UPDATE the task list_id
task.updateList = function() {
  if (task.id !== undefined && task.id > 0 && task.list_id !== undefined && task.list_id > 0) {
    var liElement = $('li#' + task.id);
    var oldListId = liElement.attr('rel');
    var newListId = task.list_id.toString();
    
    if (oldListId !== task.list_id) {      
      if ($('ul.filterlist').length === 0) {
        liElement.remove();
      } else {
        var ulElement = $('ul#filterlist' + oldListId.toString());
        
        if (taskDroped === true) {
          if ($('ul#filterlist' + task.list_id).is('ul')) {
            if (liElement.find('span.fav').length === 1) {
              setTimeout(function() {
                liElement.appendTo('ul#filterlist' + newListId).slideDown();
              }, 10);
            } else {
              setTimeout(function() {
                liElement.appendTo('ul#filterlist' + newListId).slideDown();
              }, 10);        
            }
          } else {
            listHTML  = '<h3 class="clickable cursor" rel="' + task.list_id + '">' + $('a#list' + task.list_id + ' b').text() + '</h3>';
            listHTML += '<ul id="filterlist' + task.list_id + '" rel="' + ulElement.attr('rel') + '" class="mainlist sortable filterlist"></ul>';
            
            $('div#content').append(listHTML);
            
            setTimeout(function() {
              liElement.appendTo('ul#filterlist' + newListId).slideDown();
            }, 10);
            
            makeSortable();
          }
            
          taskDroped = false;
        }
        
        setTimeout(function() {
          var liCount = ulElement.children('li').length;        
          if (liCount === 0) {
            // Remove list headline title and the ul element
            ulElement.prev().remove();
            ulElement.remove();
          }
        }, 10);
      }
      
      liElement.attr('rel', task.list_id);
    }
  }
};

// UPDATE the task deleted status in HTML
task.updateDeleted = function() {
  // Deleted was set
  if (task.deleted !== undefined && task.deleted === 1 && task.id !== undefined && task.id > 0 && task.list_id !== undefined && task.list_id > 0) {
    var removeList = false;
    var liElement  = $('li#' + task.id);
    var ulElement  = liElement.parent('ul');
    
    if (ulElement.hasClass('filterlist') && ulElement.children('li').length === 1) {
      if (ulElement.children('li').length === 0) {
        removeList = true;
      }
    } else {
      if (liElement.find('.checked').length === 1) {
        removeList = true;
      }
    }
    
    if (removeList === true) {
      var hElement = ulElement.prev();
  
      if (hElement.is('h3')){
        hElement.remove();
      }

      ulElement.remove();
    }

    liElement.remove();
    
    notes.closeNoteWindow(task.id);
  }
};
