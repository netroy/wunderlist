var hotkeys = hotkeys || {};

hotkeys.eventListener = false;

/**
 * Stops the "keydown" event by using the shortcut CTRL+L to add a new list
 * @author Daniel Marschner
 */
var listShortcutListener = 0;
var cancelEditTask = false;

$(function() {
	
	// Shortcut Bind Command(or Ctrl)+1 - go to filter list all
	shortcut.add(wunderlist.settings.shortcutkey + '+1', function () {
		if ($('[role="dialog"]').length == 0 && $('textarea:focus').length == 0 && $('input:focus').length == 0)
			$('a#all').click();
	});

	// Shortcut Bind Command(or Ctrl)+2 - go to filter list starred
	shortcut.add(wunderlist.settings.shortcutkey + '+2', function() {
		if ($('[role="dialog"]').length == 0 && $('textarea:focus').length == 0 && $('input:focus').length == 0)
			$('a#starred').click();
	});

	// Shortcut Bind Command(or Ctrl)+3 - go to filter list done
	shortcut.add(wunderlist.settings.shortcutkey + '+3', function() {
		if ($('[role="dialog"]').length == 0 && $('textarea:focus').length == 0 && $('input:focus').length == 0)
			$('a#done').click();
	});

	// Shortcut Bind Command(or Ctrl)+4 - go to filter list today
	shortcut.add(wunderlist.settings.shortcutkey + '+4', function() {
		if ($('[role="dialog"]').length == 0 && $('textarea:focus').length == 0 && $('input:focus').length == 0)
			$('a#today').click();
	});

	// Shortcut Bind Command(or Ctrl)+5 - go to filter list tomorrow
	shortcut.add(wunderlist.settings.shortcutkey + '+5', function() {
		if ($('[role="dialog"]').length == 0 && $('textarea:focus').length == 0 && $('input:focus').length == 0)
			$('a#tomorrow').click();
	});

	// Shortcut Bind Command(or Ctrl)+6 - go to filter list next 7 days
	shortcut.add(wunderlist.settings.shortcutkey + '+6', function() {
		 if ($('[role="dialog"]').length == 0 && $('textarea:focus').length == 0 && $('input:focus').length == 0)
			$('a#thisweek').click();
	});

	// Shortcut Bind Command(or Ctrl)+7 - go to filter list later
	shortcut.add(wunderlist.settings.shortcutkey + '+7', function() {
		if ($('[role="dialog"]').length == 0 && $('textarea:focus').length == 0 && $('input:focus').length == 0)
			$('a#someday').click();
	});

	// Shortcut Bind Command(or Ctrl)+8 - go to filter list without date
	shortcut.add(wunderlist.settings.shortcutkey + '+8', function() {
		if ($('[role="dialog"]').length == 0 && $('textarea:focus').length == 0 && $('input:focus').length == 0)
			$('a#withoutdate').click();
	});
	
	/**
	 * Little workaround bugfix for Mac OS X (sorry, but there is no way around)
	 * Shortcut Bind Command (or Ctrl) + Q
	 * @author Christian Reber
	 */
	if (wunderlist.settings.os === 'darwin') {
		shortcut.add(wunderlist.settings.shortcutkey + '+q', function () {
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
	shortcut.add(wunderlist.settings.shortcutkey + '+p', function (evt) {
		if(printShortcutListener === 0) {
		  wunderlist.frontend.share.print();
		}
		printShortcutListener++;
		setTimeout(function() {
		  printShortcutListener = 0
		}, 50);
	});
	
	/**
	 * Sync with Ctrl + S
	 *
	 * @author Daniel Marschner
	 */
	shortcut.add(wunderlist.settings.shortcutkey + '+s', function (evt) {
    wunderlist.frontend.tasks.cancel();
    if ($(register_dialog).dialog('isOpen') === false || wunderlist.account.isLoggedIn() === true) {
			if (syncShortcutListener == 0 && wunderlist.sync.isSyncing() == false) {
				wunderlist.timer.stop();
				wunderlist.sync.fireSync();
			}

			syncShortcutListener++;

			setTimeout(function() {syncShortcutListener = 0}, 50);
		}
	});
	
	// For removing select all
	shortcut.add(wunderlist.settings.shortcutkey + '+a', function (e) { 
		if ($('textarea:focus').length == 1) {
			$('textarea').select();
		} else if ($('input:focus').length == 1) {
			$('input').select();
		}			
	}, {'disable_in_input' : false});
	
	// Shortcut Bind Command (or Ctrl) + L - New list
	shortcut.add(wunderlist.settings.shortcutkey + "+l",function() {
		if ($('[role="dialog"]').length == 0) {
			wunderlist.frontend.tasks.cancel();
			$('h3 .add').hide();
			if(listShortcutListener === 0){
			  wunderlist.frontend.lists.addList();
			}
			listShortcutListener++;
		}
	}, {'disable_in_input' : true});
	
	var stepUp   = false;
	var stepDown = false;	
	
	// Shortcut Bind Command(or Ctrl)+Up - Step through lists
	shortcut.add('up', function (evt) {
		if (stepUp == false && $('textarea:focus').length == 0 && $('input:focus').length == 0)
		{
			stepUp        = true;
			$element      = $('div#lists > a.ui-state-disabled');
			var elementId = $element.prev().attr('id');
			
			if(elementId == undefined)
				$('div#lists a').last().click();
			else
				$('div#lists > a.ui-state-disabled').prev().click();
		}

		setTimeout(function() {	stepUp = false;	}, 100);
	},{
		'disable_in_input':'true'
	});
	
	// Shortcut Bind Command(or Ctrl)+Down - Step through lists
	shortcut.add('down', function (evt) {
		if(stepDown == false && $('textarea:focus').length == 0 && $('input:focus').length == 0)
		{
			stepDown      = true;
			$element      = $('div#lists > a.ui-state-disabled');
			var elementId = $element.next().attr('id');
			
			if(elementId == undefined)
				$('div#lists a').first().click();
			else
				$('div#lists > a.ui-state-disabled').next().click();
		}

		setTimeout(function() {	stepDown = false; }, 100);
	},{
		'disable_in_input':'true'
	});	

	// Shortcut Bind Command(or Ctrl)+F - Search
	shortcut.add(wunderlist.settings.shortcutkey + '+f', function (evt) {
		wunderlist.frontend.tasks.cancel();

        focusSearch++;

        if(focusSearch == 1)
            $('input#search').focus();

        setTimeout(function() { focusSearch = 0; }, 1000);
	});

	var documentEscapeActive = false;
	
	// Shortcut Bind Esc - Go to my tasks
	shortcut.add('Esc', function (evt) {	
		if (($(register_dialog).dialog('isOpen') == false || wunderlist.account.isLoggedIn() == true) && documentEscapeActive == false) {
			documentEscapeActive = true;
			
			if ($('div.add .input-add:focus').length == 0 && $('#task-edit:focus').length == 0 
			    && !cancelEditTask && $('#lists a.list input').length == 0 && $('#note textarea:focus').length == 0 
			    && $('#note textarea').css('display') == 'none') {
				$("#left a").removeClass("active");
				$("input#search").val('').blur();
				wunderlist.frontend.lists.openList(1);
			} else if ($('#note textarea:focus').length == 1 || $('#note textarea').css('display') == 'block') {
				$('div#note a#cancel-note').click();
			} else if ($('div#lists a#x:last').length > 0) {
				wunderlist.frontend.lists.cancelSaveList(false);
			} else if($('a.list input').length > 0) {	
				wunderlist.frontend.lists.cancelSaveList(true);
			} else if (wunderlist.frontend.tasks.datePickerOpen == true) {
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
	
	// Shortcut Bind Command (or Ctrl) + N - Add new task
	shortcut.add(wunderlist.settings.shortcutkey + '+n', function (evt) {
		wunderlist.frontend.tasks.cancel();

        if($(register_dialog).dialog('isOpen') == false || wunderlist.account.isLoggedIn() == true)
			$('.add input.input-add').focus();
	});

	// Shortcut Bind Command (or Ctrl) + T - Add new task
	shortcut.add(wunderlist.settings.shortcutkey + '+t', function (evt) {
		wunderlist.frontend.tasks.cancel();

        if($(register_dialog).dialog('isOpen') == false || wunderlist.account.isLoggedIn() == true)
			$('.add input.input-add').focus();
	});
	
	var sidebarToggle = false;

	// Shortcut Bind Command(or Ctrl)+b - Hide the sidebar
	shortcut.add(wunderlist.settings.shortcutkey + '+b', function (evt) {
		if(sidebarToggle == false)
		{
			sidebarToggle = true;
			$('div#right span.togglesidebar').click();
		}

		setTimeout(function() { sidebarToggle = false; }, 100);
	});								
	
	var deleteListShortcut = '';
	if (wunderlist.settings.os === 'darwin') 
	{
		deleteListShortcut = wunderlist.settings.shortcutkey + '+backspace' 
	}
	else 
	{
		deleteListShortcut = 'delete';
	}
	
	// Cmd+Backspace / Del - Delete selected list
	shortcut.add(deleteListShortcut, function (event) {
		if ($('textarea:focus').length === 0 && $('input:focus').length === 0) {
			if (hotkeys.eventListener === false) {
				hotkeys.eventListener = true;
				
				var listElement = $('div#lists a.ui-state-disabled');
				
				if (listElement.length === 1 && listElement.attr('id').replace('list', '') !== 1) {			
					wunderlist.helpers.dialogs.createDeleteListDialog();
				}	
			
				setTimeout(function() {
				  hotkeys.eventListener = false;
				}, 100);				
			}
		}
	}, {"propagate" : true});
	
	// Hotkey cmd / strg + i - Open the inbox
	shortcut.add(wunderlist.settings.shortcutkey + '+i', function (event) {
		if (hotkeys.eventListener === false) {
			hotkeys.eventListener = true;
			// Only open the list when it's not the inbox
			if ($('div#lists a.ui-state-disabled') != undefined || $('div#lists a.ui-state-disabled').attr('id').replace('list', '') != 1) {
				wunderlist.frontend.lists.openList(1);
			}
			setTimeout(function() { 
			  hotkeys.eventListener = false; 
			}, 100);				
		}
	});
	
	// Save note and close the dialog
	shortcut.add(wunderlist.settings.shortcutkey + '+Enter', function (event) {
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
});