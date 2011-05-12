var hotkeys = hotkeys || {};

hotkeys.eventListener = false;

$(function() {

	// Shortcut Bind Command(or Ctrl)+1 - go to filter list all
	$(document).bind('keydown', settings.shortcutkey + '+1', function (evt) {
		$('a#all').click();
	});

	// Shortcut Bind Command(or Ctrl)+2 - go to filter list starred
	$(document).bind('keydown', settings.shortcutkey + '+2', function (evt) {
		$('a#starred').click();
	});

	// Shortcut Bind Command(or Ctrl)+3 - go to filter list done
	$(document).bind('keydown', settings.shortcutkey + '+3', function (evt) {
		$('a#done').click();
	});

	// Shortcut Bind Command(or Ctrl)+4 - go to filter list today
	$(document).bind('keydown', settings.shortcutkey + '+4', function (evt) {
		$('a#today').click();
	});

	// Shortcut Bind Command(or Ctrl)+5 - go to filter list tomorrow
	$(document).bind('keydown', settings.shortcutkey + '+5', function (evt) {
		$('a#tomorrow').click();
	});

	// Shortcut Bind Command(or Ctrl)+6 - go to filter list next 7 days
	$(document).bind('keydown', settings.shortcutkey + '+6', function (evt) {
		$('a#thisweek').click();
	});

	// Shortcut Bind Command(or Ctrl)+7 - go to filter list later
	$(document).bind('keydown', settings.shortcutkey + '+7', function (evt) {
		$('a#someday').click();
	});

	// Shortcut Bind Command(or Ctrl)+8 - go to filter list without date
	$(document).bind('keydown', settings.shortcutkey + '+8', function (evt) {
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
		$(document).bind('keydown', settings.shortcutkey + '+q', function (event) {
			if (listShortcutListener == 0)
				Titanium.App.exit();
		});
	}	
	
	/**
	 * Printing with Ctrl / Command + P
	 *
	 * @author Christian Reber,  Daniel Marschner, Dennis Schneider
	 */
	$(document).bind('keydown', settings.shortcutkey + '+p', function (evt) {
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
	$(document).bind('keydown', settings.shortcutkey + '+s', function (evt) {
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
	$(document).bind('keydown', {combi: settings.shortcutkey + '+a', disableInInput: true} , function (evt) {
		evt.stopPropagation();  
	    evt.preventDefault();
	    return false;
	});
	
	// Shortcut Bind Command (or Ctrl) + L - New list
	$(document).bind('keydown', settings.shortcutkey + '+l', function (event) {
		if ($('[role="dialog"]').length == 0)
		{
			tasks.cancel();
	
	        if($(register_dialog).dialog('isOpen') == false || wunderlist.account.isLoggedIn() == true)
			{
				$('h3 .add').hide();
	
				if(listShortcutListener == 0)
					addList();
	
				listShortcutListener++;
			}
		}
	});
	
	var stepUp   = false;
	var stepDown = false;	
	
	// Shortcut Bind Command(or Ctrl)+Up - Step through lists
	$(document).bind('keydown', 'up', function (evt) {
		if(stepUp == false && $('textarea:focus').length == 0 && $('input:focus').length == 0)
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
	});
	
	// Shortcut Bind Command(or Ctrl)+Down - Step through lists
	$(document).bind('keydown', 'down', function (evt) {
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
	});	

	// Shortcut Bind Command(or Ctrl)+F - Search
	$(document).bind('keydown', settings.shortcutkey + '+f', function (evt) {
		tasks.cancel();

        focusSearch++;

        if(focusSearch == 1)
            $('input#search').focus();

        setTimeout(function() { focusSearch = 0; }, 1000);
	});

	var documentEscapeActive = false;
	
	// Shortcut Bind Esc - Go to my tasks
	$(document).bind('keydown', 'Esc', function (evt) {	
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
	$(document).bind('keydown', settings.shortcutkey + '+n', function (evt) {
		tasks.cancel();

        if($(register_dialog).dialog('isOpen') == false || wunderlist.account.isLoggedIn() == true)
			$('.add input.input-add').focus();
	});

	// Shortcut Bind Command (or Ctrl) + T - Add new task
	$(document).bind('keydown', settings.shortcutkey + '+t', function (evt) {
		tasks.cancel();

        if($(register_dialog).dialog('isOpen') == false || wunderlist.account.isLoggedIn() == true)
			$('.add input.input-add').focus();
	});
	
	var sidebarToggle = false;

	// Shortcut Bind Command(or Ctrl)+b - Hide the sidebar
	$(document).bind('keydown', settings.shortcutkey + '+b', function (evt) {
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
		deleteListShortcut = 'del';
	}
	
	// Cmd+Backspace / Del - Delete selected list
	$(document).bind('keydown', deleteListShortcut, function (event) {
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
	});
	
	// Hotkey cmd / strg + i - Open the inbox
	$(document).bind('keydown', settings.shortcutkey + '+i', function (event) {
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
});