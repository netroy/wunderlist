/*****************************************************************************************************************************/
// List functionality

/**
 * Activate/deactivate the "focusout" eventlistener
 *
 * @author Daniel Marschner
 */
var listEventListener = false;
var ListElementName   = '';
var delete_dialog;

/**
 * Stops the "keydown" event by using the shortcut CTRL+L to add a new list
 *
 * @author Daniel Marschner
 */
var listShortcutListener = 0;

/**
 * Calls the function to adds a new list on clicking the add button
 *
 * @author Dennis Schneider
 */
bindListAddMode = function() {
	$('.addlist').live('click', function() {
		
		if (settings.sidebar_opened_status == 'false')
		{
			$('div#right span.togglesidebar').click();
		}
	
		addList();
		makeListsSortable();
    });
};

/**
 * Adds a new list on clicking the add button
 *
 * @author Dennis Schneider
 */
addList = function() {
	// Add new list
    $('div#lists').append(html.generateNewListElementHTML());

    // Hide add button
    $('h3 .add').hide();

    // Show edit & delete button
    $('input.input-list').parent().children('.savep').show();
    $('input.input-list').parent().children('.deletep').show();

    // Text cursor on input field
    $('input.input-list').focus();

	setTimeout(function() { listShortcutListener = 0 }, 50);

	makeListsSortable();
};

/**
 * Starts the edit mode of a list
 *
 * @author Dennis Schneider
 * @author Christian Reber
 * @author Daniel Marschner
 */
bindListEditMode = function() {
	$('#lists div.editp').live('click', function() {
		$(this).hide();

		listEditMode($(this).parent('a'));
	});

	$('#lists a.list').live('dblclick', function() {
	
		if($(this).children('input').length == 0)
		{
			$(this).children('div.editp').hide();

			listEditMode($(this));
		}
	});
};

/**
 * Show the edit mode for the given list
 *
 * @author Dennis Schneider
 * @author Christian Reber
 * @author Daniel Marschner
 */
listEditMode = function(listElement) {
	ListElementName = listElement.find('b').text();

	wunderlist.timer.pause();

	listElement.find('b').hide();
	listElement.find('span').before('<input type="text" maxlength="255" value="" />');
	listElement.find('input').val(unescape(ListElementName)).select();
	listElement.find('input').focus();

	listElement.find('.savep').show();
	listElement.find('.deletep').show();
};

/**
 * Calls a funktion to save a new/edited list
 *
 * @author Daniel Marschner
 */
bindListSaveMode = function() {
	$('#lists div.savep').live('click', function() {
		var listElement = $(this).parent('a');
		var listId		= listElement.attr('id').replace('list', '');

		wunderlist.timer.resume();

		if(listId != 'x')
			saveList(listElement);
		else
			saveNewList(listElement);
	});
};

/**
 * Saves a edited list
 *
 * @author Daniel Marschner
 */
saveList = function(listElement) {
	var listElementInput = listElement.children('input');
	var listElementTitle = listElement.children('b');
	
    var listElementName  = wunderlist.strip_tags(wunderlist.database.convertString(listElementInput.val()));

	if (listElementName == '')
		listElementName = wunderlist.language.data.new_list;

	if (listElement.hasClass('ui-state-disabled'))
		$('#content h1').text(unescape(listElementName));
	
	listElementInput.remove();
	
	var listElementTitleSplit = listElementTitle.html().split("<");
	newTitle = unescape(listElementName) + "<" + listElementTitleSplit[1];
	listElementTitle.html(newTitle).fadeIn();
	
	list.id   = listElement.attr('id').replace('list', '');
	list.name = listElementName;
	list.update();
	
	listElement.children('.savep').hide();
	listElement.children('.deletep').hide();

	if (listElementName.length > 30)
		listElement.children('b').attr('title', unescape(listElementName));

	listElement.click();
}

/**
 * Cancel adding a new list
 *
 * @author Dennis Schneider
 */
