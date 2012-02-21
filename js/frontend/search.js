/* global wunderlist */
wunderlist.frontend.search = (function($, wunderlist, undefined){

  "use strict";

  var focusSearch = 0;
  var searchBox;

  function clear() {
    searchBox.val('');
  }


  function renderResults(query, rows) {
    var content = $("#content").empty();
    var h1 = $("<h1/>");
    if(rows.length > 0) {
      content.append(h1.html(wunderlist.language.data.search_results + ": " + query));
      var ul = $("<ul id='list' class='mainlist searchlist'></ul>"), row;
      content.append(ul);
      for(var i=0, l=rows.length; i<l; i++) {
        row = rows[i];
        ul.append(wunderlist.helpers.html.generateTaskHTML(row.id, row.name, row.list_id, row.done, row.important, row.date, row.note));
      }
      wunderlist.helpers.html.make_timestamp_to_string();
    } else {
      content.append(h1.html(wunderlist.language.data.no_search_results + ": " + query));
    }
  }


  var lastSearch;
  function search(e) {

    var value = searchBox.val();
    if(e.keyCode === 27) {
      // Clear on ESC key & go to the last open list
      clear();
      wunderlist.frontend.lists.openList();
    } else if(value === lastSearch) {
      // Ignore if the keystroke(s) didn't alter the search query
      return;
    } else if(value !== '') {
      $("a.list").droppable({ disabled: false });
      wunderlist.database.search(value, function(err, rows) {
        lastSearch = value;
        renderResults(value, rows);
      });
    } else {
      if(focusSearch === 0) {
        wunderlist.frontend.lists.openList();
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

})(jQuery, wunderlist);