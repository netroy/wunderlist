/* global wunderlist */
wunderlist.helpers.html = (function() {

  //"use strict";

  /**
   * Returns the HTML structure of the login/register Dialog
   * @author Marvin Labod
   */
  function generateShareListDialogHTML(list_id) {
    var html_code =  '<p>' + wunderlist.language.data.sharelist_info +'</p>' +
        '<p class="small"><b>' + wunderlist.language.data.sharelist_hint + '</b>: ' + wunderlist.language.data.sharelist_hint_text + '</p>' +
        '<input type="hidden" id="share-list-id" rel="'+ list_id +'" />' +
        '<p class="clearfix"><input class="input-login input-sharelist" type="text" id="share-list-email" name="email" placeholder="' + wunderlist.language.data.invite_email + ',' + wunderlist.language.data.invite_email + '..." />' +
        '<input id="send_share_invitation" class="input-button button-social" type="submit" value="'+ wunderlist.language.data.sharelist_button +'" /></p></div>' +
        '<ul class="sharelistusers"></ul><br/>';
    return html_code;
  }


  /**
   * Returns the HTML structure of the login/register Dialog
   * @author Daniel Marschner
   */
  function generateLoginRegisterDialogHTML() {
    var html_code = '<div class="wunderlistlogo"><img src="/images/iosicon.png" alt="Wunderlist Icon"/></div>' +
      
      // LOGIN DIALOG
      
      '<div class="showlogindialog">' +
      '<div class="formright">'+
      '<input class="input-login" type="text" id="login-email" name="email" placeholder="' + wunderlist.language.english.email + '" />' +
      '<div class="errorwrap"><p class="error-email"></p></div>' +
      '<input class="input-login" type="password" id="login-password" name="password" placeholder="' + wunderlist.language.english.password + '" />' +
      '<div class="errorwrap"><p class="error-password"></p></div>' +
      '</div>' +
      '<div id="account-buttons" class="ui-dialog-buttonset">' +
      
      // LOGIN BUTTONS
      
      '<div class="loginbuttons">' +
          '<p class="pwd"><a id="showforgotpw" href="#">' + wunderlist.language.english.forgot_password + '</a></p>' +
          '<input class="input-button register button-login" type="submit" id="loginsubmit" value="' + wunderlist.language.english.login + '" />' +
          '<input class="input-button register" type="submit" id="showregistersubmit" value="' + wunderlist.language.english.register +'" />' +
          '<input class="input-button" type="submit" id="cancelreg" value="' + wunderlist.language.english.no_thanks + '" />' +
          '<img src="images/ajax-loader.gif" id="account-loader"/>' +
      '</div>' +
          
        // FORGOT PASSWORD BUTTONS
        
      '<div class="forgotpwbuttons">' +
          '<div class="whiteoverlay"></div>' +
          '<input type="text" class="input-login input-forgotpw" id="forgotpw-email" placeholder="' + wunderlist.language.english.input_forgot_password + '"/>' +
          '<input class="input-button register button-login"  id="forgot-pwd" type="submit" value="' + wunderlist.language.english.reset + '" />' +
          '<input class="input-button register" type="submit" id="cancelforgotpw" value="' + wunderlist.language.english.cancel + '" />' +
          '<div class="errorwrap"><p class="error-forgotpw"></p></div>' +
      '</div>' +
      
      '</div>' +
      '</div>' +
      
      // REGISTER DIALOG
      
      '<div class="showregisterdialog"><div class="registertutorial"></div>' +
      '<div class="formright">' +
      '<input class="input-login" type="text" id="register-email" name="email" placeholder="' + wunderlist.language.english.email + '"/>' +
      '<div class="errorwrap"><p class="error-email"></p></div>' +
      '<input class="input-login" type="password" id="register-password" name="password" placeholder="' + wunderlist.language.english.password + '"/>' +
      '<div class="errorwrap"><p class="error-password"></p></div>' +
      '</div>' +
      
      
      '<div id="account-buttons" class="ui-dialog-buttonset">' +
      '<p class="pwd">' +
      '<input type="checkbox" name="login-newsletter" id="register-newsletter" value="1" checked="checked"/>' +
      '<span>' + wunderlist.language.english.newsletter + '</span> ' +
      '</p>' +
            
      '<input class="input-button register button-login" type="submit" id="registersubmit" value="' + wunderlist.language.english.register + '"/>' +
      '<input class="input-button register" type="submit" id="showloginsubmit" value="Cancel" /> ' +
        '<img src="images/ajax-loader.gif" id="account-loader"/>' +
      '</div>' +
      '</div>';

    return html_code;
  }


  /**
   * Generates the list HTML structure
   *
   * @author Dennis Schneider
   * @author Daniel Marschner
   */
  function generateListContentHTML(list_id, list_name) {
    
    if (wunderlist.settings.os === 'darwin') {
      wunderlist.language.data.add_task_hint = wunderlist.language.data.add_task_hint.replace('Alt', '⌥');
    }

    var taskName = wunderlist.lastSavedTaskName || '';
    
    var html_code = '';

    html_code += "<h1>" + unescape(list_name) + "</h1>";
    html_code += "<div class='add'>";
    html_code += "<div class='addwrapper'><input type='text' class='input-add' placeholder='" + wunderlist.language.data.add_task + "' value='" + taskName + "' /><span class='add_task_hint'>" + wunderlist.language.data.add_task_hint + "</span></div>";
    html_code += "<input type='hidden' class='datepicker'/>";
    html_code += "</div>";
    html_code += "<ul id='list' rel='" + list_id + "' class='mainlist sortable'></ul>";

    return html_code;
  }


  /**
   * Generates a task in HTML
   *
   * @author Dennis Schneider
   * @author Daniel Marschner
   */
  function generateTaskHTML(id, name, list_id, done, important, date, note) {
    var taskHTML = "<li class='more" + (done == 1 ? " done" : "") + "' rel='" + list_id + "' id='" + id + "'>";
    
    if (done == 1) {
      taskHTML += "<div class='checkboxcon checked'>";
      taskHTML += "<input tabIndex='-1' class='input-checked' type='checkbox' checked='checked' />";
    } else {
      taskHTML += "<div class='checkboxcon'>";
      taskHTML += "<input tabIndex='-1' class='input-checked' type='checkbox' />";
    }
    
    var unescapedName = wunderlist.helpers.utils.stripTags(unescape(name));
    name = wunderlist.helpers.utils.replaceLinks(unescapedName) || wunderlist.language.data.new_task;

    taskHTML += '</div>';
    taskHTML += '<span class="icon fav ' + (important == 1 ? '' : 'favina') + '"></span>';
    taskHTML += '<span class="description">' + name + '</span>';

    if (!!(+date)) {
      taskHTML += '<span class="showdate timestamp" rel="' + date + '"></span>';
    } else {
      taskHTML += '<input type="hidden" class="datepicker" value="0"/>';
    }

    taskHTML += '<span class="icon delete"></span>';

    if (note !== '' && note !== undefined) {
      taskHTML += '<span class="icon note activenote">' + note + '</span>';
    } else {
      taskHTML += '<span class="icon note"></span>';
    }

    taskHTML += '</li>';

    return taskHTML;
  }


  /**
   * Returns the HTML structure of a new list (SIDEBAR)
   * @author Daniel Marschner
   */
  function generateNewListElementHTML(listId, listElementName, listElementInputClass) {
    if(listId === undefined || listId === '')
      listId = 'x';

    if(listElementName === undefined || listElementName === '') {
      listElementName = wunderlist.language.data.new_list;
    }

    if(listElementInputClass === undefined || listElementInputClass === '') {
      listElementInputClass = 'input-list';
    }

    var html_code  = "<a id='" + listId + "' class='list sortablelist'>";
        html_code += "<span>0</span>";
        html_code += "<div class='deletep'></div>";
        html_code += "<div class='savep'></div>";
        html_code += "<div class='editp'></div>";
        html_code += "<input class='" + listElementInputClass + "' maxlength='255' type='text' value='";
        html_code += wunderlist.helpers.utils.convertString(listElementName) + "' />";
        html_code += "</a>";

    return html_code;
  }


  /**
   * Returns the HTML structure for the credits dialog
   * @author Daniel Marschner
   */
  function generateCreditsDialogHTML() {
    var html_code = '<p><b>Wunderlist</b> is an easy-to-use task management tool, that runs on Windows, Mac, Linux, Android and on Apple iOS. Register for free to sync your todos online. No matter where you are, your Wunderlist follows you.<br /><br />' +
      '<b>What´s next?</b><br><br>' +
      'We are currently working on something pretty big. We call it <b>Wunderkit</b>, an online business platform that will change the way you look at corporate software products.<br /><br />' +
      'We hope you enjoy our first tool to make your daily life more effective and enjoyable.<br><br>' +
      '<strong>Wunderlist</strong> - ' + Titanium.App.version + '</p>';
      return html_code;
  }


  /**
   * Generate the HTML structure for the backgrounds dialog
   * @author Daniel Marschner
   */
  function generateBackgroundsDialogHTML() {
    var html_code =  '<p>&raquo; <a href="http://downloads.dvq.co.nz" target="_blank">Handcrafted Wood Texture</a> (DVQ)<br/>' +
        '&raquo; <a href="http://blog.artcore-illustrations.de" target="_blank">Balloon Monster</a> (Artcore Illustrations)<br/>' +
        '&raquo; <a href="http://www.galaxygui.com/" target="_blank">Dark Wood Texture</a> (Galaxgui)</p>';
    return html_code;
  }



  /**
   * Generates the HTML structure for the sidebar dialog
   *
   * @author Dennis Schneider
   */
  function generateSidebarHTML() {
      var html_code = '<div id="sidebar-position-radios" class="radios">' +
        '<p><b>' + wunderlist.language.data.sidebar_position_text + '</b></p>' +
        '<p><label><input id="sidebar_position_1" type="radio" name="sidebarPosition" value="1" /> <span>' + wunderlist.language.data.left + '</span></label> &nbsp; &nbsp; &nbsp; <label><input id="sidebar_position_0" type="radio" name="sidebarPosition" value="0" /> <span>' + wunderlist.language.data.right + '</span></label></p>' +
        '</div><p class="clearfix"><input id="cancel-settings" class="input-button" type="submit" value="'+ wunderlist.language.data.cancel +'" /> <input id="confirm-settings" class="input-button" type="submit" value="'+ wunderlist.language.data.save_changes +'" /></p></div>';
    return html_code;
  }

  /**
   * Generates the HTML structure for the add item method dialog
   * @author Daniel Marschner
   */
  function generateAddItemMethodHTML() {
      var html_code = '<div id="add-item-method-radios" class="radios">' +
            '<p><b>' + wunderlist.language.data.add_item_method_content + '</b></p>' +
        '<p><input id="add_item_method_0" type="radio" name="addItemMethod" value="0" /> <span>' + wunderlist.language.data.return_key + '</span> &nbsp; &nbsp; &nbsp; <input id="add_item_method_1" type="radio" name="addItemMethod" value="1" /> <span>' + wunderlist.helpers.utils.ucfirst(wunderlist.settings.shortcutkey) + ' + ' + wunderlist.language.data.return_key + '</span></p>' +
        '</div>' +
          '<p class="clearfix"><input id="cancel-settings" class="input-button" type="submit" value="'+ wunderlist.language.data.cancel +'" /> <input id="confirm-settings" class="input-button" type="submit" value="'+ wunderlist.language.data.save_changes +'" /></p></div>';
    return html_code;
  }


  /**
   * Returns the HTML structure for the invitation dialog
   * @author Daniel Marschner
   */
  function generateSocialDialogHTML() {
    var html_code = '<div id="invitebox"><div class="wunderlistlogo"></div>'+

      '<div class="socialform"><p><textarea class="textarea-dialog" id="invite-text" maxlength="140">'+ wunderlist.language.data.invitetextarea +'</textarea>' +
      '<p class="ui-dialog-buttonset"><input class="input-login input-social" type="text" id="email" name="email" value="' + wunderlist.language.data.invite_email + '" />' +
      '<input id="send_invitation" class="input-button button-social" type="submit" value="' + wunderlist.language.data.send + '" /></p></div>' +

      '<p class="socialmedia clearfix"><span class="icons">' +
      '<a href="http://www.stumbleupon.com/submit/?url=' + encodeURI('http://www.6wunderkinder.com') + '" target="_blank" class="stumbleupon"></a> ' +
      '<a href="http://digg.com/submit?url=' + encodeURI('http://www.6wunderkinder.com') + '" target="_blank" class="digg"></a> ' +
      
      
         '<div style="overflow:hidden;margin-top:-27px;width:320px;">'+
      '<iframe src="http://www.facebook.com/plugins/like.php?app_id=206703929372788&amp;href=http%3A%2F%2Ffacebook.com%2F6Wunderkinder&amp;send=false&amp;layout=button_count&amp;width=320&amp;show_faces=false&amp;action=like&amp;colorscheme=light&amp;font&amp;height=21" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:300px; height:21px;position: absolute;left:30px;" allowTransparency="true"></iframe>'+
         '<div style="position: absolute; left: 140px;width:270px;overflow:hidden;">'+
     '       <a href="http://twitter.com/6Wunderkinder" class="twitter-follow-button" link_color="#ddd" data-show-count="false">Follow</a>' +
     '       <script src="http://platform.twitter.com/widgets.js" type="text/javascript"></script>' +
     '   </div>' +
     '   <div style="position: absolute; left: 320px">'+
     '       <a href="http://twitter.com/share?url=http://www.6wunderkinder.com/wunderlist/&text=I started using Wunderlist" class="twitter-share-button" data-count="none" data-via="6Wunderkinder" data-lang="' + wunderlist.language.code + '">Tweet</a><script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script>'+
     '    </div></div>' +
      '</span>';
    return html_code;
  }

  /**
   * Returns the HTML structure for the edit profile dialog
   * @author Daniel Marschner
   */
  function generateEditProfileDialogHTML() {
    var html_code =
      '<p>' + wunderlist.language.data.edit_profile_desc + '</p>' +
      '<input class="input-normal"          type="text"     id="new_email"    name="new_email" placeholder="'+wunderlist.language.data.new_email_address+'" />' +
      '<input class="input-normal"          type="password" id="new_password" name="new_password" placeholder="'+wunderlist.language.data.new_password+'" />' +
      '<br /><p>' + wunderlist.language.data.edit_profile_old_pw + '</p>' +
      '<input class="input-normal"          type="password" id="old_password" name="old_password" placeholder="'+wunderlist.language.data.old_password+'" />' +
      '<p class="clearfix"> <input class="input-button register" type="submit"   id="submit_edit_profile" value="' + wunderlist.language.data.save_changes + '" />'+
      '<input class="input-button"          type="submit"   id="cancel_edit_profile" value="' + wunderlist.language.data.cancel + '" /></p>' +

      '<span class="error"></div>';

    return html_code;
  }


  /**
   * Build HTML for filters (including Add Field and Sharing Icons)
   * @author Daniel Marschner
   */
  function buildFilteredList(title, tasks, show_add, filter, callback) {
    show_add = show_add || false;
    result = '';
    count  = 0;
    
    // If tasks are set and not empty count them
    if (tasks !== undefined && (tasks instanceof Array) && tasks.length > 0){
      count = tasks.length;
    }
    
    if (wunderlist.settings.os === 'darwin') {
      wunderlist.language.data.add_task_hint = wunderlist.language.data.add_task_hint.replace('Alt', '⌥');
    }
    
    // Add the title for the filter
    result += '<h1>' + title + '</h1>';

    // Add the "Add new task" field
    if (show_add === true) {
      result += '<div class="add">';
      result += '<div class="addwrapper ' + (filter != 'all' && filter != 'starred' ? 'filter-add' : '') + '">';
      result += '<input type="text" class="input-add" placeholder="' + wunderlist.language.data.add_task + '" />';
      result += '<span class="add_task_hint">' + wunderlist.language.data.add_task_hint + '</span></div>';
      if (filter === 'all' || filter === 'starred') {
        result += '<input type="hidden" class="datepicker" />';
      }
      result += '</div>';
    }
    
    // Build tasks sorted by list
    if (count > 0) {
      actual_list = 0;
      last_list = 0;
      last_task_list = 0;
      
      wunderlist.database.getLists(undefined, function(err, lists){
        var listMap = {}, i, l, list;
        for(i = 0, l = lists.length; i < l; i++){
          list = lists[i];
          listMap[list.id] = list;
        }

        for(i = 0, l = tasks.length; i < l; i++){
          task = tasks[i];
          list = listMap[task.list_id];
          if(typeof list !== 'undefined') {
            if (task.list_id !== last_task_list){
              actual_list = task.list_id;
            }
            if(last_list !== actual_list){
              if (last_list !== 0){
                result += "</ul>";
              }
              result += '<h3 class="clickable cursor" rel="' + actual_list + '">' + unescape(list.name) +  '</h3>';
              result += '<ul id="filterlist' + actual_list + '" rel="' + (filter !== '' ? filter : 'x') + '" class="mainlist filterlist' + (filter == 'done' ? ' donelist' : ' sortable') + '">';
            }
            result += generateTaskHTML(task.id, task.name, task.list_id, task.done, task.important, task.date, task.note);
            last_list = actual_list;
            last_task_list = task.list_id;
          }
        }
        callback(null, result);
      });

      
      /*
      for (var ix in tasks)
      {
        if (wunderlist.database.existsById('lists', tasks[ix].list_id))
        {
          if (tasks[ix].list_id != last_task_list)
            actual_list = tasks[ix].list_id;
          
          if (last_list != 0 && last_list != actual_list)
            result += "</ul>";
          
          if (last_list != actual_list)
          {
            var dbList = wunderlist.database.getLists(parseInt(tasks[ix].list_id));
            
            result += '<h3 class="clickable cursor" rel="' + actual_list + '">' + unescape(dbList[0].name) +  '</h3>';
            result += '<ul id="filterlist' + actual_list + '" rel="' + (filter != '' ? filter : 'x') + '" class="mainlist filterlist' + (filter == 'done' ? ' donelist' : ' sortable') + '">';
          }
          
          result += generateTaskHTML(tasks[ix].id, tasks[ix].name, tasks[ix].list_id, tasks[ix].done, tasks[ix].important, tasks[ix].date, tasks[ix].note);
                  
          last_list      = actual_list;
          last_task_list = tasks[ix].list_id;
        }
      }
      */
    } else {
      if (show_add === false){
        result += '<h3>' + wunderlist.language.data.no_results + '</h3>';
      }
      callback(null, result);
    }
  }


  function init() {
    // Open every link in the browser
    $('a[href^=http], a[href^=https], a[href^=ftp], a[href^=mailto]').live('click', function() {
      Titanium.Desktop.openURL(this.href);
      return false;
    });
    
    // Open every file in the finder app
    $('span.openApp').live('click', function() {
      Titanium.Platform.openApplication($.trim($(this).text()));
    });
  }


  return {
    "init": init,
    "generateSidebarHTML": generateSidebarHTML,
    "generateTaskHTML": generateTaskHTML,
    "generateListContentHTML": generateListContentHTML,
    "generateCreditsDialogHTML": generateCreditsDialogHTML,
    "generateNewListElementHTML": generateNewListElementHTML,
    "generateShareListDialogHTML": generateShareListDialogHTML,
    "generateLoginRegisterDialogHTML": generateLoginRegisterDialogHTML,
    "generateBackgroundsDialogHTML": generateBackgroundsDialogHTML,
    "generateAddItemMethodHTML": generateAddItemMethodHTML,
    "generateSocialDialogHTML": generateSocialDialogHTML,
    "generateEditProfileDialogHTML": generateEditProfileDialogHTML,
    "buildFilteredList": buildFilteredList
  };
  
})();