cancelSaveList = function(cancelEdit) {
	if (cancelEdit == undefined || cancelEdit == false)
	{
		$('div#lists a#x:last').remove();
	}
	else if (cancelEdit == true)
	{
		var listElement         = $('div#lists a.ui-state-disabled');
		var listElementInput    = listElement.children('input');
		listElementInput.val(ListElementName);
		saveList(listElement);
	}
};

/**
 * Saves a new list
 *
 * @author Daniel Marschner
 */
saveNewList = function(listElement) {
    var listElementInput = listElement.children('input');
	var listElementName  = wunderlist.database.convertString(listElementInput.val());

	if (listElementName == '')
		listElementName = wunderlist.language.data.new_list;
	
	list.name  = listElementName;
	var listId = list.insert();

    listElementInput.remove();

    var listHTML = '<b class="sharep">' + wunderlist.strip_tags(unescape(listElementName)) + '<div class="sharelist"></div></b>';

	listElement.children('.savep').hide();
	listElement.children('.deletep').hide();
	listElement.find('span').before(listHTML);
	listElement.attr('id', 'list' + listId);

	if (listElementName.length > 30)
		listElement.children('b').attr('title', unescape(listElementName));

    $('h3 .add').fadeIn();

    makeListsDropable();

    listElement.click();
    
    if (wunderlist.account.isLoggedIn() == false)
    {
    	$('div.sharelist').remove();
    }
};

/**
 * Delete the list finally
 *
 * @author Christian Reber
 */
deleteList = function(listId, listElement) {
	listEventListener = false;

	if (listElement == undefined)
		listElement = $('div#lists a.ui-state-disabled');
	
	if (listId == undefined)
		listId = (listElement.attr('id') != undefined) ? listElement.attr('id').replace('list', '') : undefined;

	if (listId != undefined && listId != 1)
	{
		if (listId != 'x')
		{			
			if (notes.window != undefined) {
				_return = false;
				dbTasks = wunderlist.database.getTasks(undefined, listId)
				
				if (dbTasks.length > 0) {
					for (x in dbTasks) {
						if (_return == false) {
							_return = notes.closeNoteWindow(dbTasks[x].id);
						}
					}
				}
			}
			
			list.id      = listId;
			list.deleted = 1;
			list.update();		
		}
	
		listElement.remove();
		
		openList(1);
	}
};

/**
 * Deletes a unsaved/saved list
 *
 * @author Christian Reber
 */
bindListDeleteMode = function() {
    // Delete tasks button
    $('#lists div.deletep').live('click', function() {
    	if (settings.getDeleteprompt() == 1)
    	{
    		dialogs.createDeleteListDialog($(this).parent().attr('id').replace('list', ''), $(this).parent());
			dialogs.openDialog(delete_dialog);
		}
		else
		{
			cancelSaveList();
			deleteList($(this).parent().attr('id').replace('list', ''), $(this).parent());
		}
    });
};

/**
 * Get all tasks of the selected list
 *
 * @author Dennis Schneider, Christian Reber, Daniel Marschner
 */
var listOpenHandler = false;

openList = function(list_id) {
	if (listOpenHandler === false)
	{
		listOpenHandler = true;
	
		// Clear content
		var content = $('#content');
		content.html('').hide();
	
		if (list_id == undefined)
			list_id = settings.load_last_opened_list(); // Default 1
	
		if (wunderlist.database.existsById('lists', list_id) == false)
			list_id = 1;
	
		var dbList  = wunderlist.database.getLists(list_id);
		var dbTasks = wunderlist.database.getTasks(undefined, list_id);
		
		$('#content').append(html.generateListContentHTML(dbList[0].id, dbList[0].name));
		$("#list").append(wunderlist.database.initTasks(dbTasks));

		makeSortable();
		
		wunderlist.database.getLastDoneTasks(list_id);
	
		html.make_timestamp_to_string();
	
		settings.save_last_opened_list(list_id);
		html.createDatepicker();
		wunderlist.timer.resume();
		Search.clear();
	    
		// Make everything droppable
		$("a.list").droppable({ disabled: false });
		$("#lists a#list" + list_id).droppable({ disabled: true }); // Activate list
		$('#bottombar #left a').removeClass('active');
	    
		content.fadeIn('fast');
		
		setTimeout(function() { listOpenHandler = false }, 100);
		
		// If there is another list in edit mode, save it after opening the other list
        if ($('a.list input').length == 1)
        {
            $('a.list input').focusout();
        }
	}
};

