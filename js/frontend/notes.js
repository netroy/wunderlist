/* global wunderlist */
/**
 * notes.js
 * Contains all the note functionality
 * @author Marvin Labod, Dennis Schneider, Daniel Marschner
 */
wunderlist.frontend.notes = (function($, wunderlist, html, undefined){
  "use strict";
  
  var notesDialog, detail, currentNote, currentNoteId, currentNoteIcon, currentNoteTitle, readOnly;

  /**
   * Open Notes Window
   * @author Daniel Marschner
   */
  function openNotesWindow() {
    notesDialog = wunderlist.helpers.dialogs.openViewEditNoteDialog(currentNoteTitle, currentNote);
    notesDialog.dialog('open');

    /*
    if (notes.windows[notes.currentNoteId] === null) {
      var notesWindow = Titanium.UI.getCurrentWindow().createWindow({
        url       : "app://note.html",
        width     : parseInt(Titanium.App.Properties.getString('note_user_width', '500')),
        minWidth  : 500,
        height    : parseInt(Titanium.App.Properties.getString('note_user_height', '400')),
        minHeight : 400,
        maximized : Titanium.App.Properties.getString('maximized', 'false'),
        fullscreenBehaviour: 256
      });

      note_user_x = Titanium.App.Properties.getString('note_user_x', 'none');
      note_user_y = Titanium.App.Properties.getString('note_user_y', 'none');

      //if(note_user_x != 'none') notes.window.x = parseInt(note_user_x);
      //if(note_user_y != 'none') notes.window.y = parseInt(note_user_y);

      notesWindow.open();
      notesWindow.noteTitle = format(notes.currentNoteTitle, false);
      notesWindow.text      = notes.currentNote;
      notesWindow.html      = unescape(format(notes.currentNote));
      notesWindow.noteId    = notes.currentNoteId;
      notesWindow.readOnly  = notes.readOnly;
      notesWindow.editMode  = false;
      notesWindow.focused   = false;
      notesWindow.focus();

      notesWindow.addEventListener(Titanium.CLOSE, function(e) {
        if (notesWindow.editMode) {
          wunderlist.helpers.note.forceSave();
        }
        //wunderlist.settings.saveNoteWindowPosition(notesWindow);
        notes.windows[notesWindow.noteId] = null;
      });
    
      notes.windows[notesWindow.noteId] = notesWindow;
    
    } else {
      notes.windows[notes.currentNoteId].focus();
    }
    */
  }


  /**
   * Replace the Formatted Note string with the given string
   * @author Marvin Labod, Daniel Marschner
   */
  function format(text, replaceLinks) { 
    if (replaceLinks === undefined){
      replaceLinks = true;
    }

    if (replaceLinks === true) {
      text = html.replace_links(text);
    }
    return html.replace_breaks(text);
  }


  /**
   * Close the open note window
   * @author Daniel Marschner
   */
  function closeNoteWindow(taskId) {
    /*
    if (taskId === undefined && notes.window !== undefined) {
      notes.window.close();
    } else if (taskId !== undefined && notes.window !== undefined) { 
      if (notes.window.noteId === taskId) {
        notes.window.close();
        return true;
      }
    }
    return false;
    */
  }


  function init() {
    // Click on note icon
    $('li span.note').live('click', function(e) {
      currentNoteIcon  = $(e.target);
      currentNoteTitle = currentNoteIcon.parent().children(".description").text();
      currentNote      = currentNoteIcon.html();
      currentNoteId    = currentNoteIcon.parent().attr('id');
      readOnly         = currentNoteIcon.parent('li').hasClass('done');
      openNotesWindow();
    });  
  }

  return {
    "init": init,
    "closeNoteWindow": closeNoteWindow
  };

})(jQuery, wunderlist, html);