/*****************************************************************************************************************************/
// List functionality

/**
 * Activate/deactivate the "focusout" eventlistener
 *
 * @author Daniel Marschner
 */
var listEventListener = false;

var delete_dialog;
var delete_item;

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
function bindListAddMode()
{
	$('h3 .add').live('click', function() {
		addList();
		makeListsSortable();
    });
}

/**
 * Adds a new list on clicking the add button
 *
 * @author Dennis Schneider
 */
function addList()
{
	// Add new list
    $('#lists').append(generateNewListElementHTML());

    // Hide add button
    $('h3 .add').hide();

    // Show edit & delete button
    $('input.input-list').parent().children('.savep').show();
    $('input.input-list').parent().children('.deletep').show();

    // Text cursor on input field
    $('input.input-list').focus();

	setTimeout(function() { listShortcutListener = 0 }, 50);

	makeListsSortable();
}

/**
 * Starts the edit mode of a list
 *
 * @author Dennis Schneider
 * @author Christian Reber
 * @author Daniel Marschner
 */
function bindListEditMode()
{
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
}

/**
 * Show the edit mode for the given list
 *
 * @author Dennis Schneider
 * @author Christian Reber
 * @author Daniel Marschner
 */
function listEditMode(listElement)
{
	var ListElementName = listElement.find('b').text();

	timer.pause();

	listElement.find('b').remove();
	listElement.find('span').before('<input type="text" maxlength="50" value="' + ListElementName + '" />');
	listElement.find('input').focus();

	listElement.find('.savep').show();
	listElement.find('.deletep').show();
}

/**
 * Calls a funktion to save a new/edited list
 *
 * @author Daniel Marschner
 */
function bindListSaveMode()
{
	$('#lists div.savep').live('click', function() {
		var listElement = $(this).parent('a');
		var listId		= listElement.attr('id');

		timer.resume();

		if(listId != 'x')
			saveList(listElement);
		else
			saveNewList(listElement);
	});
}

/**
 * Saves a edited list
 *
 * @author Daniel Marschner
 */
function saveList(listElement)
{
	var listElementInput = listElement.children('input');
    var listElementName  = convertStringForDB(listElementInput.val());

	if(listElementName == '')
		listElementName = language.data.new_list;

	if(listElement.hasClass('ui-state-disabled') && listElementName != '')
		$('#content h1').text(unescape(listElementName));

	wunderlist.updateList(listElement.attr("id"), listElementName);

    listElementInput.remove();

	if(listElement.attr('id') == 1)
		html = '<b class="inbox">' + unescape(listElementName) + '</b>';
	else
		html = '<b>' + unescape(listElementName) + '</b>';

	listElement.children('.savep').hide();
	listElement.children('.deletep').hide();
	listElement.find('span').before(html);

	if(listElementName.length > 30)
		listElement.children('b').attr('title', unescape(listElementName));

	listElement.click();
}

/**
 * Saves a new list
 *
 * @author Daniel Marschner
 */
function saveNewList(listElement)
{
    var listElementInput = listElement.children('input');
	var listElementName  = convertStringForDB(listElementInput.val());

	if(listElementName == '')
		listElementName = language.data.new_list;

	var listId = wunderlist.createList(listElementName);

    listElementInput.remove();

    html = '<b>' + unescape(listElementName) + '</b>';

	listElement.children('.savep').hide();
	listElement.children('.deletep').hide();
	listElement.find('span').before(html);
	listElement.attr('id', listId);

	if(listElementName.length > 30)
		listElement.children('b').attr('title', unescape(listElementName));

    $('h3 .add').fadeIn();

    makeListsDropable();

    listElement.click();
}

/**
 * Delete the list finally
 *
 * @author Christian Reber
 */
function deleteList() {
	listEventListener = false;
	var listElement   = $(delete_item).parent();
	var listId 		  = listElement.attr('id');

	if(listId != '1' && listId != 'x')
	{
		$('div#content').html('');
		wunderlist.deleteListById(listId);
	}

	listElement.remove();

    $('a.list input').focus();

	$(delete_dialog).dialog('close');

	openList(1);

	$('h3 .add').show();
}

/**
 * Deletes a unsaved/saved list
 *
 * @author Christian Reber
 */
function bindListDeleteMode()
{
	var buttonOptions = {};
	buttonOptions[language.data.list_delete_no]  = function() { $(this).dialog('close'); $('a.list input').focus(); };
	buttonOptions[language.data.list_delete_yes] = deleteList;

	delete_dialog = $('<div></div>')
		.dialog({
			autoOpen: false,
			draggable: false,
			dialogClass: 'dialog-delete-list',
			title: language.data.delete_list_question,
			buttons: buttonOptions,
			open: function(event, ui) {
				$('.ui-dialog-buttonset button:last').focus();
			}
	});

    // Delete tasks button
    $('#lists div.deletep').live('click', function() {
		delete_item = this;
		$(delete_dialog).dialog('open');
    });
}

