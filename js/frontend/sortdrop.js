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
    "makeSortable": makeSortable
  };

})(jQuery, wunderlist, html);