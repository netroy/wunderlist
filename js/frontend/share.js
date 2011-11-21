wunderlist.frontend.share = (function(window, $, wunderlist, html, Encoder, Titanium, undefined){
  "use strict";


  /**
   * Send lists by mail
   * @author Christian Reber, Daniel Marschner
   */
  function share_by_email() {
    // Get All Tasks
    var sharingTasks = $('ul.mainlist li');
  
    if (sharingTasks.length > 0) {
      // Generate List Name
      var name = encodeURIComponent('Wunderlist - ' + $('#content h1:first').text());
      var body = '';

      $('ul.mainlist li').each(function() {
        body += encodeURIComponent("• " + Encoder.htmlDecode($(this).children('span.description').text()));

        // Add date
        if ($(this).children('span.showdate').html() !== '' && $(this).children('span.showdate').html() !== null) {
          body += "%20(" + $(this).children('span.showdate').html() + ")";
        }

        // Add note
        if ($(this).children('span.note').html() !== '') {
          body += "%0d%0a" + encodeURIComponent(Encoder.htmlDecode($(this).children('span.note').html())) + "%0d%0a";
        }

        body += "%0d%0a";
      });
    
      Titanium.Desktop.openURL("mailto:?subject=" + name + "&body=" + body + "%0d%0a" + encodeURI(' I generated this list with my task tool Wunderlist from 6 Wunderkinder - Get it from http://www.6wunderkinder.com/wunderlist'));
    } else {
      wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.empty_list);
    }
  }


  /**
   * Send lists to Cloudapp
   * @author Christian Reber, Daniel Marschner
   */
  function share_with_cloudapp() {
    // Get All Tasks
    if ($('ul.mainlist span.description').length > 0) {
      var user_credentials = wunderlist.account.getUserCredentials();

      // Generate data
      var data = {
        'email' : user_credentials.email,
        'list'  : $('#content h1:first').text(),
        'tasks' : []
      };

      $('ul.mainlist li').each(function() {
        var new_task = [];

        new_task.push($(this).children('span.description').html());

        // Add date
        if ($(this).children('span.showdate').hasClass('timestamp')) {
          new_task.push(parseInt($(this).children('span.timestamp').attr('rel'), 10) + 86400);
        } else {
          new_task.push(0);
        }

        // Add note
        if ($(this).children('span.note').html() !== '') {
          new_task.push($(this).children('span.note').html());
        }

        data.tasks.push(new_task);
      });
    
      // Generate CloudApp Link
      $.ajax({
        url     : 'http://cloudapp.wunderlist.net',
        type    : 'POST',
        data    : data,
        success : function(response_data, text, xhrobject) {
          var response = $.parseJSON(response_data);
        
          // Everything fine?
          if (response.code === 100) {
            $('#cloudtip span.link').text(response.url).parent().show();
          } else { // Else show an error
            wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.try_again_later);
          }
        }
      });
    } else {
      wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.empty_list);
    }
  }


  /**
   * Print the current list
   * @author Christian Reber
   */
  function generateHTMLForPrint(){
    // Build tasks HTML
    var html_code = '', last_headline = '', new_headline = false;
  
    // Generate the print HTML data
    $('ul.mainlist li').each(function() {
      if ($(this).parent().prev().get(0).tagName === 'H3') {
        new_headline = $(this).parent().prev().html();
        if (new_headline !== last_headline) {
          if (!last_headline) {
            html_code += '<h3 class="first">' + new_headline + '</h3>';
          } else {
            html_code += '</ul><h3>' + new_headline + '</h3>';
          }
          html_code += '<ul class="wunderlist">';
        }
        last_headline = new_headline;
      } else if (!new_headline) {
        html_code += '<ul class="wunderlist">';
        new_headline = true;
      }
    
      // If is normal list1
      html_code += '<li><span></span>' + $(this).children('span.description').html();
              
      // Add date
      if ($(this).children('span.showdate').html() !== '' && $(this).children('span.showdate').html() !== null) {
        html_code += ' (<b>' + $(this).children('span.showdate').html() + '</b>)';
      }

      // Add note
      if ($(this).children('span.note').html() !== '') {
        html_code += '<p>' + $(this).children('span.note').html().replace(/\n/g,'<br/>') + '</p>';
      }

      html_code += '</li>';
    });

    html_code += '</ul>';
    return html_code;
  }

  function renderPrintTemplate(template, list_name, html_tasks) {
    // Replace List Title
    template = template.replace(/####LIST####/g, list_name);

    // Replace Tasks
    template = template.replace(/####TASKS####/g, html_tasks);
    
    return template;
  }

  function print() {
    // Are they any tasks?  
    if ($('ul.mainlist span.description').length > 0) {
      var list_name = $('#content h1:first').text();
      var html_tasks = generateHTMLForPrint();
      var printWindow = $("#printFrame")[0];
      if(typeof printWindow.contentWindow.print === 'function'){
        $.get("/print.html", function(template){
          var html = renderPrintTemplate(template, list_name, html_tasks);
          $("body").append(printWindow);
          printWindow.focus();
          printWindow.contentDocument.write(html);
        });
      } else {
        // NOTE: This is a workaround for printing - Titanium doesn't support window.print(), so we have to do it that way, still cool feature

        // Create the temporary printfile
        var file = Titanium.Filesystem.getApplicationDataDirectory() + '/print.htm';
        file     = Titanium.Filesystem.getFile(file);

        // Load template
        var template = Titanium.Filesystem.getApplicationDirectory() + '/Resources/print.html';
        template     = Titanium.Filesystem.getFile(template).read();

        file.write(renderPrintTemplate(template, list_name, html_tasks));

        var file_url;
        if (wunderlist.settings.os === 'darwin') {
          file_url = 'file://';
        } else {
          file_url = 'file:///';
        }

        Titanium.Desktop.openURL(file_url + encodeURI(file));
      }
    } else {
      wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.empty_list);
    }
  }


  /**
   * Get the tasks for the according shared list
   * @author Dennis Schneider
   */
  function getTasksForSharing(is_filter_list, list_id) { 
    var tasks;
    // Is it a filterlist or a normal list?
    if (is_filter_list === false) {
      // Get all tasks from database within the current list
      tasks = wunderlist.database.getTasks(undefined, list_id);
    } else {
      var type = $('ul#list').attr('type');
      if (type === 'withdate') {
        tasks = wunderlist.database.getFilteredTasksForPrinting('date', type);
      } else if (type === 'nodate') {
        tasks = wunderlist.database.getFilteredTasksForPrinting('date', type);
      } else {
        tasks = wunderlist.database.getFilteredTasksForPrinting(type);
      }
    }

    return tasks;
  }


  /**
   * Converts a timestamp to a real date
   * @author Christian Reber, Dennis Schneider
   */
  function convert_timestamp_into_date(timestamp) {
    var selected_date  = new Date(timestamp * 1000);

    if(timestamp !== 0) {
      var day   = selected_date.getDate();
      var month = selected_date.getMonth() + 1; //January is 0!
      var year  = selected_date.getFullYear();

      if (day < 10) { 
        day = '0' + day;
      }

      if (month < 10)  { 
        month = '0' + month;
      }

      var today = new Date();

      var dateformat;
      if (wunderlist.settings.hasProperty('dateformat') === true) {
        dateformat = wunderlist.settings.getString('dateformat');
      } else {
        dateformat = wunderlist.language.code;
      }

      if (dateformat == 'de') {
        return day + '.' + month + '.' + year;
      } else if (dateformat == 'en') {
          return day + '/' + month + '/' + year;
      } else {
        return month + '/' + day + '/' + year;
      }
    } else {
      return 'No Date';
    }
  }

  

  function init() {
    var listfunctions = $("#listfunctions").addClass("slideTransition");

    listfunctions.find("a.list-print").attr("rel", wunderlist.language.data.print_tasks).click(print);
    listfunctions.find("a.list-email").attr("rel", wunderlist.language.data.send_by_mail).click(share_by_email);
    listfunctions.find("a.list-cloud").attr("rel", wunderlist.language.data.share_with_cloud).click(wunderlist.helpers.dialogs.showCloudAppDialog);

    // Copy Link into clipboard
    var copy = listfunctions.find("span.copy").html(wunderlist.language.data.copy_link);
    copy.click(function() {
      Titanium.UI.Clipboard.setText($('#cloudtip span.link').text());
    });

    // Open URL on click
    listfunctions.find("span.link").click(function() {
      Titanium.Desktop.openURL($(this).text());
    });

  }

  return {
    "init": init,
    "print": print,
    "share_with_cloudapp": share_with_cloudapp
  };

})(window, jQuery, wunderlist, html, Encoder, Titanium);