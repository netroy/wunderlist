/* global Titanium */
var main       = Titanium.UI.getMainWindow();
var mainWindow = main.getDOMWindow();
var wunderlist = main.wunderlist;
var note      = Titanium.UI.getCurrentWindow();

note.onReady = function() {
  // Setting Note Title
  $("div.dialog-notes span.ui-dialog-title").text('Task: ' + note.noteTitle);
  
  if (note.html !== '' || note.readOnly === true) {
    $('span.hint').hide();
    $('div.inner').html(note.html);
    $('div.savednote').show();
    
    if (note.readOnly === true) {
      $('input#save').hide();
    } else {
      $('input#save').removeClass("button-login").val(wunderlist.language.data.edit_changes).show();
    }
    
    $('input#save-and-close').hide();
  } else {
    note.editMode = true;
    
    $('input#save').addClass("button-login").val(wunderlist.language.data.save_changes);
    $('input#save-and-close').show();
    $('span.hint').show();
    
    $('textarea#noteTextarea').val(note.text).show().focus();
    $('div.savednote').hide();
  }
};

/**
 * Replace the Formatted Note string with the given string
 * @author Marvin Labod, Daniel Marschner
 */
note.format = function(text, replaceLinks) { 
  if (replaceLinks === undefined){
    replaceLinks = true;
  }
  if (replaceLinks === true){
    text = html.replace_links(text);
  }
  return html.replace_breaks(text);
};

note.forceSave = function () {
  $('input#save').trigger('click');
};

note.saveAndClose = function() {
  mainContent = mainWindow.document.getElementById("content");
  noteElement = $(mainContent).children('ul').children('li#' + note.noteId).children('span.note');
  newNote   = wunderlist.xss_clean($('textarea#noteTextarea').val());
  
  if(newNote.length === 0){
    noteElement.removeClass("activenote");
  } else {
    noteElement.addClass("activenote");
  }

  noteElement.html(newNote);
  note.text = $('textarea#noteTextarea').val();

  wunderlist.helpers.task.set({
    id: note.noteId,
    note: note.text
  }).update();
  
  note.close();
};

note.addEventListener(Titanium.FOCUSED, function() {
  if(note.focused === false) {
    note.onReady();
    note.focused = true;
  }
});

$(function() {
  note.onReady();
  note.focused = true;
  
  $('#save-and-close').val(wunderlist.language.data.save_generic);
  $('#delete').val(wunderlist.language.data.delete_generic);
  
  $('span.hint').text(wunderlist.helpers.utils.ucfirst(mainWindow.settings.shortcutkey) +' + '+ wunderlist.language.data.return_key +': ' + wunderlist.language.data.save_and_close_changes);
  
  $('input#delete').live('click', function() {
    if (Titanium.App.Properties.getString('delete_prompt', '1') == 1) {
      wunderlist.helpers.dialogs.openNoteDeleteDialog();
    } else {
      $('input#save').trigger('deleteNote');
    }
      
  });
  
  $('input#save').live('deleteNote', function () {
    $('textarea#noteTextarea').val('');
    note.editMode = true;
    $('input#save').click();
  });
  
  // Save / Edit Button
  $('input#save').live('click', function() {
      
    mainContent = mainWindow.document.getElementById("content");
    noteElement = $(mainContent).children('ul').children('li#' + note.noteId).children('span.note');
    
    // VIEW MODE      
    if (note.editMode === false) {
      note.editMode = true;
    
      $(this).addClass("button-login").val(wunderlist.language.data.save_changes).show();
      //$('input#save-and-close').show();
      $('span.hint').show();

      $('textarea#noteTextarea').val(unescape(mainWindow.Encoder.htmlDecode(note.text))).show().focus();
      $('div.savednote').hide();
    // EDIT MODE    
    } else if (note.editMode === true) {
      note.editMode = false;
      
      $(this).removeClass("button-login").val(wunderlist.language.data.edit_changes);
      //$('input#save-and-close').hide();
      $('span.hint').hide();
      
      newNote = wunderlist.xss_clean($('textarea#noteTextarea').val());
      
      noteElement.html(newNote);
      
      $('div.inner').html(note.format(newNote));
      $('div.savednote').show();      
      $('textarea#noteTextarea').hide();
      
      note.text = $('textarea#noteTextarea').val();

      wunderlist.helpers.task.set({
        id: note.noteId,
        note: note.text
      }).update();
      
      note.close();
    }
    
    if($('textarea#noteTextarea').val().length === 0){
      noteElement.removeClass("activenote");
    } else {
      noteElement.addClass("activenote");
    } 
  });
  
  // Save & Close Button
  $('input#save-and-close').live('click', function() {    
    note.saveAndClose();
  });
  
  // Open EditMode with Double Click
  $('div.savednote').live('dblclick', function() {
    if (note.readOnly === false) {
      $('input#save').click();
    }
  });
  
  // Save note and close the dialog
  shortcut.add(mainWindow.settings.shortcutkey + '+Enter', function (event) {
    note.saveAndClose();
  }, {'disable_in_input' : false});
  
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
    if (note.editMode) {
      note.saveAndClose();
    } else {
      note.close();
    }
  });  
});