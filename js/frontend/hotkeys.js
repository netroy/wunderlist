var hotkeys = hotkeys || {};

hotkeys.eventListener = false;

$(function() {
	
	// Shortcut Bind Command(or Ctrl)+1 - go to filter list all
	shortcut.add(settings.shortcutkey + '+1', function () {
		if ($('[role="dialog"]').length == 0 && $('textarea:focus').length == 0 && $('input:focus').length == 0)
			$('a#all').click();
	});

	// Shortcut Bind Command(or Ctrl)+2 - go to filter list starred
	shortcut.add(settings.shortcutkey + '+2', function() {
		if ($('[role="dialog"]').length == 0 && $('textarea:focus').length == 0 && $('input:focus').length == 0)
			$('a#starred').click();
	});

	// Shortcut Bind Command(or Ctrl)+3 - go to filter list done
	shortcut.add(settings.shortcutkey + '+3', function() {
		if ($('[role="dialog"]').length == 0 && $('textarea:focus').length == 0 && $('input:focus').length == 0)
			$('a#done').click();
	});

	// Shortcut Bind Command(or Ctrl)+4 - go to filter list today
	shortcut.add(settings.shortcutkey + '+4', function() {
		if ($('[role="dialog"]').length == 0 && $('textarea:focus').length == 0 && $('input:focus').length == 0)
			$('a#today').click();
	});

	// Shortcut Bind Command(or Ctrl)+5 - go to filter list tomorrow
	shortcut.add(settings.shortcutkey + '+5', function() {
		if ($('[role="dialog"]').length == 0 && $('textarea:focus').length == 0 && $('input:focus').length == 0)
			$('a#tomorrow').click();
	});

	// Shortcut Bind Command(or Ctrl)+6 - go to filter list next 7 days
	shortcut.add(settings.shortcutkey + '+6', function() {
		 if ($('[role="dialog"]').length == 0 && $('textarea:focus').length == 0 && $('input:focus').length == 0)
			$('a#thisweek').click();
	});

	// Shortcut Bind Command(or Ctrl)+7 - go to filter list later
	shortcut.add(settings.shortcutkey + '+7', function() {
		if ($('[role="dialog"]').length == 0 && $('textarea:focus').length == 0 && $('input:focus').length == 0)
			$('a#someday').click();
	});

	// Shortcut Bind Command(or Ctrl)+8 - go to filter list without date
	shortcut.add(settings.shortcutkey + '+8', function() {
		if ($('[role="dialog"]').length == 0 && $('textarea:focus').length == 0 && $('input:focus').length == 0)
			$('a#withoutdate').click();
	});
	
	/**
	 * Little workaround bugfix for Mac OS X (sorry, but there is no way around)
	 * Shortcut Bind Command (or Ctrl) + Q
	 *
	 * @author Christian Reber
	 */
	if (settings.os === 'darwin')
	{
		shortcut.add(settings.shortcutkey + '+q', function () {
			if (listShortcutListener == 0)
			{
				settings.save_window_position();
				Titanium.App.exit();
			}
		});
	}
	
	/**
	 * Printing with Ctrl / Command + P
	 *
	 * @author Christian Reber,  Daniel Marschner, Dennis Schneider
	 */
	shortcut.add(settings.shortcutkey + '+p', function (evt) {
		if(printShortcutListener == 0)
			share.print();

		printShortcutListener++;

		setTimeout(function() { printShortcutListener = 0 }, 50);
	});
	
	/**
	 * Sync with Ctrl + S
	 *
	 * @author Daniel Marschner
	 */
	shortcut.add(settings.shortcutkey + '+s', function (evt) {
		tasks.cancel();

        if ($(register_dialog).dialog('isOpen') == false || wunderlist.account.isLoggedIn() == true)
		{
			if (syncShortcutListener == 0 && wunderlist.sync.isSyncing == false)
			{
				wunderlist.timer.stop();
				wunderlist.sync.fireSync();
			}

			syncShortcutListener++;

			setTimeout(function() {syncShortcutListener = 0}, 50);
		}
	});
	
	// For removing select all
	shortcut.add(settings.shortcutkey + '+a', function (e) { 
		if ($('textarea:focus').length == 1) {
			$('textarea').select();
		} else if ($('input:focus').length == 1) {
			$('input').select();
		}			
	}, {'disable_in_input' : false});
	
	// Shortcut Bind Command (or Ctrl) + L - New list
	shortcut.add(settings.shortcutkey + "+l",function() {
		if ($('[role="dialog"]').length == 0)
		{
			tasks.cancel();
			$('h3 .add').hide();

			if(listShortcutListener == 0)
				addList();

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
	shortcut.add(settings.shortcutkey + '+f', function (evt) {
		tasks.cancel();

        focusSearch++;

        if(focusSearch == 1)
            $('input#search').focus();

        setTimeout(function() { focusSearch = 0; }, 1000);
	});

	var documentEscapeActive = false;
	
	// Shortcut Bind Esc - Go to my tasks
	shortcut.add('Esc', function (evt) {	
		if (($(register_dialog).dialog('isOpen') == false || wunderlist.account.isLoggedIn() == true) && documentEscapeActive == false)
		{
			documentEscapeActive = true;
			
			if ($('div.add .input-add:focus').length == 0 && $('#task-edit:focus').length == 0 && !cancelEditTask && $('#lists a.list input').length == 0 && $('#note textarea:focus').length == 0 && $('#note textarea').css('display') == 'none')
			{
				$("#left a").removeClass("active");
				$("input#search").val('').blur();
				openList(1);
			}
			else if ($('#note textarea:focus').length == 1 || $('#note textarea').css('display') == 'block')
			{
				$('div#note a#cancel-note').click();
			}
			else if ($('div#lists a#x:last').length > 0)
			{
				cancelSaveList(false);
			}
			else if($('a.list input').length > 0)
			{	
				cancelSaveList(true);
			}
			else if (tasks.datePickerOpen == true)
			{
				$('.datepicker').datepicker('hide');
			}
			else
			{
				tasks.cancel();
				cancelEditTask = true;
			}
			
			setTimeout(function() { cancelEditTask = false; documentEscapeActive = false; }, 1000);
		}
	});
	
	// Shortcut Bind Command (or Ctrl) + N - Add new task
	shortcut.add(settings.shortcutkey + '+n', function (evt) {
		tasks.cancel();

        if($(register_dialog).dialog('isOpen') == false || wunderlist.account.isLoggedIn() == true)
			$('.add input.input-add').focus();
	});

	// Shortcut Bind Command (or Ctrl) + T - Add new task
	shortcut.add(settings.shortcutkey + '+t', function (evt) {
		tasks.cancel();

        if($(register_dialog).dialog('isOpen') == false || wunderlist.account.isLoggedIn() == true)
			$('.add input.input-add').focus();
	});
	
	var sidebarToggle = false;

	// Shortcut Bind Command(or Ctrl)+b - Hide the sidebar
	shortcut.add(settings.shortcutkey + '+b', function (evt) {
		if(sidebarToggle == false)
		{
			sidebarToggle = true;
			$('div#right span.togglesidebar').click();
		}

		setTimeout(function() { sidebarToggle = false; }, 100);
	});								
	
	var deleteListShortcut = '';
	if (settings.os === 'darwin') 
	{
		deleteListShortcut = settings.shortcutkey + '+backspace' 
	}
	else 
	{
		deleteListShortcut = 'delete';
	}
	
	// Cmd+Backspace / Del - Delete selected list
	shortcut.add(deleteListShortcut, function (event) {
		if ($('textarea:focus').length == 0 && $('input:focus').length == 0)
		{
			if (hotkeys.eventListener == false)
			{
				hotkeys.eventListener = true;
				
				var listElement = $('div#lists a.ui-state-disabled');
				
				if (listElement.length === 1 && listElement.attr('id').replace('list', '') != 1)
				{			
					dialogs.createDeleteListDialog();
				}	
			
				setTimeout(function() { hotkeys.eventListener = false; }, 100);				
			}
		}
	}, {"propagate" : true});
	
	// Hotkey cmd / strg + i - Open the inbox
	shortcut.add(settings.shortcutkey + '+i', function (event) {
		if (hotkeys.eventListener == false)
		{
			hotkeys.eventListener = true;
			
			// Only open the list when it's not the inbox
			if ($('div#lists a.ui-state-disabled') != undefined || $('div#lists a.ui-state-disabled').attr('id').replace('list', '') != 1)
			{
				openList(1);
			}
			setTimeout(function() { hotkeys.eventListener = false; }, 100);				
		}
	});
	
	// Save note and close the dialog
	shortcut.add(settings.shortcutkey + '+Enter', function (event) {
		if ($('input.input-add:focus').length == 1)
		{
			var aimSetting = parseInt(Titanium.App.Properties.getString('add_item_method', '0'));
			
			if (aimSetting == 1)
			{		
				wunderlist.timer.pause();
				tasks.add();
				wunderlist.timer.resume();
			}
		}
		else if ($('a.list input:focus').length == 1)
		{
			var aimSetting = parseInt(Titanium.App.Properties.getString('add_item_method', '0'));
			
			if (aimSetting == 1)
			{
				wunderlist.timer.pause();
				
				listEventListener = true;
				var listElement = $('a.list input').parent('a');
				var list_id     = listElement.attr('id').replace('list', '');	
	
				if (list_id != 'x')
					saveList(listElement);
				else
					saveNewList(listElement);
					
				wunderlist.timer.resume();
			}
		}
	}, {'disable_in_input' : false});
});