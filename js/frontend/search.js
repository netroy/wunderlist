/* global wunderlist */
wunderlist.frontend.search = (function($, wunderlist, html, undefined){
  "use strict";

  var focusSearch = 0;
  var searchBox;

  function clear() {
    searchBox.val('');
  }


  function search(e) {
    var value = $(e.target).val();
    if(e.keyCode === 13) {
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
    searchBox = $("#search");
    // Empty Input Field
    $(".searchside .clearsearch").click(function() {
      wunderlist.frontend.lists.openList(1);
      searchBox.val('').blur();
    });

    // Bind search
    searchBox.keyup(search);
  }


  return {
    "init": init,
    "clear": clear
  };
})(jQuery, wunderlist, html);