/* global wunderlist */
wunderlist.frontend.search = (function($, wunderlist, html, undefined){
  "use strict";

  var cancelEditTask = false;
  var focusSearch    = 0;


  function clear() {
    $('#search').val('');
  }


  function search(e) {
    var value = $(e.target).val();
    if(e.keyCode == 13) {
      if(value !== '') {
        wunderlist.database.search(value);
        html.make_timestamp_to_string();
      } else {
        wunderlist.frontend.lists.openList(1);
      }
    } else if(value !== '') {
      $("a.list").droppable({ disabled: false });
      wunderlist.database.search(value);
      html.make_timestamp_to_string();
    } else {
      if(focusSearch === 0){
        wunderlist.frontend.lists.openList(1);
      }   
    }

    $('#left a').removeClass('active');
  }

  function init() {
    // Empty Input Field
    $(".searchside .clearsearch").click(function() {
      wunderlist.frontend.lists.openList(1);
      $("input#search").val('').blur();
    });

    // Bind search
    $("input#search").keyup(search);
  }


  return {
    "init": init,
    "clear": clear
  };
})(jQuery, wunderlist, html);