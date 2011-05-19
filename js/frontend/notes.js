/**
 * notes.js
 *
 * Contains all the note functionality
 *
 * @author Marvin Labod, Dennis Schneider, Daniel Marschner
 */
var notes = notes || {};

notes.dialog = undefined;

/**
 * Open Notes Dialog
 *
 * @author Marvin Labod, Daniel Marschner
 */
notes.openNotesDialog = function() {
	$(".dialog-notes").remove();

	notes.dialog = undefined;
	notes.dialog = dialogs.generateDialog(notes.currentNoteTitle, html.generateNotesDialogHTML(), 'dialog-notes');
	
	dialogs.openDialog(notes.dialog);
	
	$('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');
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

notes.onlyRead = false;

/**
 * save the note and close the dialog
 *
 * @author Daniel Marschner
 */
notes.saveAndClose = function() {
	var noteTaksId  = $('.dialog-notes textarea').attr('id');
	var noteContent = wunderlist.xss_clean($('.dialog-notes textarea').val());
	var noteIcon    = $('ul.mainlist li#' + noteTaksId + ' span.note, ul.donelist li#' + noteTaksId + ' span.note');
	
	if(noteContent.length == 0)
		noteIcon.removeClass("activenote");
	else			
		noteIcon.addClass("activenote");
	
	noteIcon.html(noteContent);
	
	task.id   = noteTaksId;
	task.note = noteContent;
	task.update();
	
	$(notes.dialog).dialog('close');
};

// Loaded on start
$(function() {
	noteEditMode = false;
	
	// Click on note icon
	$('li span.note').live('click', function() {
		notes.openNotesDialog();
		
		noteEditMode = false;
		
		// Define Note Variables
		notes.noteIcons        = $('ul.mainlist li span.note, ul.donelist li span.note');
		notes.note             = $('.dialog-notes textarea').hide();
		notes.savednote        = $('.dialog-notes .savednote');
		notes.savednoteInner   = $('.dialog-notes .savednote .inner');
		notes.currentNoteIcon  = $(this);
		
		notes.currentNoteTitle = notes.currentNoteIcon.parent().children(".description").text();
		notes.note.attr('id', notes.currentNoteIcon.parent().attr('id'));
		
		notes.onlyRead = $(this).parent('li').hasClass('done');
		
		$('.dialog-notes .hint').hide();
		
		// Setting Note Title
		$(".dialog-notes .ui-dialog-title").text(notes.format(notes.currentNoteTitle, false));
		
		if (notes.currentNoteIcon.html() != '' || notes.onlyRead == true)
		{
			notes.savednoteInner.html(notes.format(notes.currentNoteIcon.html()));
			
			if (notes.onlyRead == true)
			{
				$('input#save-note').hide();
				$('input#save-and-close').hide();
				$('.dialog-notes .hint').hide();
			}
		}
		else
		{
			noteEditMode = true;
			
			$('input#save-note').addClass("button-login").val(wunderlist.language.data.save_changes);
			$('input#save-and-close').show();
			$('.dialog-notes .hint').show();
			
			notes.note.show().focus();
			notes.note.val(notes.currentNoteIcon.html());
			notes.savednote.hide();
		}
	});

	// Save / Edit Button
	$('.dialog-notes input#save-note').live('click', function() {		
		notes.noteIcons      = $('ul.mainlist li span.note, ul.donelist li span.note');
		notes.note           = $('.dialog-notes textarea');
		notes.savednote      = $('.dialog-notes .savednote');
		notes.savednoteInner = $('.dialog-notes .savednote .inner');
				
		// VIEW MODE			
		if (noteEditMode == false)
		{
			noteEditMode = true;
		
			$(this).addClass("button-login").val(wunderlist.language.data.save_changes);
			$('input#save-and-close').show();
			$('.dialog-notes .hint').show();

			notes.note.val(Encoder.htmlDecode(notes.currentNoteIcon.html())).show().focus();
			notes.savednote.hide();
			
			
	 	// EDIT MODE		
		}
		else if (noteEditMode == true)
		{
			noteEditMode = false;
			
			$(this).removeClass("button-login").val(wunderlist.language.data.edit_changes);
			$('input#save-and-close').hide();
			$('.dialog-notes .hint').hide();
			
			notes.currentNoteIcon.html(wunderlist.xss_clean(notes.note.val()));
			
			notes.savednoteInner.html(notes.format(notes.currentNoteIcon.html()));
			notes.savednote.show();
			
			notes.note.hide();
			
			task.id   = notes.note.attr('id');
			task.note = notes.note.val();
			task.update();
		}
		
		if(notes.currentNoteIcon.html().length == 0)
			notes.currentNoteIcon.removeClass("activenote");
		else			
			notes.currentNoteIcon.addClass("activenote");
	});
	
	// Open EditMode with Double Click
	$('.dialog-notes .savednote').live('dblclick', function() {
		if (notes.onlyRead == false)
			$('.dialog-notes input#save-note').click();
	});	
	
	// Open EditMode with Double Click
	$('.dialog-notes input#save-and-close').live('click', function() {
		notes.saveAndClose();
	});	
});