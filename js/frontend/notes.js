/**
 * notes.js
 *
 * Contains all the note functionality
 *
 * @author Marvin Labod, Dennis Schneider
 */

var notes = notes || {};

/**
 * Open Notes Dialog
 *
 * @author Marvin Labod
 */
notes.openNotesDialog = function()
{
	if(notes.notesDialog == undefined)
	{
		notes.notesDialog = dialogs.generateDialog('Notes', html.generateNotesDialogHTML(), 'dialog-notes')
	}
	dialogs.openDialog(notes.notesDialog);
}

// Loaded on start
$(function()
{

	// Click on note icon
	$('ul#list li span.note').live('click', function()
	{
		timer.pause();
		
		notes.openNotesDialog();
		
		notes.noteIcons       = $('ul#list li span.note');
		notes.note            = $('.dialog-notes textarea');
		notes.cellotape       = $('#cellotape');
		notes.currentNoteIcon = $(this);
		notes.currentNoteTitle = $(this).parent().children(".description").text();

		notes.note.focus();
		
		var task_id = notes.currentNoteIcon.parent().attr('id');
		notes.note.attr('id', task_id);
		var noteContent = wunderlist.getNoteForTask(task_id);
		
		// Getting Content Of Note
		$(".notes_buffer textarea").val(html.replace_http_link(unescape(noteContent)));
		
		// Getting Task Title Of Note
		$(".dialog-notes .ui-dialog-title").text(notes.currentNoteTitle);

	});

	// Save the note
	$('.dialog-notes input#save-note').live('click', function()
	{
		notes.noteIcons = $('ul#list li span.note');
		notes.note      = $('.dialog-notes textarea');

		var note_text = notes.note.val();
		var task_id   = notes.note.attr('id');
		
		if(notes.note.val().length == 0) 
		{
			notes.currentNoteIcon.removeClass("activenote");
		}
		else {			
			notes.currentNoteIcon.addClass("activenote");
		}
				
		wunderlist.saveNoteForTask(html.convertStringForDB(note_text), task_id);

		dialogs.closeDialog(notes.notesDialog);

		timer.resume();
	});

	// Cancel the note
	$('.dialog-notes input#cancel-note').live('click', function()
	{
		notes.noteIcons = $('ul#list li span.note');
		notes.note      = $('.dialog-notes textarea');

		var task_id     = notes.note.attr('id');
		var noteContent = wunderlist.getNoteForTask(task_id);
		var note_text   = notes.note.val();

		notes.note.val(noteContent);
		
	    dialogs.closeDialog(notes.notesDialog);

		timer.resume();
	});
});