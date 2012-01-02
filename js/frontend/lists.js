/* global wunderlist $ */
wunderlist.frontend.lists = (function($, wunderlist, undefined){
  //"use strict";

  /**
   * Activate/deactivate the "focusout" eventlistener
   * @author Daniel Marschner
   */
  var listEventListener = false;
  var ListElementName   = '';
  var delete_dialog;

  /**
   * Calls the function to adds a new list on clicking the add button
   * @author Dennis Schneider
   */
  function bindListAddMode() {
    $('#right .addlist').click(function() {
      if (!wunderlist.helpers.sidebar.isOpen()) {
        wunderlist.helpers.sidebar.toggleSidebar();
      }
      addList();
      makeListsSortable();
    });
  }

  /**
   * Adds a new list on clicking the add button
   * @author Dennis Schneider
   */
  function addList() {
    // Add new list
    $('div#lists').append(html.generateNewListElementHTML());

    // Hide add button
    // $('h3 .add').hide();

    // Show edit & delete button
    $('input.input-list').parent().children('.savep').show();
    $('input.input-list').parent().children('.deletep').show();

    // Text cursor on input field
    $('input.input-list').focus();

    setTimeout(function(){
      listShortcutListener = 0;
    }, 50);
  }

  /**
   * Starts the edit mode of a list
   * @author Dennis Schneider
   * @author Christian Reber
   * @author Daniel Marschner
   */
  function bindListEditMode() {
    $('#lists div.editp').live('click', function() {
      $(this).hide();
      listEditMode($(this).parent('a'));
    });

    $('#lists a.list').live('dblclick', function() {
      if($(this).children('input').length === 0) {
        $(this).children('div.editp').hide();
        listEditMode($(this));
      }
    });
  }

  /**
   * Show the edit mode for the given list
   * @author Dennis Schneider
   * @author Christian Reber
   * @author Daniel Marschner
   */
  function listEditMode(listElement) {
    ListElementName = listElement.find('b').text();

    wunderlist.timer.pause();

    listElement.find('b').hide();
    listElement.find('span').before('<input type="text" maxlength="255" value="" />');
    listElement.find('input').val(unescape(ListElementName)).select();
    listElement.find('input').focus();

    listElement.find('.savep').show();
    listElement.find('.deletep').show();
  }

  /**
   * Calls a function to save a new/edited list
   * @author Daniel Marschner
   */
  function bindListSaveMode() {
    $('#lists div.savep').live('click', function() {
      var listElement = $(this).parent('a');
      var listId    = listElement.attr('id').replace('list', '');

      wunderlist.timer.resume();

      if(listId != 'x'){
        saveList(listElement);
      } else {
        saveNewList(listElement);
      }
    });
  }

  /**
   * Saves a edited list
   * @author Daniel Marschner
   */
  function saveList(listElement) {
    var listElementInput = listElement.children('input');
    var listElementTitle = listElement.children('b');
    var listElementName  = html.strip_tags(wunderlist.helpers.utils.convertString(listElementInput.val()));

    if (listElementName === ''){
      listElementName = wunderlist.language.data.new_list;
    }

    if (listElement.hasClass('ui-state-disabled')){
      $('#content h1').text(unescape(listElementName));
    }
  
    listElementInput.remove();
  
    var listElementTitleSplit = listElementTitle.html().split("<");
    newTitle = unescape(listElementName) + "<" + listElementTitleSplit[1];
    listElementTitle.html(newTitle).fadeIn();
  
    listElement.children('.savep').hide();
    listElement.children('.deletep').hide();

    if (listElementName.length > 30){
      listElement.children('b').attr('title', unescape(listElementName));
    }

    listElement.click();

    wunderlist.helpers.list.set({
      id: listElement.attr('id').replace('list', ''),
      name: listElementName
    }).update(false, wunderlist.nop);
  }

  /**
   * Cancel adding a new list
   * @author Dennis Schneider
   */
  var listElement = $('div#lists a.ui-state-disabled');
  function cancelSaveList(cancelEdit) {
    if (!cancelEdit) {
      $('div#lists a#x:last').remove();
    } else {
      var listElementInput = listElement.children('input');
      listElementInput.val(ListElementName);
      saveList(listElement);
    }
  }

  /**
   * Saves a new list
   * @author Daniel Marschner
   */
  function saveNewList(listElement) {
    var listElementInput = listElement.children('input');
    var listElementName  = wunderlist.helpers.utils.convertString(listElementInput.val());

    if (listElementName === ''){
      listElementName = wunderlist.language.data.new_list;
    }

    var list = wunderlist.helpers.list.set({
      name: listElementName
    });

    listElementInput.remove();
    var listHTML = '<b class="sharep">' + html.strip_tags(unescape(listElementName)) + '<div class="sharelist"></div></b>';

    listElement.children('.savep').hide();
    listElement.children('.deletep').hide();
    listElement.find('span').before(listHTML);

    if (listElementName.length > 30){
      listElement.children('b').attr('title', unescape(listElementName));
    }

    list.insert(function(err, listId){
      if(err){
        listElement.remove();
      } else {
        listElement.attr('id', 'list' + listId);
        listElement.click();
      }
    });

    //$('h3 .add').fadeIn();
    wunderlist.frontend.sortdrop.makeListsDropable();
  
    if (wunderlist.account.isLoggedIn() === false) {
      $('div.sharelist').remove();
    }
  }

  /**
   * Delete the list finally
   * @author Christian Reber
   */
  function deleteList(listId, listElement) {
    listEventListener = false;

    if (listElement === undefined) {
      listElement = $('div#lists a.ui-state-disabled');
    }

    if (listId === undefined) {
      listId = (listElement.attr('id') !== undefined) ? listElement.attr('id').replace('list', '') : undefined;
    }

    if (listId !== undefined && listId !== 1) {
      if (listId !== 'x') {
        /*if (notes.window !== undefined) {
          _return = false;
          dbTasks = wunderlist.database.getTasks(undefined, listId);
          if (dbTasks.length > 0) {
            for (var x in dbTasks) {
              if (_return === false) {
                _return = wunderlist.frontend.notes.closeNoteWindow(dbTasks[x].id);
              }
            }
          }
        }*/

        wunderlist.helpers.list.set({
          id: listId,
          deleted: 1
        }).update();
      }
  
      listElement.remove();
      openList(1);
    }
  }

  /**
   * Deletes a unsaved/saved list
   * @author Christian Reber
   */
  function bindListDeleteMode() {
    // Delete tasks button
    $('#lists div.deletep').live('click', function() {
      if (wunderlist.settings.getInt('delete_prompt', 1) === 1) {
        wunderlist.helpers.dialogs.createDeleteListDialog($(this).parent().attr('id').replace('list', ''), $(this).parent());
        wunderlist.helpers.dialogs.openDialog(delete_dialog);
      } else {
        cancelSaveList();
        deleteList($(this).parent().attr('id').replace('list', ''), $(this).parent());
      }
    });
  }

  /**
   * Generate the HTML code for the given lists array and append that to the content
   * @author Dennis Schneider, Daniel Marschner
   */
  function initLists(lists) {
    if (lists !== undefined && wunderlist.helpers.utils.is_array(lists)) {
      $('div#lists').html('');
      for (var ix in lists) {
        var listHTML  = '';
        var listClass = 'sharelist';
        var actions   = "<div class='deletep'></div><div class='editp'></div><div class='savep'></div>";

        if (lists[ix].inbox === 1) {
          actions  = "<div class='editp'></div><div class='savep'></div>";
          listHTML = "<a id='list" + lists[ix].id + "' class='list'><span>" + lists[ix].taskCount + "</span>" + actions + "<b class='inbox'>" + unescape(lists[ix].name) + "</b></a>";
        } else if (lists[ix].shared === 1) {
          listClass = "sharedlist";
          listHTML = "<a id='list" + lists[ix].id + "' class='list sortablelist'><span>" + lists[ix].taskCount + "</span>" + actions + "<b class='sharep'>" + unescape(lists[ix].name) + "<div class='" + listClass + "'></div></b></a>";
        } else {
          listHTML = "<a id='list" + lists[ix].id + "' class='list sortablelist'><span>" + lists[ix].taskCount + "</span>" + actions + "<b class='sharep'>" + unescape(lists[ix].name) + "<div class='" + listClass + "'></div></b></a>";
        }

        $("#lists").append(listHTML);

        if(lists[ix].name.length > 30){
          $('div#sidebar a#' + lists[ix].id).children('b').attr('title', unescape(lists[ix].name));
        }
      }
    }
  }

  /**
   * Generate the HTML code for the given tasks array and return it
   * TODO: move this to tasks.js
   * @author Daniel Marschner
   */
  function initTasks(tasks) {
    var tasksHTML = '';
    if (tasks !== undefined && wunderlist.helpers.utils.is_array(tasks)) {
      for (var ix in tasks){
        tasksHTML += html.generateTaskHTML(tasks[ix].id, tasks[ix].name, tasks[ix].list_id, tasks[ix].done, tasks[ix].important, tasks[ix].date, tasks[ix].note);
      }
    }
    return tasksHTML;
  }


  /**
   * Get all tasks of the selected list
   * @author Dennis Schneider, Christian Reber, Daniel Marschner
   */
  var listOpenHandler = false;

  function renderLastDoneTasks(err, doneListsTasks){
    for(var listId in doneListsTasks) {
      var day_string = wunderlist.language.data.day_ago;
      var heading    = '<h3>';

      if (listId === 0){
        day_string = wunderlist.language.data.done_today;
        days_text = '';
        heading = '<h3 class="head_today">';
      } else if (listId === 1) {
        day_string = wunderlist.language.data.done_yesterday;
        days_text = '';
      } else {
        day_string = wunderlist.language.data.days_ago;
        days_text = listId;
      }

      // Check for older tasks and append new div
      if (listId > 1 && ($('#older_tasks').length === 0)) {
        $('#content').append('<button id="older_tasks_head">' + wunderlist.language.data.older_tasks + '</button><div id="older_tasks"></div>');
      }

      if ($('ul#donelist_' + listId).length === 0) {
        var appendHTML = heading + days_text + ' ' + day_string + '</h3><ul id="donelist_' + (listId === 0 ? 'list_today' : listId) + '" class="donelist">' + doneListsTasks[listId].join('') + '</ul>';

        if ($('#older_tasks').length === 0) {
          $('#content').append(appendHTML);
        } else {
          $('#older_tasks').append(appendHTML);
        }
      }
    }

    // If there are older tasks, then append a hide button
    if ($('#older_tasks ul').length > 0){
      $('#content').append('<button id="hide_older_tasks">' + wunderlist.language.data.hide_older_tasks + '</button>');
    }
  }

  function openList(list_id) {
    if (listOpenHandler === false) {
      listOpenHandler = true;

      // Clear content
      var content = $('#content');
      content.html('').hide();

      if (typeof list_id === 'undefined') {
        list_id = wunderlist.settings.getString('last_opened_list', '1'); // Default 1
      }

      if (typeof list_id === 'string'){
        try {
          list_id = parseInt(list_id, 10);
        } catch(e) {}
      }
      

      wunderlist.database.existsById('lists', list_id, function(err, exists){
        if(!exists) {
          list_id = 1;
        }
        wunderlist.database.getLists(list_id, function(err, lists){
          if(lists.length > 0){
            $('#content').append(html.generateListContentHTML(lists[0].id, lists[0].name));
          }
        });

        wunderlist.database.getTasks(undefined, list_id, function(err, tasks){
          if(tasks.length > 0){
            $("#list").append(initTasks(tasks));
            wunderlist.frontend.sortdrop.makeSortable();
          }
        });

        wunderlist.database.getLastDoneTasks(list_id, renderLastDoneTasks);


        html.make_timestamp_to_string();
        wunderlist.settings.setString('last_opened_list', list_id);
        html.createDatepicker();
        wunderlist.timer.resume();
        wunderlist.frontend.search.clear();

        // Make everything droppable
        $("a.list").droppable({ disabled: false });
        $("#lists a#list" + list_id).droppable({ disabled: true }); // Activate list
        $('#bottombar #left a').removeClass('active');

        content.fadeIn('fast');

      });

      setTimeout(function() {
        listOpenHandler = false;
      }, 100);

      // If there is another list in edit mode, save it after opening the other list
      if ($('a.list input').length === 1) {
        $('a.list input').focusout();
      }
    }
  }

  /**
   * make Lists Sortable
   * @author Marvin Labod
   */
  function makeListsSortable() {
    $("#lists").sortable({
      axis        : 'y',
      scroll      : false,
      cursor      : 'pointer',
      placeholder : 'placeholder',
      distance    : 20,
      items       : '.sortablelist',
      revert      : 200,
      update      : saveListPosition
    });
  }


  /**
   * Save the list position
   * @author Dennis Schneider
   */
  function saveListPosition() {
    // Get all tasks from current list
    var lists = $("div#lists a.list"), i = 1, len = lists.length;
    wunderlist.helpers.list.setDefaults();
    async.forEachSeries(lists, function(list, next){
      list = $(list);
      wunderlist.helpers.list.set({
        id: list.attr("id").replace('list', ''),
        position: i++
      }).update(false, function(err, result) {
        if(i <= len) {
          next();
        }
      });
    });
  }


  // Open a list on "click" (MOUSE CLICK)
  function listClick() {
    if($('ul#list').attr('rel') != $(this).attr('id').replace('list', '') && $(this).attr('id').replace('list', '') != 'x') {
      openList($(this).attr('id').replace('list', ''));
    }
  }


  // Show option buttons on "mouseover"
  function listMouseOver() {
    var countInput = $(this).children('input').length;

    if(countInput === 0) {
      $(this).children('.editp').show();
    }

    if($(this).attr('id').replace('list', '') != 'x' && $(this).attr('id').replace('list', '') != 1){
      $(this).children('.deletep').show();
    }
  }


  // Hide option buttons on "mouseout"
  function listMouseOut() {
    var countInput = $(this).children('input').length;

    $(this).children('.editp').hide();

    if(countInput === 0){
      $(this).children('.deletep').hide();
    }
      
  }


  // Save the list on "keyup" (ENTER)
  function listInputKeyUp(event) {
    var aimSetting = wunderlist.settings.getInt('add_item_method', 0);
    if (event.keyCode === 13 && aimSetting === 0) {
      wunderlist.timer.pause();
      listEventListener = true;
      var listElement = $(this).parent('a');
      var list_id     = listElement.attr('id').replace('list', '');

      wunderlist.timer.resume();

      if (list_id != 'x'){
        saveList(listElement);
      } else{
        saveNewList(listElement);
      }
    }
  }


  /**
   * Save the list on "focusout" (Mouse Click)
   * @author Dennis Schneider, Christian Reber
   */
  function listInputFocusOut(event) {
    if (event.keyCode !== 13 && event.keyCode !== 27 && listEventListener === false) {
        listEventListener = true;

        var listElement = $(this).parent('a');
        var listId      = listElement.attr('id').replace('list', '');

        wunderlist.timer.resume();

        if (listId !== 'x') {
          saveList(listElement);
        } else {
          saveNewList(listElement);
        }

        listElement.children('.editp').hide();
        listElement.children('.deletep').hide();

        setTimeout(function() {
          listEventListener = false;
        }, 500);
    } else {
      listEventListener = false;
    }
  }


  /**
   * Show/Hide older tasks
   * @author Marvin Labod
   */
  function showOlderTasks() {
    $('#older_tasks').slideDown(function() {
      $('button#hide_older_tasks').fadeIn();
    });

    $(this).hide();
  }

  function hideOlderTasks() {
    $('#older_tasks').slideUp(function() {
      $('button#older_tasks_head').fadeIn();
    });

    $(this).hide();
  }


  function redraw(){
    wunderlist.database.getLists(null, function(err, lists) {
      initLists(lists);
      openList();
    });
  }

  function init(){

    makeListsSortable();

    // Binding the list functionality
    bindListAddMode();
    bindListEditMode();
    bindListDeleteMode();
    bindListSaveMode();

    
    $("a.list").live('click', listClick).live('mouseover', listMouseOver).live('mouseout', listMouseOut);
    $('a.list input').live('keyup', listInputKeyUp).live('focusout', listInputFocusOut);

    // Kills the "focusout" eventlistener
    $('a.list .deletep').live('mouseover', function() {
      listEventListener = true;
    });

    // Activates the "focusout" eventlistener
    $('a.list .deletep').live('mouseout', function() {
      listEventListener = false;
    });

    $('button#older_tasks_head').live('click', showOlderTasks);
    $('button#hide_older_tasks').live('click', hideOlderTasks);

    redraw();

  }

  return {
    "init": init,
    "addList": addList,
    "deleteList": deleteList,
    "cancelSaveList": cancelSaveList,
    "saveList": saveList,
    "saveNewList": saveNewList,
    "openList": openList,
    "initLists": initLists,
    "initTasks": initTasks,
    "redraw": redraw
  };

})(jQuery, wunderlist);