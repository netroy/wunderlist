/* global wunderlist */

/**
 * notes.js
 * Contains all the note functionality
 * @author Marvin Labod, Dennis Schneider, Daniel Marschner
 */

wunderlist.frontend.notes = (function(window, $, wunderlist, Encoder, shortcut, undefined){

  "use strict";

  var noteTitle, html, readOnly = false, editMode = false, newNote, focused;
  var detail, currentNoteText, currentNoteId, currentNoteIcon, currentNoteTitle;


  var notesDialog, noteDeleteDialog, notesDialogTemplate =
      '<div class="notes_buffer">'+
        '<textarea id="noteTextarea"></textarea>' +
        '<div class="savednote"><div class="inner"></div></div>' +
      '</div>' +
      '<div class="notes_buttons">' +
        '<span class="hint">{{settings.shortcutkey}} + {{language.data.return_key}}: {{language.data.save_and_close_changes}}</span>' +
        '<input id="save-and-close" class="input-button button-login" type="submit" value="{{language.data.save_and_close_changes}}" />' +
        '<input id="save-note" class="input-button" type="submit" value="{{language.data.edit_changes}}" />' +
      '</div>';

  function initNoteDialogs() {

    var markup = wunderlist.helpers.templates.render(notesDialogTemplate);
    notesDialog = $('<div/>').html(markup).dialog({
      autoOpen : false,
      draggable : false,
      resizable : false,
      closeOnEscape : true
    });

  
    var buttons = {};
    buttons[wunderlist.language.data.delete_note_no] = function() {
      $(this).dialog('close');
    };

    buttons[wunderlist.language.data.delete_note_yes] = function() {
      $('textarea#noteTextarea').val('');
      $('input#save-note').trigger('deleteNote');
      $(this).dialog('close');
    };

    noteDeleteDialog = $('<div></div>').dialog({
      autoOpen : false,
      draggable : false,
      resizable : false,
      closeOnEscape : true,
      title : wunderlist.language.data.delete_note_question,
      buttons : buttons,
      open : function(event, ui) {
        $('.ui-dialog-buttonset button:first').focus().addClass("input-bold");
      }
    });
  }

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
      saveCloseButton.val(wunderlist.language.data.save_and_close_changes).show();
      hintIcon.show();

      notesTextArea.val(currentNoteText).show().focus();
      savedNote.hide();
    }
  }


  /**
   * Close the dialog
   */
  function close(){
    notesDialog.dialog("close");
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
      text = wunderlist.helpers.utils.replaceLinks(text);
    }
    return wunderlist.helpers.utils.replaceBreaks(text);
  }

  function cleanUp() {
    var saveButton = $("#save-note");
    var saveCloseButton = $('input#save-and-close');
    var notesTextArea = $('textarea#noteTextarea');
    var savedNote = $('div.savednote');

    saveButton.removeClass("button-login").val(wunderlist.language.data.edit_changes);
    saveCloseButton.hide();
    $('span.hint').hide();
    notesTextArea.val("").hide();
    savedNote.show();
  }

  function saveOrEdit(e) {

    // Skip read-only notes
    if (readOnly !== false) {
      return;
    }

    var saveButton = $("#save-note");
    var saveCloseButton = $('input#save-and-close');
    var notesTextArea = $('textarea#noteTextarea');
    var savedNote = $('div.savednote');

    // VIEW MODE
    if (editMode === false) {
      editMode = true;

      saveButton.addClass("button-login").val(wunderlist.language.data.save_changes).show();
      saveCloseButton.val(wunderlist.language.data.save_and_close_changes).show();
      $('span.hint').show();

      notesTextArea.val(window.unescape(Encoder.htmlDecode(currentNoteText))).show().focus();
      savedNote.hide();
    // EDIT MODE
    } else if (editMode === true) {
      editMode = false;

      currentNoteText = notesTextArea.val();
      newNote = wunderlist.helpers.utils.xssClean(currentNoteText);

      currentNoteIcon.toggleClass("activenote", newNote.length !== 0);
      currentNoteIcon.html(newNote);

      $('div.inner').html(format(newNote));

      cleanUp();

      var onSave = (e && e.currentTarget === saveButton[0])? wunderlist.nop: close;

      wunderlist.helpers.task.set({
        id: currentNoteId,
        note: currentNoteText
      }).update(false, onSave);
    }
  }

  function deletePrompt() {
    if (wunderlist.settings.getString('delete_prompt', '1') === 1) {
      noteDeleteDialog.dialog({
        dialogClass : 'dialog-delete-task',
        modal : true,
        autoOpen: true
      });
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

    $('#save-and-close').val(wunderlist.language.data.save_and_close_changes);
    $('#delete').val(wunderlist.language.data.delete_generic);

    $('span.hint').text(wunderlist.helpers.utils.ucfirst(wunderlist.settings.shortcutkey) +' + '+ wunderlist.language.data.return_key +': ' + wunderlist.language.data.save_and_close_changes);

    $('input#delete').live('click', deletePrompt);

    // Save / Edit Button
    $('input#save-note').live('deleteNote', deleteNote).live('click', saveOrEdit);

    // Save & Close Button
    $('input#save-and-close').live('click', saveOrEdit);

    // Open EditMode with Double Click
    $('div.savednote').live('dblclick', saveOrEdit);

    // Save note and close the dialog
    shortcut.add(wunderlist.settings.shortcutkey + '+Enter', saveOrEdit, {'disable_in_input' : false});

    $(window).bind("focus", onReady);
  }

  /**
   * Open Notes Window
   * @author Daniel Marschner
   */
  
  // force save when dialog closes on ESC key
  function beforeClose(e) {
    if(editMode && e && e.which === 27) {
      saveOrEdit();
    } else {
      cleanUp();
    }
    return true;
  }

  function openNotesWindow() {
    var content = window.unescape(wunderlist.helpers.utils.replaceBreaks(wunderlist.helpers.utils.replaceLinks(currentNoteText)));
    notesDialog.dialog({
      title: currentNoteTitle,
      dialogClass : 'dialog-notes',
      modal : true,
      autoOpen: true,
      beforeClose: beforeClose
    }).find(".inner").html(content);
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

    initNoteDialogs();

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

})(window, jQuery, wunderlist, Encoder, shortcut);