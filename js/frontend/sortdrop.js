wunderlist.frontend.sortdrop = (function($, wunderlist, html, undefined){
  "use strict";

  // TODO: This variable is public, it shouldn't be
  var taskDroped = false;

  /**
   * Makes all the lists a droppable element
   * @author Dennis Schneider, Christian Reber, Daniel Marschner
   */
  function makeListsDropable() {
      $('.list').droppable({
      accept : 'ul.mainlist li',
      hoverClass : 'hover',
      drop : function(e, ui) {
        var list_id  = $(this).attr('id').replace('list','');
        taskDroped = true;
        ui.draggable.hide('fast', function() {
          wunderlist.helpers.task.set({
            id: $(this).attr('id'),
            list_id: list_id
          }).updateList().update();
        });
      }
    });
  }


  /**
   * Make the filters starred, today and tomorrow droppable for tasks
   * @author Daniel Marschner
   */
  function makeFilterDropable() {
    $('a.filter').droppable({
      accept     : 'ul.mainlist li',
      hoverClass : 'droppable',
      drop       : function(ev, ui) {
        var taskID                 = ui.draggable.attr('id');
        var droppedTask            = $('li#' + taskID);
        var droppedTaskParent      = ($('ul.filterlist').length > 0 ? $('ul#filterlist' + droppedTask.attr('rel')) : $('ul#' + droppedTask.attr('rel')));
        var activeFilter           = droppedTaskParent.attr('rel');
        var droppedFilter          = $(this).attr('id');
        var today                  = html.getWorldWideDate();
        var tomorrow               = (today + 86400);
        var droppedTaskDate        = droppedTask.children('span.showdate');
        var droppedTaskDateInput   = droppedTask.children('input.datepicker');
        var droppedTaskDateTrigger = droppedTask.children('.ui-datepicker-trigger');
        var acceptFilter           = false;

        // UPDATE task by dropping on filter starred
        if (droppedFilter === 'starred') {
          acceptFilter = true;

          if (activeFilter !== 'starred' || !isNaN(parseInt(activeFilter, 10))) {
            if (droppedTask.children('span.favina').length === 1) {
              wunderlist.helpers.task.set({
                id: taskID,
                important: 1
              }).update();
              // TODO: updateImportant doesn't exist anymore ... fix this
              //}).updateImportant().update();
            }
          }
        }

        // UPDATE task by dropping on filter today
        if (droppedFilter === 'today') {
          acceptFilter = true;

          if (activeFilter !== 'today' || !isNaN(parseInt(activeFilter, 10))) {
            if (droppedTaskDate.hasClass('timestamp') === false || droppedTaskDate.attr('rel') !== today) {
              if (droppedTaskDate.length === 0) {
                droppedTaskDateInput.remove();
                droppedTaskDateTrigger.remove();
                droppedTask.children('.description').after('<span class="showdate timestamp" rel="' + today + '">&nbsp;</span>');
              } else {
                droppedTaskDate.addClass('timestamp').attr('rel', today);
              }

              wunderlist.helpers.task.set({
                id: taskID,
                date: today
              }).update();

              html.make_timestamp_to_string();
            }

          }
        }

        // UPDATE task by dropping on filter tomorrow
        if (droppedFilter === 'tomorrow') {
          acceptFilter = true;

          if (activeFilter !== 'tomorrow' || !isNaN(parseInt(activeFilter, 10))) {
            if (droppedTaskDate.hasClass('timestamp') === false || droppedTaskDate.attr('rel') !== tomorrow) {
              if (droppedTaskDate.length === 0) {
                droppedTaskDateInput.remove();
                droppedTaskDateTrigger.remove();
                droppedTask.children('.description').after('<span class="showdate timestamp" rel="' + tomorrow + '">&nbsp;</span>');
              } else {
                droppedTaskDate.addClass('timestamp').attr('rel', tomorrow);
              }

              wunderlist.helpers.task.set({
                id: taskID,
                date: tomorrow
              }).update();

              html.make_timestamp_to_string();
            }
          }
        }

        // UPDATE task by dropping on filter withoutdate
        if (droppedFilter === 'withoutdate') {
          acceptFilter = true;

          if (activeFilter !== 'withoutdate' || !isNaN(parseInt(activeFilter, 10))) {
            if (droppedTaskDate.hasClass('timestamp') === true) {
              droppedTaskDate.remove();
              droppedTask.children('.description').after("<input type='hidden' class='datepicker'/>");
              html.createDatepicker();

              wunderlist.helpers.task.set({
                id: taskID,
                date: 0
              }).update();
            }
          }
        }

        if ($('ul.filterlist').length > 0 && acceptFilter === true) {
          if ((droppedFilter !== 'starred' && activeFilter !== 'thisweek' && activeFilter !== 'all' && activeFilter !== droppedFilter) ||
              (activeFilter === 'thisweek' && droppedFilter === 'withoutdate')) {
            if (droppedTaskParent.children('li').length === 2) {
              droppedTaskParent.prev().remove();
              droppedTaskParent.remove();
            }
            droppedTask.remove();
          }
        }
      }
    });
  }


  /**
   * Makes the mainlist sortable
   * @author Dennis Schneider, Christian Reber, Daniel Marschner
   */
  function makeSortable() {
    // Sortable Tasks
    $("ul.sortable").sortable({
       scroll      : true,
       containment : 'document',
       delay       : 100,
       appendTo    : 'body',
       helper      : function() {
         return $("<div class='dragging'></div>");
       },
       cursorAt    : {top : 15, left : 15},
       cursor      : 'pointer',
       placeholder : 'placeholder',
       update      : function(e, ui) {
         wunderlist.frontend.tasks.syncPositionsToDB();
       }
    });
  }


  function init() {
    var body = $("body");
    var content = $('#content');
    body.mousemove(function(e) {
      if ($('.dragging').size() > 0) {
        var currentOffset = content.scrollTop();
        var height = body.height();
        if (e.pageY < 100) {
          content.scrollTop(currentOffset - 50);
        } else if (e.pageY > (height - 100)) {
          content.scrollTop(currentOffset + 50);
        }
      }
    });
  }


  return {
    "init": init,
    "makeListsDropable": makeListsDropable,
    "makeFilterDropable": makeFilterDropable,
    "makeSortable": makeSortable
  };

})(jQuery, wunderlist, html);