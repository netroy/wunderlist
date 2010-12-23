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
	$('div#note a#cancel-note').hide();
	$('div#note a#save-note').hide();
	$('#note textarea').hide();
	notes.cellotape.hide();
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
	notes.cellotape.show();
	$('div#note a#cancel-note').show();
	$('div#note a#save-note').show();
}

// Loaded on start
$(function()
{
	notes.noteIcons = $('ul#list li span.note');
	notes.listItems = $('div#lists');
	notes.note      = $('#note textarea');
	notes.cellotape = $('#cellotape');

	// Hide Note initially
	notes.note.hide();
	notes.cellotape.hide();

	// Click on Note Icon
	$('ul#list li span.note').live('click', function()
	{
		if(notes.currentNoteIcon != undefined)
		{
			$('div#note a#cancel-note').click();
		}

		if(sidebar_opened_status == "false")
		{
			$(".togglesidebar").css("-webkit-transform","rotate(0deg)");
			$("#sidebar").stop().animate({right: '0'});
			$("#lists").stop().animate({right: '0'});
			$("#content").stop().animate({right: '259'});
			sidebar_opened_status = "true";
		}
		
		notes.noteIcons       = $('ul#list li span.note');
		notes.listItems       = $('div#lists');
		notes.note            = $('#note textarea');
		notes.cellotape       = $('#cellotape');
		notes.currentNoteIcon = $(this);

		var task_id = notes.currentNoteIcon.parent().attr('id');
		notes.note.attr('id', task_id);
		var noteContent = wunderlist.getNoteForTask(task_id);

		notes.note.val(noteContent);
		notes.showNoteElements();
		
		$(this).addClass("activenote");
	});

	// Save the note
	$('div#note a#save-note').live('click', function()
	{
		notes.noteIcons = $('ul#list li span.note');
		notes.listItems = $('div#lists');
		notes.note      = $('#note textarea');

		var note_text = notes.note.val();
		var task_id   = notes.note.attr('id');

		if(note_text != '')
		{
			wunderlist.saveNoteForTask(note_text, task_id);
		}
		else
		{
			notes.currentNoteIcon.removeClass('activenote');
		}

		notes.hideNoteElements();

		timer.resume();
	});

	// Save the note
	$('div#note a#cancel-note').live('click', function()
	{
		notes.noteIcons = $('ul#list li span.note');
		notes.listItems = $('div#lists');
		notes.note      = $('#note textarea');

		var task_id     = notes.note.attr('id');
		var noteContent = wunderlist.getNoteForTask(task_id);
		var note_text   = notes.note.val();
		
		if(noteContent == '')
		{
			notes.currentNoteIcon.removeClass('activenote');
		}

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
			$('div#note a#save-note').click();
			setTimeout(function() {saveNoteCommand = false}, 1000);
		}
	});
});