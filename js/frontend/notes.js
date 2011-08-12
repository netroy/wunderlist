/**
 * notes.js
 *
 * Contains all the note functionality
 *
 * @author Marvin Labod, Dennis Schneider, Daniel Marschner
 */
var notes = notes || {};

notes.window = undefined;

/**
 * Open Notes Window
 *
 * @author Daniel Marschner
 */
notes.openNotesWindow = function() {
	if (notes.window !== undefined && notes.window.editMode) {
		notes.window.saveAndClose();
	}
	if (notes.window == undefined) {
		notes.window = Titanium.UI.getCurrentWindow().createWindow({
			url       : "app://note.html",
			width     : parseInt(Titanium.App.Properties.getString('note_user_width', '500')),
	        minWidth  : 500,
	        height    : parseInt(Titanium.App.Properties.getString('note_user_height', '400')),
	        minHeight : 400,
	        maximized : Titanium.App.Properties.getString('maximized', 'false')
		});
		
		note_user_x = Titanium.App.Properties.getString('note_user_x', 'none');
		note_user_y = Titanium.App.Properties.getString('note_user_y', 'none');

		if(note_user_x != 'none') notes.window.x = parseInt(note_user_x);
		if(note_user_y != 'none') notes.window.y = parseInt(note_user_y);
		
		notes.window.open();
	}
	
	notes.window.noteTitle = notes.format(notes.currentNoteTitle, false);
	notes.window.text      = notes.currentNote;
	notes.window.html      = unescape(notes.format(notes.currentNote));
	notes.window.noteId    = notes.currentNoteId;
	notes.window.readOnly  = notes.readOnly;
	notes.window.editMode  = false;
	notes.window.focused   = false;
	notes.window.focus();
	
	notes.window.addEventListener(Titanium.CLOSE, function(e) {
		if (notes.window.editMode) {
			notes.window.forceSave();
		}
		settings.save_note_window_position(notes.window);
		notes.window = undefined;
	});
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