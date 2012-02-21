wunderlist.frontend.filters = (function(window, $, wunderlist, Titanium, undefined){
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
      lists.css("bottom","80px");
      note.css("bottom","80px");
    }

    var overdue_text;
    if(overduecount > 0) {
      overdue_text = (overduecount > 1)? wunderlist.language.data.overdue_text_pl : wunderlist.language.data.overdue_text_sl;
      overdue_text = overduecount + ' ' + overdue_text;
      notifications.fadeIn('fast');
      lists.css("bottom","80px");
      note.css("bottom","80px");
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
      lists.css("bottom","80px");
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

      wunderlist.helpers.html.buildFilteredList(title, results, show_add, filter, function(err, markup){
        $("#content").html('').hide().append(markup);
        wunderlist.frontend.sortdrop.makeSortable();
        if (filter == 'all' || filter == 'starred' || date_type == '='){
          wunderlist.helpers.html.createDatepicker();
        }
        wunderlist.helpers.html.make_timestamp_to_string();
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
      node.toggleClass('active');
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




  /**
   * Make the filters starred, today and tomorrow droppable for tasks
   * @author Daniel Marschner
   */
  function handleTaskDrop(e, ui) {
    var taskID                 = ui.draggable.attr('id');
    var droppedTask            = $('li#' + taskID);
    var droppedTaskParent      = ($('ul.filterlist').length > 0 ? $('ul#filterlist' + droppedTask.attr('rel')) : $('ul#' + droppedTask.attr('rel')));
    var activeFilter           = droppedTaskParent.attr('rel');
    // TODO: file a bug for jqueryUI .. "this" is diambigous & a possible strict-mode violation..
    // ui or event object should contain the value of the drop target
    var droppedFilter          = $(this).attr('id');
    var today                  = wunderlist.helpers.utils.getWorldWideDate();
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

          wunderlist.helpers.html.make_timestamp_to_string();
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

          wunderlist.helpers.html.make_timestamp_to_string();
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
          wunderlist.helpers.html.createDatepicker();

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

  function makeFilterDropable() {
    $('a.filter').droppable({
      accept     : 'ul.mainlist li',
      hoverClass : 'droppable',
      drop       : handleTaskDrop
    });
  }


  var markup = '<a id="all" class="roundedleft more">&#xa74f;</a>';
    markup += '<a id="starred" class="more">&#x2605;</a>';
    markup += '<a id="done" class="roundedright more">&#x2714;</a>';
    markup += '<a id="today" class="roundedleft"></a>';
    markup += '<a id="tomorrow"></a>';
    markup += '<a id="thisweek"></a>';
    markup += '<a id="someday"></a>';
    markup += '<a id="withoutdate" class="roundedright"></a>';

  function createFilterElements() {
    $("#filters").html(markup).find("a").addClass("filter");
    wunderlist.language.replaceFilters();
    makeFilterDropable();
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

})(window, jQuery, wunderlist, Titanium);
