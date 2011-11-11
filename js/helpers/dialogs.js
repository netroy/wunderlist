/* global wunderlist */
wunderlist.helpers.dialogs = (function(window, $, wunderlist, tasks, html, settings, Titanium, undefined){
  "use strict";


  // Settings
  var modalDialog = false;

  // Dialogs
  var confirmationDialog, okDialog, shareOwnEmailDialog, deleteDialog, 
      whileSyncDialog, cloudAppDialog, shareSuccessDialog, deleteTaskDialog,
      sidebarDialog, switchDateFormatDialog, deletePromptDialog, deleteNoteDialog,
      viewEditNoteDialog;
  // TODO: instead of destroying the dialogs everytime, re-use them


  function init() {
    // On startup bind the dialolgclose event
    $("[role='dialog']").live("dialogclose", function(event, ui) {
      $(this).dialog('destroy');
      $(this).children().remove();
      $(this).remove();
    
      switchDateFormatDialog = undefined;
      sidebarDialog          = undefined;
      deletePromptDialog     = undefined;
    });
  }

  function createAlertDialog(title, content) {
    // TODO: fill this stub
    $("<div/>").append($("<p class='pl8'/>").html(content)).dialog({
      autoOpen  : true,
      draggable : false,
      resizable : false,
      modal     : true,
      width     : 450,
      title     : title
    });
  }

  /**
   * Close all dialogs in the system
   * @author Daniel Marschner
   */
  function closeEveryone() {
    $('[role="dialog"]').dialog('destroy');
    $('[role="dialog"]').children().remove();
    $('[role="dialog"]').remove();
  
    switchDateFormatDialog = undefined;
    sidebarDialog          = undefined;
    deletePromptDialog     = undefined;
  }


  /**
   * Generates a dialog window
   * @author Daniel Marschner
   */
  function generateDialog(title, html_code, dialogClass, closeOnEscape) {
    if (title === undefined) title = '';
    if (html_code === undefined) html_code = '';
    if (dialogClass === undefined) dialogClass = '';
    if (closeOnEscape === undefined) closeOnEscape = true;

    return $('<div></div>').html(html_code).dialog({
      autoOpen      : false,
      draggable     : false,
      resizable     : false,
      modal         : true,
      dialogClass   : dialogClass,
      title         : title,
      closeOnEscape : closeOnEscape
    });
  }


  /**
   * Opens a custom dialog
   * @author Daniel Marschner
   */
  function openDialog(customDialog) {
    $(customDialog).dialog('open');
    modalDialog = true;
  }


  /**
   * Closes a custom dialog
   * @author Daniel Marschner
   */
  function closeDialog(customDialog) {
    $(customDialog).dialog('close');
    modalDialog = false;
  }


  /**
   * Shows a small error dialog
   * @author Christian Reber
   */
  function showErrorDialog(message) {
    openDialog(generateDialog(wunderlist.language.data.error_occurred, '<p class="pl8">' + message + '</p>'));
  }


  /**
   * Shows a small confirmation dialog to inform the user
   * @author Dennis Schneider
   */
  function showConfirmationDialog() {
    confirmationDialog = generateDialog(wunderlist.language.data.account_deleted, '<p>' + wunderlist.language.data.account_del_successful + '</p><input class="input-button" type="submit" id="okay" value="' + wunderlist.language.data.okay + '" />');
    openDialog(confirmationDialog);
    $('input#okay').click(function() {closeDialog(confirmationDialog);});
    $('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');
  }


  function showShareOwnEmailDialog() {
    shareOwnEmailDialog = $('<div></div>').dialog({
      autoOpen: true,
      draggable: false,
      resizable: false,
      modal: true,
      closeOnEscape: true,
      title: wunderlist.language.data.share_own_email,
      buttons: {
        'OK': function() {
          $(this).dialog('close');
        }
      }
    });

    openDialog(shareOwnEmailDialog);
  
    $('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');  
  }


  /**
   * Show an ok dialog for data change
   * @author Dennis Schneider
   */
  function showOKDialog(title, inBody) {
    if (inBody === undefined) {
      inBody = false;
    } 
  
    var content = '';
  
    if (inBody === true) {
      content = '<p>' + title + '</p>';
      title   = '';
    }
  
    okDialog = $('<div>' + content + '</div>').dialog({
      autoOpen: true,
      draggable: false,
      modal: true,
      resizable: false,
      title: title,
      closeOnEscape: true,
      buttons: {
        'OK': function() {
          $(this).dialog('close');
        }
      }
    });
  
    openDialog(okDialog);
  
    var dialogElement = $('div.ui-dialog');
    dialogElement.width(800);
    var spanWidth = $('span.ui-dialog-title').innerWidth();
    var newDialogWidth = spanWidth + 60;
    dialogElement.width(newDialogWidth);
    dialogElement.css({
      left:'50%',
      'margin-left': -(newDialogWidth / 2)
    });
  
    $('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');  
  }


  /**
   * Show a dialog when sharing was successful
   * @author Dennis Schneider
   */
  function showSharedSuccessDialog(title) {
    shareSuccessDialog = $('<div></div>').dialog({
      autoOpen: true,
      draggable: false,
      modal: true,
      title: title,
      resizable: false,
      closeOnEscape: true,
      buttons: {
        'OK': function() {
          $(this).dialog('close');
        }
      }
    });

    openDialog(shareSuccessDialog);
  
    $('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');  
  }


  /**
   * Show an ok dialog deleting a shared list user
   * @author Dennis Schneider
   */
  function showDeletedDialog(title, content) {
    if (content === undefined) {
      content = '';
    }

    deleteDialog = $('<div><p>' + content +  '</p></div>').dialog({
      autoOpen  : true,
      draggable : false,
      modal     : true,
      title     : title,
      resizable : false,
      closeOnEscape: true,
      buttons   : {
        'OK'  : function() {
          $(this).dialog('close');
        }
      }
    });

    openDialog(deleteDialog);

    $('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');
  }


  /**
   * Confirmation Dialog for Cloud App
   * @author Dennis Schneider
   */
  function showCloudAppDialog() {
    if ($("[role='dialog']").length === 0) {
      var buttons = {};
      buttons[wunderlist.language.data.no]  = function() {
        $(this).dialog('close');
      };
      buttons[wunderlist.language.data.yes] = function() {
        wunderlist.frontend.share.share_with_cloudapp();
        $(this).dialog('close');
      };

      cloudAppDialog = $('<div><p>' + wunderlist.language.data.cloudapp_1 + '</p><p class="small">' + wunderlist.language.data.cloudapp_2 + '</p></div>').dialog({
        autoOpen      : true,
        draggable     : false,
        resizable     : false,
        dialogClass   : 'dialog-cloudapp',
        modal         : true,
        closeOnEscape : true,
        title         : wunderlist.language.data.cloudapp_sharing,
        buttons       : buttons
      });  
  
      openDialog(cloudAppDialog);    
  
      $('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');  
    }
  }


  /**
   * Show a dialog when syncing and trying to logout
   * @author Dennis Schneider
   */
  function showWhileSyncDialog(title) {
    whileSyncDialog = $('<div></div>').dialog({
      autoOpen  : true,
      draggable : false,
      resizable: false,
      modal     : true,
      closeOnEscape: true,
      title     : title,
      buttons   : {
        'OK'  : function() {
          $(this).dialog('close');
        }
      }
    });

    openDialog(whileSyncDialog);
  
    $('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');
  }


  /**
   * Open a prompt asking for the deletion of a task
   * @author Dennis Schneider, Daniel Marschner
   */
  function openTaskDeleteDialog(deleteElement) {
    if ($("[role='dialog']").length === 0) {
      var buttons = {};
      buttons[wunderlist.language.data.delete_task_no]  = function() {
        $(this).dialog('close');
      };
      buttons[wunderlist.language.data.delete_task_yes] = function() {
        tasks.deletes(deleteElement);
        closeDialog(deleteTaskDialog);
      };

      deleteTaskDialog = $('<div></div>').dialog({
        autoOpen    : false,
        draggable   : false,
        modal       : true,
        closeOnEscape: true,
        dialogClass : 'dialog-delete-task',
        title       : wunderlist.language.data.delete_task_question,
        buttons     : buttons,
        open        : function(event, ui) {
          $('.ui-dialog-buttonset button:first').focus();
          $('.ui-dialog-buttonset button:first').addClass("input-bold");
        }
      });

      openDialog(deleteTaskDialog);
  
      $('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');
    }
  }


  /**
   * View or Edit notes for the current record
   */
  function openViewEditNoteDialog(title, content){
    content = window.unescape(html.replace_breaks(html.replace_links(content)));
    viewEditNoteDialog = wunderlist.helpers.dialogs.generateDialog("", html.generateNotesDialogHTML(), 'dialog-notes');
    viewEditNoteDialog.dialog({
      title: title
    }).find(".inner").html(content);
    return viewEditNoteDialog;
  }

  /**
   * Open a prompt asking for the deletion of a note
   * @author Adam Renklint
   */
  function openNoteDeleteDialog() {
    if ($("[role='dialog']").length === 0) {
      var buttons = {};
      buttons[wunderlist.language.data.delete_note_no] = function() { 
        $(this).dialog('close');
      };
      buttons[wunderlist.language.data.delete_note_yes] = function() {
        $('textarea#noteTextarea').val('');
        $('input#save').trigger('deleteNote');
        closeDialog(deleteNoteDialog);
      };

      deleteNoteDialog = $('<div></div>').dialog({
        autoOpen    : false,
        draggable   : false,
        modal       : true,
        closeOnEscape: true,
        dialogClass : 'dialog-delete-task',
        title       : wunderlist.language.data.delete_note_question,
        buttons     : buttons,
        open        : function(event, ui) {
          $('.ui-dialog-buttonset button:first').focus();
          $('.ui-dialog-buttonset button:first').addClass("input-bold");
        }
      });

      openDialog(deleteNoteDialog);
  
      $('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');
    }
  }


  /**
   * Open a prompt asking for the deletion of a list
   * @author Dennis Schneider
   */
  function createDeleteListDialog(listId, listElement) {  
    if ($("[role='dialog']").length === 0) {
      var buttonOptions = {};
      buttonOptions[wunderlist.language.data.list_delete_no]  = function() {
        $(this).dialog('close');
        $('a.list input').focus();
      };
      buttonOptions[wunderlist.language.data.list_delete_yes] = function() { 
        if (listId != 1) {
          wunderlist.frontend.lists.deleteList(listId, listElement);
        }
        $(this).dialog('close');
      };

      var delete_dialog = $('<div></div>').dialog({
        autoOpen    : false,
        modal       : true,
        resizable   : false,
        draggable   : false,
        closeOnEscape: true,
        dialogClass : 'dialog-delete-list',
        title       : wunderlist.language.data.delete_list_question,
        buttons     : buttonOptions,
        open        : function() {
          $('.ui-dialog-buttonset button:first').focus();
          $('.ui-dialog-buttonset button:first').addClass("input-bold");
        }
      });
  
      openDialog(delete_dialog);
  
      $('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');
    }
  }


  /**
   * Open the switch date format dialog
   * @author Dennis Schneider
   */
  function openSwitchDateFormatDialog() {
    if ($("[role='dialog']").length === 0) {
      switchDateFormatDialog = generateDialog(wunderlist.language.data.switchdateformat, html.generateSwitchDateFormatHTML());
      openDialog(switchDateFormatDialog, 'switchdateformat-credits');
    
      $('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');  

      $('input#cancel-dateformat').die();
      $('input#confirm-dateformat').die();
  
      var dateformat = settings.getDateformat();
      $('div.radios#date-format-radios input#date_' + dateformat).attr('checked', 'checked');
  
      var weekstart_day = settings.getWeekstartday();
      $('div.radios#week-start-day-radios input#startday_' + weekstart_day).attr('checked', 'checked');
  
      $('input#cancel-dateformat').live('click', function() {
        closeDialog(switchDateFormatDialog);
      });
  
      $('input#confirm-dateformat').live('click', function() {
        var new_dateformat = $('div.radios#date-format-radios input:checked').val();
        var weekstart_day  = $('div.radios#week-start-day-radios input:checked').val();
  
        Titanium.App.Properties.setString('weekstartday', weekstart_day.toString());
        Titanium.App.Properties.setString('dateformat', new_dateformat);
  
        $('input.datepicker').datepicker('destroy');
      
        $('ul.mainlist li').each(function() {
          if ($(this).children('span.showdate').length == 1) {
            $(this).children('input.datepicker').remove();
            $(this).children('img.ui-datepicker-trigger').remove();
          }
        });
      
        html.createDatepicker();
        html.make_timestamp_to_string();
  
        closeDialog(switchDateFormatDialog);
      });
    }
  }


  /**
   * Open the switch date format dialog
   * @author Dennis Schneider
   */
  function openSidebarDialog() {
    if ($("[role='dialog']").length === 0) {
      sidebarDialog = generateDialog(wunderlist.language.data.sidebar_position, html.generateSidebarHTML());
      openDialog(sidebarDialog);

      $('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');  
  
      $('input#cancel-settings').die();
      $('input#confirm-settings').die();
  
      var sidebar_position = (Titanium.App.Properties.getString('sidebar_position', 'right') == 'right') ? 0 : 1;
      $('div.radios#sidebar-position-radios input#sidebar_position_' + sidebar_position).attr('checked', 'checked');
  
      $('input#cancel-settings').live('click', function() {
        closeDialog(sidebarDialog);
      });
  
      $('input#confirm-settings').live('click', function() {
        var new_sidebar_position = ($('div.radios#sidebar-position-radios input:checked').val() === "0") ? 'right' : 'left';
        Titanium.App.Properties.setString('sidebar_position', new_sidebar_position);
        wunderlist.helpers.sidebar.initPosition();
        closeDialog(sidebarDialog);
      });
    }
  }


  /**
   * Open the delete prompt settings dialog
   * @author Dennis Schneider
   */
  function openDeletePromptDialog() {
    if ($("[role='dialog']").length === 0) {
      deletePromptDialog = generateDialog(wunderlist.language.data.delete_prompt_menu, html.generateDeletePromptHTML());
      openDialog(deletePromptDialog);
    
      $('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');  
    
      $('input#cancel-settings').die();
      $('input#confirm-settings').die();  
    
      var delete_prompt = Titanium.App.Properties.getString('delete_prompt', '1');
      $('div.radios#task-delete-radios input#task_delete_' + delete_prompt).attr('checked', 'checked');
    
      $('input#cancel-settings').live('click', function() {
        closeDialog(deletePromptDialog);
      });
    
      $('input#confirm-settings').live('click', function() {
        var new_delete_prompt = $('div.radios#task-delete-radios input:checked').val();
        Titanium.App.Properties.setString('delete_prompt', new_delete_prompt.toString());    
        closeDialog(deletePromptDialog);
      });  
    }
  }


  function openSidebarPositionDialog() {
      var sidebarDialog = generateDialog(wunderlist.language.data.sidebar_pos_menu, html.generateSidebarPosHTML());
      openDialog(sidebarDialog);
      $('input#cancel-settings').die();
      $('input#confirm-settings').die();
      var sidebar = settings.getSidebar();
      $('div.radios#sidebar-pos-radios input#sidebar_pos_' + sidebar).attr('checked', 'checked');
      $('input#cancel-settings').live('click', function() {
          $(sidebarDialog).dialog('close');
      });
      $('input#confirm-settings').live('click', function() {
          settings.sidebar = $('div.radios#sidebar-pos-radios input:checked').val();
          settings.update();
          $(sidebarDialog).dialog('close');
          $("#sidebar").fadeOut(500);
          $("#bottombar").fadeOut(500);
          $("#content").fadeOut(500, function() {
              window.location.reload();
          });
      });
  }


  /**
   * Open a dialog to set the shortcut for adding tasks and lists
   * @author Daniel Marschner
   */
  function openSelectAddItemMethodDialog() {
    if ($("[role='dialog']").length === 0) {
      var addItemMethodDialog = generateDialog(wunderlist.language.data.add_item_method, html.generateAddItemMethodHTML());
      openDialog(addItemMethodDialog);
    
      $('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');  
    
      $('input#cancel-settings').die();
      $('input#confirm-settings').die();  
    
      var add_item_method = Titanium.App.Properties.getString('add_item_method', '0');
      $('div.radios#add-item-method-radios input#add_item_method_' + add_item_method).attr('checked', 'checked');
    
      $('input#cancel-settings').live('click', function() {
        closeDialog(addItemMethodDialog);
      });
    
      $('input#confirm-settings').live('click', function() {
        var new_add_item_method = $('div.radios#add-item-method-radios input:checked').val();
        Titanium.App.Properties.setString('add_item_method', new_add_item_method.toString());    
        closeDialog(addItemMethodDialog);
      });  
    }
  }


  /**
   * Help dialog for the shortcuts
   * @author Daniel Marschner
   */
  function showHelpDialog() {
    if ($("[role='dialog']").length === 0) {
      var shortcutPrefix     = settings.shortcutkey + ' + ';
      var deleteListShortcut = (settings.os === 'darwin') ? shortcutPrefix + wunderlist.language.data.hotkey_help_backspace : wunderlist.language.data.hotkey_help_del;
      var helpHTML  = '<p><b>' + shortcutPrefix + 'L:</b> ' + wunderlist.language.data.hotkey_help_list + '</p>';
        helpHTML += '<p><b>' +  deleteListShortcut  + ':</b> ' + wunderlist.language.data.hotkey_help_delete + '</p>';
        helpHTML += '<p><b>' + shortcutPrefix + 'I:</b> ' + wunderlist.language.data.hotkey_help_inbox + '</p>';
        helpHTML += '<p><b>' + wunderlist.language.data.hotkey_help_updown_key + ':</b> ' + wunderlist.language.data.hotkey_help_updown + '</p>';
        helpHTML += '<p><b>' + shortcutPrefix + 'T/N:</b> ' + wunderlist.language.data.hotkey_help_task + '</p>';
        helpHTML += '<p><b>' + shortcutPrefix + 'F:</b> ' + wunderlist.language.data.hotkey_help_search + '</p>';
        helpHTML += '<p><b>' + shortcutPrefix + '1-8:</b> ' + wunderlist.language.data.hotkey_help_filters + '</p>';
        helpHTML += '<p><b>' + shortcutPrefix + 'B:</b> ' + wunderlist.language.data.hotkey_help_sidebar + '</p>';
  
      var helpDialog = $('<div>' + helpHTML + '</div>').dialog({
        autoOpen  : true,
        draggable : false,
        resizable : false,
        modal     : true,
        closeOnEscape: true,
        title     : wunderlist.language.data.hotkey_help_title
      });
  
      openDialog(helpDialog);
  
      $('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');  
    }
  }


  /**
   * Opens the credits dialog
   * @author Daniel Marschner
   */
  function openCreditsDialog() {
    if ($("[role='dialog']").length === 0){
      openDialog(generateDialog('What is Wunderlist?', html.generateCreditsDialogHTML(), 'dialog-credits'));
    }
  }


  function openBackgroundsDialog() {
    if ($("[role='dialog']").length === 0){
      openDialog(generateDialog('Background Credits', html.generateBackgroundsDialogHTML(), 'background-credits'));
    }
  }


  return {
    "init": init,
    "createAlertDialog": createAlertDialog,
    "closeEveryone": closeEveryone,
    "generateDialog": generateDialog,
    "openDialog": openDialog,
    "showErrorDialog": showErrorDialog,
    "showConfirmationDialog": showConfirmationDialog,
    "showOKDialog": showOKDialog,
    "showSharedSuccessDialog": showSharedSuccessDialog,
    "showDeletedDialog": showDeletedDialog,
    "showCloudAppDialog": showCloudAppDialog,
    "showWhileSyncDialog": showWhileSyncDialog,
    "openTaskDeleteDialog": openTaskDeleteDialog,
    "openNoteDeleteDialog": openNoteDeleteDialog,
    "openViewEditNoteDialog": openViewEditNoteDialog,
    "createDeleteListDialog": createDeleteListDialog,
    "openSwitchDateFormatDialog": openSwitchDateFormatDialog,
    "openSidebarDialog": openSidebarDialog,
    "openDeletePromptDialog": openDeletePromptDialog,
    "openSidebarPositionDialog": openSidebarPositionDialog,
    "openSelectAddItemMethodDialog": openSelectAddItemMethodDialog,
    "showHelpDialog": showHelpDialog,
    "openCreditsDialog": openCreditsDialog,
    "openBackgroundsDialog": openBackgroundsDialog
  };

})(window, jQuery, wunderlist, tasks, html, settings, Titanium);