/**
 * Get all tasks of the selected list
 *
 * @author Dennis Schneider
 * @author Christian Reber
 * @author Daniel Marschner
 */
function openList(list_id)
{
	// Clear content
	var content = $('#content');
	content.html("").hide();

	if (list_id == undefined)
		list_id = load_last_opened_list(); // Default 1

	if (wunderlist.listExistsById(list_id) == false)
		list_id = 1;

	wunderlist.getListById(list_id);
	makeSortable();
	wunderlist.getLastDoneTasks(list_id);

	make_timestamp_to_string();

	save_last_opened_list(list_id);
	createDatepicker();
	timer.resume();
	Search.clear();

	// Make everything droppable
	$("a.list").droppable({ disabled: false });
	$("#lists a#" + list_id).droppable({ disabled: true }); // Activate list
	$('#bottombar #left a').removeClass('active');

	content.fadeIn('fast');
}

/**
 * make Lists Sortable
 *
 * @author Marvin Labod
 */
makeListsSortable = function()
{
	$("#lists").sortable({
		axis: 'y',
		scroll: false,
		cursor: 'pointer',
		placeholder: 'placeholder',
		distance: 20,
		items: '.sortablelist',
		update: saveListPosition
	});
}

/**
 * Save the list position
 *
 * @author Dennis Schneider
 */
function saveListPosition(event, ui)
{
    // Get all tasks from current list
    var lists = $("div#sidebar div#lists a");
    i = 0;

    // Call async function to update the position
    jQuery.eachAsync(lists, {
        delay: 0,
        bulk: 0,
        loop: function()
        {
            list_id = lists.eq(i).attr("id");
            if(list_id != 1)
            	wunderlist.updateListPosition(list_id, i + 1);
            i++;
        }
    });
}

$(function() {

	makeListsSortable();

	// Binding the list functionality
	bindListAddMode();
	bindListEditMode();
	bindListDeleteMode();
	bindListSaveMode();

	// Shortcut Bind Command (or Ctrl) + L - New list
	$(document).bind('keydown', shortcutkey + '+l', function (event) {
		cancelSaveTask();

        if($(register_dialog).dialog('isOpen') == false || wunderlist.isUserLoggedIn() == true)
		{
			$('h3 .add').hide();

			if(listShortcutListener == 0)
				addList();

			listShortcutListener++;
		}
	});

	// Open a list on "click" (MOUSE CLICK)
	$("a.list").live('click', function() {
		if($('ul#list').attr('rel') != $(this).attr('id') && $(this).attr('id') != 'x')
			openList($(this).attr('id'));
    });

    // Show option buttons on "mouseover"
    $("a.list").live('mouseover', function() {
    	var countInput = $(this).children('input').length;

		if(countInput == 0)
			$(this).children('.editp').show();

		if($(this).attr('id') != 'x')
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
	$('a.list input').live('keyup', function(event)
	{
		timer.pause();
		if(event.keyCode == 13 || event.keyCode == 27)
		{
			listEventListener = true;
			var listElement = $(this).parent('a');
			var list_id = listElement.attr('id');

			timer.resume();

			if (list_id != 'x')
				saveList(listElement);
			else
				saveNewList(listElement);
		}
	});

    /**
     * Save the list on "focusout" (Mouse Click)
     *
     * @author Christian Reber
     */
	$('a.list input').live('focusout', function(event)
	{
		if(event.keyCode != 13 && event.keyCode != 27 && listEventListener == false)
		{
			var listElement = $(this).parent('a');
			var listId = listElement.attr('id');

			timer.resume();

			if(listId != 'x')
				saveList(listElement);
			else
				saveNewList(listElement);

			listElement.children('.editp').hide();
			listElement.children('.deletep').hide();
		}
		else
			listEventListener = false;
	});

	var stepUp = false;

	// Shortcut Bind Command(or Ctrl)+Up - Step through lists
	$(document).bind('keydown', shortcutkey + '+up', function (evt) {
		if(stepUp == false)
		{
			stepUp   = true;
			$element = $('div#lists > a.ui-state-disabled');
			if($element.prev().attr('id') == undefined)
			{
				$('div#lists a').last().click();
			}
			else
			{
				$('div#lists > a.ui-state-disabled').prev().click();
			}
		}

		setTimeout(function()
		{
			stepUp = false;
		}, 100);
	});

	var stepDown = false;

	// Shortcut Bind Command(or Ctrl)+Down - Step through lists
	$(document).bind('keydown', shortcutkey + '+down', function (evt) {
		if(stepDown == false)
		{
			stepDown = true;
			$element = $('div#lists > a.ui-state-disabled');
			if($element.next().attr('id') == undefined)
			{
				$('div#lists a').first().click();
			}
			else
			{
				$('div#lists > a.ui-state-disabled').next().click();
			}
		}

		setTimeout(function()
		{
			stepDown = false;
		}, 100);
	});

	/**
	 * Show older tasks
	 *
	 * @author Marvin Labod
	 */
	$('#older_tasks_head').live('click', function() {
		$('#older_tasks').slideDown();
		$(this).remove();
	});
});
