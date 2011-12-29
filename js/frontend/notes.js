/* global wunderlist */

/**
 * notes.js
 * Contains all the note functionality
 * @author Marvin Labod, Dennis Schneider, Daniel Marschner
 */

wunderlist.frontend.notes = (function(window, $, wunderlist, Titanium, Encoder, shortcut, undefined){

  "use strict";

  var noteTitle, html, readOnly = false, editMode = false, newNote, focused;
  var notesDialog, detail, currentNoteText, currentNoteId, currentNoteIcon, currentNoteTitle;

  function onReady() {
    // Setting Note Title
    $("div.dialog-notes span.ui-dialog-title").text('Task: ' + noteTitle);

    var saveButton = $("#save-note");
    var saveCloseButton = $('input#save-and-close');
    var notesTextArea = $('textarea#noteTextarea');
    var hintIcon = $('span.hint');
    var savedNote = $('div.savednote');

    if (html !== '' || readOnly === true) {
      hintIcon.hide();
      $('div.inner').html(html);
      savedNote.show();

      if (readOnly === true) {
        saveButton.hide();
      } else {
        saveButton.removeClass("button-login").val(wunderlist.language.data.edit_changes).show();
      }

      saveCloseButton.hide();
    } else {
      editMode = true;

      saveButton.addClass("button-login").val(wunderlist.language.data.save_changes);
      saveCloseButton.show();
      hintIcon.show();

      notesTextArea.val(currentNoteText).show().focus();
      savedNote.hide();
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


  function saveAndClose(e) {
    var notesTextArea = $('textarea#noteTextarea');
    currentNoteText = notesTextArea.val();
    newNote = wunderlist.helpers.html.xss_clean(currentNoteText);

    currentNoteIcon.toggleClass("activenode", newNote.length !== 0);
    currentNoteIcon.html(newNote);

    wunderlist.helpers.task.set({
      id: currentNoteId,
      note: currentNoteText
    }).update(false, close);
  }

  function saveOrEdit(e) {

      // Skip read-only notes
      if (readOnly !== false) {
        return;
      }

      var saveButton = $("#save-note");
      var notesTextArea = $('textarea#noteTextarea');
      var savedNote = $('div.savednote');

      // VIEW MODE
      if (editMode === false) {
        editMode = true;

        saveButton.addClass("button-login").val(wunderlist.language.data.save_changes).show();
        //$('input#save-and-close').show();
        $('span.hint').show();

        notesTextArea.val(window.unescape(Encoder.htmlDecode(currentNoteText))).show().focus();
        savedNote.hide();
      // EDIT MODE
      } else if (editMode === true) {
        editMode = false;

        saveButton.removeClass("button-login").val(wunderlist.language.data.edit_changes);
        //$('input#save-and-close').hide();
        $('span.hint').hide();

        currentNoteText = notesTextArea.val();
        newNote = wunderlist.helpers.html.xss_clean(currentNoteText);
        notesTextArea.hide();

        currentNoteIcon.html(newNote);

        $('div.inner').html(format(newNote));
        savedNote.show();

        wunderlist.helpers.task.set({
          id: currentNoteId,
          note: currentNoteText
        }).update(false, close);
      }

      if($(notesTextArea).val().length === 0){
        currentNoteIcon.removeClass("activenote");
      } else {
        currentNoteIcon.addClass("activenote");
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

    // Save / Edit Button
    $('input#save-note').live('deleteNote', deleteNote).live('click', saveOrEdit);

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


  /**
   * Open Notes Window
   * @author Daniel Marschner
   */
  var notesDialogTemplate =
      '<div class="notes_buffer">'+
        '<textarea id="noteTextarea"></textarea>' +
        '<div class="savednote"><div class="inner"></div></div>' +
      '</div>' +
      '<div class="notes_buttons">' +
        '<span class="hint">{{settings.shortcutkey}} + {{language.data.return_key}}: {{language.data.save_and_close_changes}}</span>' +
        '<input id="save-and-close" class="input-button button-login" type="submit" value="{{language.data.save_and_close_changes}}" />' +
        '<input id="save-note" class="input-button" type="submit" value="{{language.data.edit_changes}}" />' +
      '</div>';
  
  function openNotesWindow() {
    var content = window.unescape(wunderlist.helpers.html.replace_breaks(wunderlist.helpers.html.replace_links(currentNoteText)));
    var markup = wunderlist.helpers.templates.render(notesDialogTemplate, wunderlist);
    notesDialog = $('<div/>').html(markup);
    notesDialog.find(".inner").html(content);
    notesDialog = notesDialog.dialog({
      autoOpen : true,
      draggable : false,
      resizable : false,
      modal : true,
      dialogClass : 'dialog-notes',
      title : currentNoteTitle,
      closeOnEscape : true
    });

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
      currentNoteText  = currentNoteIcon.html();
      currentNoteId    = currentNoteIcon.parent().attr('id');
      readOnly         = currentNoteIcon.parent('li').hasClass('done');

      openNotesWindow();
    });
  }

  var self = {
    "init": init,
    "closeNoteWindow": closeNoteWindow
  };

  return self;

})(window, jQuery, wunderlist, Titanium, Encoder, shortcut);