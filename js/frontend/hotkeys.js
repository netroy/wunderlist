wunderlist.frontend.hotkeys = (function($, window, wunderlist, shortcut, Titanium, undefined){

  "use strict";

  /**
   * Stops the "keydown" event by using the shortcut CTRL+L to add a new list
   * @author Daniel Marschner
   */
  var setTimeout = window.setTimeout;
  var listShortcutListener = 0, cancelEditTask = false, eventListener = false;

  function checkAndClickFilter(cssRule) {
    return function () {
      var noDialogOpen = ($('[role="dialog"]').length === 0),
          noTextAreaFocussed = ($('textarea:focus').length === 0),
          noInputFocussed = $('input:focus').length === 0;
      if (noDialogOpen && noTextAreaFocussed && noInputFocussed) {
        $(cssRule).click();
      }
    };
  }


  function bindShortcutsForFilters(shorcutKey) {

    // Shortcut Bind Command(or Ctrl)+1 - go to filter list all
    shortcut.add(shorcutKey + '+1', checkAndClickFilter('a#all'));

    // Shortcut Bind Command(or Ctrl)+2 - go to filter list starred
    shortcut.add(shorcutKey + '+2', checkAndClickFilter('a#starred'));

    // Shortcut Bind Command(or Ctrl)+3 - go to filter list done
    shortcut.add(shorcutKey + '+3', checkAndClickFilter('a#done'));

    // Shortcut Bind Command(or Ctrl)+4 - go to filter list today
    shortcut.add(shorcutKey + '+4', checkAndClickFilter('a#today'));

    // Shortcut Bind Command(or Ctrl)+5 - go to filter list tomorrow
    shortcut.add(shorcutKey + '+5', checkAndClickFilter('a#tomorrow'));

    // Shortcut Bind Command(or Ctrl)+6 - go to filter list next 7 days
    shortcut.add(shorcutKey + '+6', checkAndClickFilter('a#thisweek'));

    // Shortcut Bind Command(or Ctrl)+7 - go to filter list later
    shortcut.add(shorcutKey + '+7', checkAndClickFilter('a#someday'));

    // Shortcut Bind Command(or Ctrl)+8 - go to filter list without date
    shortcut.add(shorcutKey + '+8', checkAndClickFilter('a#withoutdate'));
  }


  function bindSystemHotkeys(shortcutKey) {
    /**
     * Little workaround bugfix for Mac OS X (sorry, but there is no way around)
     * Shortcut Bind Command (or Ctrl) + Q
     * @author Christian Reber
     */
    if (wunderlist.settings.os === 'darwin') {
      shortcut.add(shortcutKey + '+q', function () {
        if (listShortcutListener === 0) {
          wunderlist.settings.saveWindowPosition();
          Titanium.App.exit();
        }
      });
    }
    
    /**
     * Printing with Ctrl / Command + P
     * @author Christian Reber,  Daniel Marschner, Dennis Schneider
     */
    var printShortcutListener = 0;
    shortcut.add(shortcutKey + '+p', function (evt) {
      if(printShortcutListener === 0) {
        wunderlist.frontend.share.print();
      }
      printShortcutListener++;
      setTimeout(function() {
        printShortcutListener = 0;
      }, 50);
    });
  }


  function bindNavigationHotkeys(shortcutKey) {

    var stepUp = false, stepDown = false, element, elementId;

    // Shortcut Bind Command(or Ctrl)+Up - Step through lists
    shortcut.add('up', function (evt) {
      if (stepUp === false && $('textarea:focus').length === 0 && $('input:focus').length === 0) {
        stepUp = true;
        element = $('div#lists > a.ui-state-disabled');
        elementId = element.prev().attr('id');
        
        if(elementId === undefined) {
          $('div#lists a').last().click();
        } else {
          element.prev().click();
        }
      }

      setTimeout(function() {
        stepUp = false;
      }, 100);
    },{
      'disable_in_input':'true'
    });
    
    // Shortcut Bind Command(or Ctrl)+Down - Step through lists
    shortcut.add('down', function (evt) {
      if(stepDown === false && $('textarea:focus').length === 0 && $('input:focus').length === 0){
        stepDown = true;
        element = $('div#lists > a.ui-state-disabled');
        elementId = element.next().attr('id');
        
        if(elementId === undefined) {
          $('div#lists a').first().click();
        } else {
          element.next().click();
        }
      }

      setTimeout(function() {  stepDown = false; }, 100);
    },{
      'disable_in_input':'true'
    });
  }


  var syncShortcutListener = 0;
  function bindSyncHotkeys(shortcutKey) {
    /**
     * Sync with Ctrl + S
     * @author Daniel Marschner
     */
    shortcut.add(shortcutKey + '+s', function (evt) {
      wunderlist.frontend.tasks.cancel();
      // TODO: why is this needed ??
      // $(register_dialog).dialog('isOpen') === false
      if (wunderlist.account.isLoggedIn() === true) {
        if (syncShortcutListener === 0 && wunderlist.sync.isSyncing() === false) {
          wunderlist.timer.stop();
          wunderlist.sync.fireSync();
        }

        syncShortcutListener++;

        setTimeout(function() {
          syncShortcutListener = 0;
        }, 50);
      }
    });
  }


  var focusSearch = 0;
  function bindSearch(shortcutKey) {
    // Shortcut Bind Command(or Ctrl)+F - Search
    shortcut.add(shortcutKey + '+f', function (evt) {
      wunderlist.frontend.tasks.cancel();
      focusSearch++;
      if(focusSearch == 1) {
        $('input#search').focus();
      }
      setTimeout(function() {
        focusSearch = 0;
      }, 1000);
    });
  }


  var listEventListener = false, deleteListShortcut, documentEscapeActive = false;
  function bindListsAndTasks(shortcutKey) {

    // Shortcut Bind Command (or Ctrl) + L - New list
    shortcut.add(shortcutKey + "+l",function() {
      if ($('[role="dialog"]').length === 0) {
        wunderlist.frontend.tasks.cancel();
        $('h3 .add').hide();
        if(listShortcutListener === 0){
          wunderlist.frontend.lists.addList();
        }
        listShortcutListener++;
      }
    }, {'disable_in_input' : true});

    
    // Hotkey cmd / strg + i - Open the inbox
    shortcut.add(shortcutKey + '+i', function (event) {
      if (eventListener === false) {
        eventListener = true;
        // Only open the list when it's not the inbox
        var list = $('div#lists a.ui-state-disabled');
        if (list.attr('id').replace('list', '') != 1) {
          wunderlist.frontend.lists.openList(1);
        }
        setTimeout(function() {
          eventListener = false;
        }, 100);
      }
    });


    // Cmd+Backspace / Del - Delete selected list
    if(deleteListShortcut === undefined){
      if (wunderlist.settings.os === 'darwin') {
        deleteListShortcut = shortcutKey + '+backspace';
      } else {
        deleteListShortcut = 'delete';
      }
    }

    shortcut.add(deleteListShortcut, function (event) {
      if ($('textarea:focus').length === 0 && $('input:focus').length === 0) {
        if (eventListener === false) {
          eventListener = true;
          
          var listElement = $('div#lists a.ui-state-disabled');
          
          if (listElement.length === 1 && listElement.attr('id').replace('list', '') !== 1) {
            wunderlist.helpers.dialogs.createDeleteListDialog();
          }
        
          setTimeout(function() {
            eventListener = false;
          }, 100);
        }
      }
    }, {"propagate" : true});

    
    // Shortcut Bind Esc - Go to my tasks
    shortcut.add('Esc', function (evt) {
      // $(register_dialog).dialog('isOpen') === false ||
      if ((wunderlist.account.isLoggedIn() === true) && documentEscapeActive === false) {
        documentEscapeActive = true;
        
        if ($('div.add .input-add:focus').length === 0 &&
            $('#task-edit:focus').length === 0 &&
            !cancelEditTask &&
            $('#lists a.list input').length === 0 &&
            $('#note textarea:focus').length === 0 &&
            $('#note textarea').css('display') === 'none')
        {
          $("#left a").removeClass("active");
          $("input#search").val('').blur();
          wunderlist.frontend.lists.openList(1);
        } else if ($('#note textarea:focus').length == 1 || $('#note textarea').css('display') == 'block') {
          $('div#note a#cancel-note').click();
        } else if ($('div#lists a#x:last').length > 0) {
          wunderlist.frontend.lists.cancelSaveList(false);
        } else if($('a.list input').length > 0) {
          wunderlist.frontend.lists.cancelSaveList(true);
        } else if (wunderlist.frontend.tasks.datePickerOpen === true) {
          $('.datepicker').datepicker('hide');
        } else {
          wunderlist.frontend.tasks.cancel();
          cancelEditTask = true;
        }
        
        setTimeout(function() {
          cancelEditTask = false;
          documentEscapeActive = false;
        }, 1000);
      }
    });


    // For removing select all
    // TODO: What ???something wrong with this?
    shortcut.add(shortcutKey + '+a', function (e) {
      if ($('textarea:focus').length == 1) {
        $('textarea').select();
      } else if ($('input:focus').length == 1) {
        $('input').select();
      }
    }, {'disable_in_input' : false});

    // Save note and close the dialog
    shortcut.add(shortcutKey + '+Enter', function (event) {
      var aimSetting = wunderlist.settings.getInt('add_item_method', 0);
      if ($('input.input-add:focus').length == 1) {
        if (aimSetting == 1) {
          wunderlist.timer.pause();
          wunderlist.frontend.tasks.add();
          wunderlist.timer.resume();
        }
      } else if ($('a.list input:focus').length == 1) {
        if (aimSetting === 1) {
          wunderlist.timer.pause();
          
          listEventListener = true;
          var listElement = $('a.list input').parent('a');
          var list_id     = listElement.attr('id').replace('list', '');
    
          if (list_id !== 'x'){
            wunderlist.frontend.lists.saveList(listElement);
          } else {
            wunderlist.frontend.lists.saveNewList(listElement);
          }
            
          wunderlist.timer.resume();
        }
      }
    }, {'disable_in_input' : false});


    // Shortcut Bind Command (or Ctrl) + N or T - Add new task
    function focusTaskInput() {
      wunderlist.frontend.tasks.cancel();
      // $(register_dialog).dialog('isOpen') === false ||
      if(wunderlist.account.isLoggedIn() === true){
        $('.add input.input-add').focus();
      }
    }
    shortcut.add(shortcutKey + '+n', focusTaskInput);
    shortcut.add(shortcutKey + '+t', focusTaskInput);
  }


  var sidebarToggle = false;
  function bindSidebarHotKeys(shortcutKey) {
    // Shortcut Bind Command(or Ctrl)+b - Hide the sidebar
    shortcut.add(shortcutKey + '+b', function (evt) {
      if(sidebarToggle === false) {
        sidebarToggle = true;
        $('div#right span.togglesidebar').click();
      }
      setTimeout(function() {
        sidebarToggle = false;
      }, 100);
    });
  }


  function init() {

    var shortcutKey = wunderlist.settings.shortcutkey;

    bindShortcutsForFilters(shortcutKey);

    bindSystemHotkeys(shortcutKey);

    bindNavigationHotkeys(shortcutKey);

    bindSyncHotkeys(shortcutKey);

    bindSearch(shortcutKey);

    bindListsAndTasks(shortcutKey);
  
    bindSidebarHotKeys(shortcutKey);
  }

  return {
    "init": init
  };

})(jQuery, window, wunderlist, shortcut, Titanium);