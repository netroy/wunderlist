/* global wunderlist */
wunderlist.frontend.search = (function($, wunderlist, html, undefined){

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
        ul.append(html.generateTaskHTML(row.id, row.name, row.list_id, row.done, row.important, row.date, row.note));
      }
    } else {
      content.append(h1.html(wunderlist.language.data.no_search_results + ": " + query));
    }
  }


  function search(e) {

    var value = searchBox.val();

    if(e.keyCode === 13) {
      if(value !== '') {
        wunderlist.database.search(value, function(err, rows) {
          renderResults(value, rows);
        });

        html.make_timestamp_to_string();
      } else {
        wunderlist.frontend.lists.openList(1);
      }
    }

    /* else if(value !== '') {
      $("a.list").droppable({ disabled: false });
      wunderlist.database.search(value);
      html.make_timestamp_to_string();
    } else {
      if(focusSearch === 0){
        wunderlist.frontend.lists.openList(1);
      }
    }*/

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