/* global wunderlist */
wunderlist.helpers.note = (function(window, $, wunderlist, Titanium, Encoder, shortcut, undefined){
  "use strict";

  /*
  var main = Titanium.UI.getMainWindow();
  var note = Titanium.UI.getCurrentWindow();
  var mainWindow = main.getDOMWindow();
  var wunderlist = main.wunderlist;
  */
  var noteTitle, html, readOnly, editMode, text, mainContent, noteElement, newNote, noteId, focused;

  function onReady() {
    // Setting Note Title
    $("div.dialog-notes span.ui-dialog-title").text('Task: ' + noteTitle);

    if (html !== '' || readOnly === true) {
      $('span.hint').hide();
      $('div.inner').html(html);
      $('div.savednote').show();

      if (readOnly === true) {
        $('input#save').hide();
      } else {
        $('input#save').removeClass("button-login").val(wunderlist.language.data.edit_changes).show();
      }

      $('input#save-and-close').hide();
    } else {
      editMode = true;

      $('input#save').addClass("button-login").val(wunderlist.language.data.save_changes);
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
      text = html.replace_links(text);
    }
    return html.replace_breaks(text);
  }


  function forceSave() {
    $('input#save').trigger('click');
  }


  function saveAndClose() {
    mainContent = $("#content");
    noteElement = mainContent.children('ul').children('li#' + noteId).children('span.note');
    newNote   = wunderlist.xss_clean($('textarea#noteTextarea').val());

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
    }).update();

    close();
  }


  function init() {
    onReady();
    focused = true;

    $('#save-and-close').val(wunderlist.language.data.save_generic);
    $('#delete').val(wunderlist.language.data.delete_generic);

    $('span.hint').text(wunderlist.helpers.utils.ucfirst(wunderlist.settings.shortcutkey) +' + '+ 
      wunderlist.language.data.return_key +': ' + wunderlist.language.data.save_and_close_changes);

    $('input#delete').live('click', function() {
      if (Titanium.App.Properties.getString('delete_prompt', '1') === 1) {
        wunderlist.helpers.dialogs.openNoteDeleteDialog();
      } else {
        $('input#save').trigger('deleteNote');
      }
    });

    $('input#save').live('deleteNote', function () {
      $('textarea#noteTextarea').val('');
      editMode = true;
      $('input#save').click();
    });

    // Save / Edit Button
    $('input#save').live('click', function() {

      mainContent = $("content");
      noteElement = mainContent.children('ul').children('li#' + noteId).children('span.note');

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

        newNote = wunderlist.xss_clean($('textarea#noteTextarea').val());

        noteElement.html(newNote);

        $('div.inner').html(format(newNote));
        $('div.savednote').show();      
        $('textarea#noteTextarea').hide();

        text = $('textarea#noteTextarea').val();

        wunderlist.helpers.task.set({
          id: noteId,
          note: text
        }).update();

        close();
      }

      if($('textarea#noteTextarea').val().length === 0){
        noteElement.removeClass("activenote");
      } else {
        noteElement.addClass("activenote");
      } 
    });

    // Save & Close Button
    $('input#save-and-close').live('click', saveAndClose);

    // Open EditMode with Double Click
    $('div.savednote').live('dblclick', function() {
      if (readOnly === false) {
        $('input#save').click();
      }
    });

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


  return {
    "init": init,
    "format": format,
    "forceSave": forceSave
  };
})(window, jQuery, wunderlist, Titanium, Encoder, shortcut);