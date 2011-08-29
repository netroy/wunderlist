/**
 * notes.js
 *
 * Contains all the note functionality
 *
 * @author Marvin Labod, Dennis Schneider, Daniel Marschner
 */
var notes = notes || {};

notes.windows = [];

/**
 * Open Notes Window
 *
 * @author Daniel Marschner
 */
notes.openNotesWindow = function() {
	if (notes.windows[notes.currentNoteId] == null) {
			var notesWindow = Titanium.UI.getCurrentWindow().createWindow({
				url       : "app://note.html",
				width     : parseInt(Titanium.App.Properties.getString('note_user_width', '500')),
		        minWidth  : 500,
		        height    : parseInt(Titanium.App.Properties.getString('note_user_height', '400')),
		        minHeight : 400,
		        maximized : Titanium.App.Properties.getString('maximized', 'false')
			});

			note_user_x = Titanium.App.Properties.getString('note_user_x', 'none');
			note_user_y = Titanium.App.Properties.getString('note_user_y', 'none');

			//if(note_user_x != 'none') notes.window.x = parseInt(note_user_x);
			//if(note_user_y != 'none') notes.window.y = parseInt(note_user_y);

			notesWindow.open();

		notesWindow.noteTitle = notes.format(notes.currentNoteTitle, false);
		notesWindow.text      = notes.currentNote;
		notesWindow.html      = unescape(notes.format(notes.currentNote));
		notesWindow.noteId    = notes.currentNoteId;
		notesWindow.readOnly  = notes.readOnly;
		notesWindow.editMode  = false;
		notesWindow.focused   = false;
		notesWindow.focus();

		notesWindow.addEventListener(Titanium.CLOSE, function(e) {
			if (notesWindow.editMode) {
				notesWindow.forceSave();
			}
			//settings.save_note_window_position(notesWindow);
			notes.windows[notesWindow.noteId] = null;
		});
		
		notes.windows[notesWindow.noteId] = notesWindow;
		
	} else {
		notes.windows[notes.currentNoteId].focus();
	}
};

/**
 * Close the open note window
 *
 * @author Daniel Marschner
 */
notes.closeNoteWindow = function(taskId) {
	if (taskId == undefined && notes.window != undefined) {
		notes.window.close();
	} 
	else if (taskId != undefined && notes.window != undefined)
	{ 
		if (notes.window.noteId == taskId) {
			notes.window.close();
			return true;
		}
	}
	
	return false;
};

/**
 * Replace the Formatted Note string with the given string
 *
 * @author Marvin Labod, Daniel Marschner
 */
notes.format = function(text, replaceLinks) { 
	if (replaceLinks == undefined)
		replaceLinks = true;
	
	if (replaceLinks == true)
		text = wunderlist.replace_links(text);
	
	return wunderlist.replace_breaks(text);
};

// Loaded on start
$(function() {
	// Click on note icon
	$('li span.note').live('click', function() {
	    notes.currentNoteIcon  = $(this);
		notes.currentNoteTitle = notes.currentNoteIcon.parent().children(".description").text();
		notes.currentNote      = notes.currentNoteIcon.html();
		notes.currentNoteId    = notes.currentNoteIcon.parent().attr('id');
		notes.readOnly         = notes.currentNoteIcon.parent('li').hasClass('done');
		notes.openNotesWindow();
	});	
});