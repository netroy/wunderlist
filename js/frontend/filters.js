wunderlist.frontend.filters = (function(window, $, wunderlist, html, Titanium, undefined){
  "use strict";

  var bottomBarLeft, today, overdue, notifications;

  /**
   * Add class="active" on filters
   * @author Dennis Schneider
   */
  function setActiveState(node) {
    $('a', bottomBarLeft).removeClass('active');
    $('.list').removeClass('ui-state-disabled');
    $(node).addClass('active');
  }

  /**
   * Removes class="active" on filters
   * @author Christian Reber
   */
  function clearActiveStates(e) {
    $('a', bottomBarLeft).removeClass('active');
  }

  /**
   * Creates those tiny little red badges on the filters and on the Dock Icon (only on Mac OS X)
   * to remind the user of "overdue" and "today" tasks
   * TODO: Has to be updated, because of a freaky badge count behaviour. 
   * If a sort a task, the badge will hide/show for every task in the list.
   * @author Dennis Schneider, Christian Reber
   */
  function updateBadgesInfo(todaycount, overduecount){ 
    var todayBadges = $('span', today), overdueBadges = $('span', overdue);
    var lists = $("#lists"), note = $("#note");

    if(todayBadges.length === 0) {
      todayBadges = today.append('<span>' + todaycount + '</span>').find("span");
    } else {
      todayBadges.text(todaycount);
      //todayBadges.fadeOut('fast').fadeIn('fast');
      lists.css("bottom","74px");
      note.css("bottom","74px");
    }

    var overdue_text;
    if(overduecount > 0) {
      overdue_text = (overduecount > 1)? wunderlist.language.data.overdue_text_pl : wunderlist.language.data.overdue_text_sl;
      overdue_text = overduecount + ' ' + overdue_text;
      notifications.fadeIn('fast');
      lists.css("bottom","74px");
      note.css("bottom","74px");
    } else {
      overdue_text = '';
      notifications.fadeOut('fast');
      lists.css("bottom","36px");
      note.css("bottom","36px");
    }

    if(overdueBadges.length === 0) {
      $('div', notifications).text(overdue_text);
    } else {
      $('div', notifications).text(overduecount);
      //notifications.fadeOut('fast').fadeIn('fast');
      lists.css("bottom","74px");
    }

    if(todaycount === 0) {
      todayBadges.remove();
    }

    var countAll = overduecount + todaycount;
    if(countAll === 0) {
      Titanium.UI.setBadge('');
    } else {
      Titanium.UI.setBadge(countAll.toString());
    }
  }

  // Fetch info from DB & then call updateBadgesInfo method with badge counts 
  function updateBadges() {
    wunderlist.database.updateBadgeCount('today', function(err, todaycount){
      wunderlist.database.updateBadgeCount('overdue', function(err, overduecount) {
        updateBadgesInfo(todaycount, overduecount);
      });
    });
  }


  /**
   * Clears all little red badges
   * @author Christian Reber
   */
  function clearBadges() {
    Titanium.UI.setBadge('');
    $('span', today).remove();
    notifications.hide();
  }


  /**
   * Switch filters on click & fire a DB call
   */
  function getFilteredTasks(filter, type, printing, callback){
    var title = '', show_add = false, date_type;
    switch(filter) {
      case 'starred':
        show_add = true;
        title = wunderlist.language.data.all_starred_tasks;
        break;
      case 'today':
        show_add = true;
        title = wunderlist.language.data.all_today_tasks;
        break;
      case 'tomorrow':
        show_add = true;
        title = wunderlist.language.data.all_tomorrow_tasks;
        break;
      case 'thisweek':
        title = wunderlist.language.data.all_thisweeks_tasks;
        break;
      case 'done':
        title = wunderlist.language.data.all_done_tasks;
        break;
      case 'all':
        show_add = true;
        title = wunderlist.language.data.all_tasks;
        break;
      case 'overdue':
        title = wunderlist.language.data.overdue_tasks;
        break;
      case 'date':
        if (type === 'nodate') {
          show_add = true;
          title = wunderlist.language.data.all_someday_tasks;
          date_type = '=';
        } else {
          title = wunderlist.language.data.all_later_tasks;
          date_type = '>';
        }
        break;
      default:
        return;
    }

    wunderlist.database.getFilteredTasks(filter, type, function(err, results){
      if (printing === true){
        callback(results);
        return;
      }

      html.buildFilteredList(title, results, show_add, filter, function(err, markup){
        $("#content").html('').hide().append(markup);
        wunderlist.frontend.sortdrop.makeSortable();
        if (filter == 'all' || filter == 'starred' || date_type == '='){
          html.createDatepicker();
        }
        html.make_timestamp_to_string();
        $("#content").fadeIn('fast');
        $("a.list").droppable({
          disabled: false
        });
      });
    });
  }

  function switchFilter(e){
    var node = $(e.target);
    var id = node.attr("id");
    if (node.hasClass('loggedinas') || typeof id === 'undefined') {
      node.addClass('active');
    } else {
      setActiveState(node);

      if(!!id.match(/^(all|starred|done|today|tomorrow|thisweek)$/)) {
        getFilteredTasks(id);
      } else if(id === "someday"){
        getFilteredTasks('date', 'withdate');
      } else if(id === "withoutdate") {
        getFilteredTasks('date', 'nodate');
      }
    }
  }


  function createFilterElements(){
    var markup = '<a id="all" class="roundedleft more">&#xa74f;</a>';
    markup += '<a id="starred" class="more">&#x2605;</a>';
    markup += '<a id="done" class="roundedright more">&#x2714;</a>';
    markup += '<a id="today" class="roundedleft"></a>';
    markup += '<a id="tomorrow"></a>';
    markup += '<a id="thisweek"></a>';
    markup += '<a id="someday"></a>';
    markup += '<a id="withoutdate" class="roundedright"></a>';

    $("#filters").html(markup).find("a").addClass("filter");
    wunderlist.language.replaceFilters();
  }

  /**
   * Initiates all filter functions on the bottom (buttons on the bottom)
   * @author Christian Reber
   */
  function init() {
    // Create the filter elements
    createFilterElements();

    // Pre-cache the common queried results from jquery
    bottomBarLeft = $("#left");
    today = $('#today');
    overdue = $('#overdue');
    notifications = $('#notification');

    // Attach events
    $('.list').click(clearActiveStates);

    // Filter buttons on the bottom bar 
    // Activates filter on click
    bottomBarLeft.delegate("a.filter", "click", switchFilter);

    // Show overdue tasks if click on "overdue alert"
    $(notifications).click(function() {
      getFilteredTasks('overdue');
      $('a', bottomBarLeft).removeClass('active');
    });

    // By clicking on the list headline open the list
    $('h3.clickable').live('click', function() {
      $('a#list' + $(this).attr('rel')).click();
    });

    window.setTimeout(updateBadges, 10);
  }


  return {
    "init": init,
    "updateBadges": updateBadges
  };

})(window, jQuery, wunderlist, html, Titanium);