/**
 * make Lists Sortable
 *
 * @author Marvin Labod
 */
makeListsSortable = function() {
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
};

/**
 * Save the list position
 *
 * @author Dennis Schneider
 */
saveListPosition = function() {
    // Get all tasks from current list
    var lists = $("div#sidebar div#lists a");
    i = 0;

    // Call async function to update the position
    jQuery.eachAsync(lists, {
        delay : 0,
        bulk  : 0,
        loop  : function() {
            list.id       = lists.eq(i).attr("id").replace('list', '');
            list.position = i + 1;
            list.update();
            
            i++;
        }
    });
};

$(function() {
	makeListsSortable();

	// Binding the list functionality
	bindListAddMode();
	bindListEditMode();
	bindListDeleteMode();
	bindListSaveMode();

	// Open a list on "click" (MOUSE CLICK)
	$("a.list").live('click', function() {
		if($('ul#list').attr('rel') != $(this).attr('id').replace('list', '') && $(this).attr('id').replace('list', '') != 'x')
			openList($(this).attr('id').replace('list', ''));
    });

    // Show option buttons on "mouseover"
    $("a.list").live('mouseover', function() {
    	var countInput = $(this).children('input').length;

		if(countInput == 0)
			$(this).children('.editp').show();

		if($(this).attr('id').replace('list', '') != 'x' && $(this).attr('id').replace('list', '') != 1)
			$(this).children('.deletep').show();
    });

    // Hide option buttons on "mouseout"
	$("a.list").live('mouseout', function() {
    	var countInput = $(this).children('input').length;

		$(this).children('.editp').hide();

		if(countInput == 0)
			$(this).children('.deletep').hide();
    });

	// Kills the "focusout" eventlistener
	$('a.list .deletep').live('mouseover', function() {
		listEventListener = true;
	});

	// Activates the "focusout" eventlistener
	$('a.list .deletep').live('mouseout', function() {
		listEventListener = false;
	});

	// Save the list on "keyup" (ENTER)
	$('a.list input').live('keyup', function(event) {
		wunderlist.timer.pause();
		var aimSetting = parseInt(Titanium.App.Properties.getString('add_item_method', '0'));
		
		if (event.keyCode == 13 && aimSetting == 0)
		{
			listEventListener = true;
			var listElement = $(this).parent('a');
			var list_id     = listElement.attr('id').replace('list', '');	
			
			wunderlist.timer.resume();

			if (list_id != 'x')
				saveList(listElement);
			else
				saveNewList(listElement);
		}
	});

    /**
     * Save the list on "focusout" (Mouse Click)
     *
     * @author Dennis Schneider, Christian Reber
     */
	$('a.list input').live('focusout', function(event) {
		if (event.keyCode != 13 && event.keyCode != 27 && listEventListener == false)
		{
		    listEventListener = true;
			//if ($('div#lists a#x').length == 0)
			//{
				var listElement = $(this).parent('a');
				var listId      = listElement.attr('id').replace('list', '');

				wunderlist.timer.resume();
                
				if (listId != 'x')
					saveList(listElement);
				else
					saveNewList(listElement);
	
				listElement.children('.editp').hide();
				listElement.children('.deletep').hide();
				
				setTimeout(function() { listEventListener = false }, 500);
			/*}
			else
			{
			    if (listEventListener == false)
			    {
			        var listElement = $(this).parent('a');
			        saveNewList(listElement);
			    }
			}*/
		}
		else
			listEventListener = false;
	});

	/**
	 * Show older tasks
	 *
	 * @author Marvin Labod
	 */
	$('button#older_tasks_head').live('click', function() {
		$('#older_tasks').slideDown(function() {
			$('button#hide_older_tasks').fadeIn();
		});
		
		$(this).hide();
	});


	$('button#hide_older_tasks').live('click', function() {
		$('#older_tasks').slideUp(function() {
			$('button#older_tasks_head').fadeIn();
		});
		
		$(this).hide();
	});
});
