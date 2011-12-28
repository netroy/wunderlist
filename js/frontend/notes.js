/* global wunderlist */

/**
 * notes.js
 * Contains all the note functionality
 * @author Marvin Labod, Dennis Schneider, Daniel Marschner
 */

wunderlist.frontend.notes = (function(window, $, wunderlist, Titanium, Encoder, shortcut, undefined){
  "use strict";

  /*
  var main = Titanium.UI.getMainWindow();
  var note = Titanium.UI.getCurrentWindow();
  var mainWindow = main.getDOMWindow();
  var wunderlist = main.wunderlist;
  */
  var noteTitle, html, readOnly = false, editMode = false, text, noteElement, newNote, noteId, focused;

  function onReady() {
    // Setting Note Title
    $("div.dialog-notes span.ui-dialog-title").text('Task: ' + noteTitle);

    if (html !== '' || readOnly === true) {
      $('span.hint').hide();
      $('div.inner').html(html);
      $('div.savednote').show();

      if (readOnly === true) {
        $('input#save-note').hide();
      } else {
        $('input#save-note').removeClass("button-login").val(wunderlist.language.data.edit_changes).show();
      }

      $('input#save-and-close').hide();
    } else {
      editMode = true;

      $('input#save-note').addClass("button-login").val(wunderlist.language.data.save_changes);
      $('input#save-and-close').show();
      $('span.hint').show();

      $('textarea#noteTextarea').val(text).show().focus();
      $('div.savednote').hide();
    }
  }


  /**
   * Close the dialog
   */
  function close(){
    // TODO: Fill the stub
  }

  /**
   * Replace the Formatted Note string with the given string
   * @author Marvin Labod, Daniel Marschner
   */
  function format(text, replaceLinks) { 
    if (replaceLinks === undefined){
      replaceLinks = true;
    }
    if (replaceLinks === true){
      text = wunderlist.helpers.html.replace_links(text);
    }
    return wunderlist.helpers.html.replace_breaks(text);
  }


  function forceSave() {
    $('input#save-note').trigger('click');
  }


  function saveAndClose() {
    newNote   = wunderlist.helpers.html.xss_clean($('textarea#noteTextarea').val());

    if(newNote.length === 0){
      noteElement.removeClass("activenote");
    } else {
      noteElement.addClass("activenote");
    }

    noteElement.html(newNote);
    text = $('textarea#noteTextarea').val();

    wunderlist.helpers.task.set({
      id: noteId,
      note: text
    }).update(false, close);
  }

  function saveOrEdit() {

      // Skip read-only notes
      if (readOnly !== false) {
        return;
      }

      // VIEW MODE      
      if (editMode === false) {
        editMode = true;

        $(this).addClass("button-login").val(wunderlist.language.data.save_changes).show();
        //$('input#save-and-close').show();
        $('span.hint').show();

        $('textarea#noteTextarea').val(window.unescape(Encoder.htmlDecode(text))).show().focus();
        $('div.savednote').hide();
      // EDIT MODE    
      } else if (editMode === true) {
        editMode = false;

        $(this).removeClass("button-login").val(wunderlist.language.data.edit_changes);
        //$('input#save-and-close').hide();
        $('span.hint').hide();

        newNote = wunderlist.helpers.html.xss_clean($('textarea#noteTextarea').val());

        noteElement.html(newNote);

        $('div.inner').html(format(newNote));
        $('div.savednote').show();      
        $('textarea#noteTextarea').hide();

        text = $('textarea#noteTextarea').val();

        wunderlist.helpers.task.set({
          id: noteId,
          note: text
        }).update(false, close);
      }

      if($('textarea#noteTextarea').val().length === 0){
        noteElement.removeClass("activenote");
      } else {
        noteElement.addClass("activenote");
      } 
  }

  function deletePrompt() {
    if (wunderlist.settings.getString('delete_prompt', '1') === 1) {
      wunderlist.helpers.dialogs.openNoteDeleteDialog();
    } else {
      $('input#save-note').trigger('deleteNote');
    }
  }

  function deleteNote() {
    $('textarea#noteTextarea').val('');
    editMode = true;
    $('input#save-note').click();
  }

  function initHelper() {
    onReady();
    focused = true;

    $('#save-and-close').val(wunderlist.language.data.save_generic);
    $('#delete').val(wunderlist.language.data.delete_generic);

    $('span.hint').text(wunderlist.helpers.utils.ucfirst(wunderlist.settings.shortcutkey) +' + '+ wunderlist.language.data.return_key +': ' + wunderlist.language.data.save_and_close_changes);

    $('input#delete').live('click', deletePrompt);

    $('input#save-note').live('deleteNote', deleteNote);

    // Save / Edit Button
    $('input#save-note').live('click', saveOrEdit);

    // Save & Close Button
    $('input#save-and-close').live('click', saveAndClose);

    // Open EditMode with Double Click
    $('div.savednote').live('dblclick', saveOrEdit);

    // Save note and close the dialog
    shortcut.add(wunderlist.settings.shortcutkey + '+Enter', saveAndClose, {'disable_in_input' : false});

    // Open every link in the browser
    $('a[href^=http], a[href^=https], a[href^=ftp], a[href^=mailto]').live('click', function() {
      Titanium.Desktop.openURL(this.href);
      return false;
    });

    // Open every file in the finder app
    $('span.openApp').live('click', function() {
      Titanium.Platform.openApplication($.trim($(this).text()));
    });

    // Shortcut Bind Esc - close window
    shortcut.add('Esc', function (evt) {
      if (editMode) {
        saveAndClose();
      } else {
        close();
      }
    });


    $.bind(window, Titanium.FOCUSED, function() {
      if(focused === false) {
        onReady();
        focused = true;
      }
    });
  }

  
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
        width     : parseInt(wunderlist.settings.getString('note_user_width', '500')),
        minWidth  : 500,
        height    : parseInt(wunderlist.settings.getString('note_user_height', '400')),
        minHeight : 400,
        maximized : wunderlist.settings.getString('maximized', 'false'),
        fullscreenBehaviour: 256
      });

      note_user_x = wunderlist.settings.getString('note_user_x', 'none');
      note_user_y = wunderlist.settings.getString('note_user_y', 'none');

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
          forceSave();
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
      text = wunderlist.helpers.html.replace_links(text);
    }
    return wunderlist.helpers.html.replace_breaks(text);
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

    initHelper();

    // Click on note icon
    $('li span.note').live('click', function(e) {
      currentNoteIcon  = $(e.target);
      currentNoteTitle = currentNoteIcon.parent().children(".description").text();
      currentNote      = currentNoteIcon.html();
      currentNoteId    = currentNoteIcon.parent().attr('id');
      readOnly         = currentNoteIcon.parent('li').hasClass('done');

      noteElement = currentNoteIcon;
      noteId = currentNoteId;
      text = currentNote;

      openNotesWindow();
    });  
  }

  var self = {
    "init": init,
    "closeNoteWindow": closeNoteWindow
  };

  return self;

})(window, jQuery, wunderlist, Titanium, Encoder, shortcut);