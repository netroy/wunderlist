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
  function updateBadges() {
    // Generate Badges
    var todaycount   = wunderlist.database.updateBadgeCount('today');
    var overduecount = wunderlist.database.updateBadgeCount('overdue');
    var todayBadges = $('span', today), overdueBadges = $('span', overdue);
    var lists = $("#lists"), note = $("#note");

    var today_has_no_badge   = todayBadges.length === 0;
    var overdue_has_no_badge = overdueBadges.length === 0;

    if(today_has_no_badge === true) {
      todayBadges = today.append('<span>' + todaycount + '</span>').find("span");
    } else {
      todayBadges.text(todaycount);
      //todayBadges.fadeOut('fast').fadeIn('fast');
      lists.css("bottom","74px");
      note.css("bottom","74px");
    }

    var overdue_text;
    if(overduecount >= 1) {
      overdue_text = overduecount + ' ' + (overduecount > 1)? wunderlist.language.data.overdue_text_pl : wunderlist.language.data.overdue_text_sl;
      notifications.fadeIn('fast');
      lists.css("bottom","74px");
      note.css("bottom","74px");
    } else {
      overdue_text = '';
      notifications.fadeOut('fast');
      lists.css("bottom","36px");
      note.css("bottom","36px");
    }

    if(overdue_has_no_badge) {
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
  function switchFilter(e){
    var node = $(e.target);
    var id = node.attr("id");
    if (node.hasClass('loggedinas') || typeof id === 'undefined') {
      node.addClass('active');
    } else {
      setActiveState(node);
      $("a.list").droppable({
        disabled: false
      });

      if(!!id.match(/^(all|starred|done|today|tomorrow|thisweek)$/)) {
        wunderlist.database.getFilteredTasks(id);
      } else if(id === "someday"){
        wunderlist.database.getFilteredTasks('date', 'withdate');
      } else if(id === "withoutdate") {
        wunderlist.database.getFilteredTasks('date', 'nodate');
      }

      html.make_timestamp_to_string();
    }
  }


  /**
   * Initiates all filter functions on the bottom (buttons on the bottom)
   * @author Christian Reber
   */
  function init() {

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
    $('div', notifications).click(function() {
      wunderlist.database.getFilteredTasks('overdue');
      html.make_timestamp_to_string();
      $("a.list").droppable({
        disabled: false
      });
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