/**
 * notes.js
 *
 * Contains all the note functionality
 *
 * @author Marvin Labod, Dennis Schneider
 */

var notes = notes || {};

/**
 * Hide all the note elements
 *
 * @author Dennis Schneider
 */
notes.hideNoteElements = function()
{
	notes.listItems.toggle();
	notes.note.toggle();
	$('div#note input#cancel-note').hide();
	$('div#note input#save-note').hide();
}

/**
 * Show all the note elements
 *
 * @author Dennis Schneider
 */
notes.showNoteElements = function()
{
	notes.listItems.hide();
	notes.note.show();
	notes.noteIcons.removeClass("activenote");
	$('div#note input#cancel-note').show();
	$('div#note input#save-note').show();
}

// Loaded on start
$(function()
{
	notes.noteIcons = $('li.more span.note');
	notes.listItems = $('div#lists');
	notes.note      = $('#note textarea');

	// Hide Note initially
	notes.note.hide();
			
	// Click on Note Icon
	$('li.more span.note').live('click', function()
	{
		notes.noteIcons = $('li.more span.note');
		notes.listItems = $('div#lists');
		notes.note      = $('#note textarea');

		var task_id = $(this).parent().attr('id');
		notes.note.attr('id', task_id);
		var noteContent = wunderlist.getNoteForTask(task_id);
		notes.note.val(noteContent);
		
		if($(this).hasClass("activenote"))
		{
			notes.hideNoteElements();
			$(this).toggleClass("activenote");
		} 
		else 
		{
			notes.showNoteElements();
			notes.noteIcons.removeClass("activenote");
			$(this).addClass("activenote");		
		}
	});

	// Save the note
	$('div#note input#save-note').live('click', function()
	{
		notes.noteIcons = $('li.more span.note');
		notes.listItems = $('div#lists');
		notes.note      = $('#note textarea');

		var note_text = notes.note.val();
		var task_id   = notes.note.attr('id');
		wunderlist.saveNoteForTask(note_text, task_id);

		notes.noteIcons.removeClass("activenote");
		notes.hideNoteElements();

		timer.resume();
	});

	// Save the note
	$('div#note input#cancel-note').live('click', function()
	{
		notes.noteIcons = $('li.more span.note');
		notes.listItems = $('div#lists');
		notes.note      = $('#note textarea');

		var task_id   = notes.note.attr('id');
		var noteContent = wunderlist.getNoteForTask(task_id);

		notes.noteIcons.removeClass("activenote");
		notes.note.val(noteContent);
		notes.hideNoteElements();

		timer.resume();
	});

	$('#note textarea').live('keyup', function(e)
	{
		timer.pause();
	});


	var saveNoteCommand = false;

	// Save the note with ctrl / command + return key
	$(document).bind('keydown', shortcutkey + '+return', function (evt)
	{
		if(($('#note textarea:focus').length == 1 || $('#note textarea').css('display') == 'block') && saveNoteCommand == false)
		{
			saveNoteCommand = true;
			$('div#note input#save-note').click();
			setTimeout(function() {saveNoteCommand = false}, 1000);
		}
	});
});