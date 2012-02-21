/* globals wunderlist, jQuery, async */
wunderlist.frontend.tasks = (function($, window, wunderlist, async, shortcut, undefined){

  "use strict";

  var checkClicked = false, focusOutEnabled = true, totalFocusOut = false, addNewTaskToTop = false;
  var setTimeout = window.setTimeout, unescape = window.unescape;

  /**
   * Scans for a date in a task and returns a result object
   * @author Dennis Schneider
   * @author Adam Renklint
   */
  function smartScanForDate(string, doNaturalRecognition) {
    if (wunderlist.settings.getInt('enable_natural_date_recognition', 0) === 1) {
      doNaturalRecognition = true;
    }

    var result = {},
      number = 0,
      month = '',
      date = new Date();

    if (doNaturalRecognition) {
      // Check for "today"
      if (string.search('today') != -1) {
        return {
          string: string.replace('today', ''),
          timestamp: wunderlist.helpers.datetime.getWorldWideDate(date)
        };
      }

      // Check for "tomorrow"
      if (string.search('tomorrow') !== -1) {
        date.setDate(date.getDate() + 1);
        return {
          string: string.replace('tomorrow', ''),
          timestamp: wunderlist.helpers.datetime.getWorldWideDate(date)
        };
      }

      // Check for "in 3 days, in 1 week, in 2 months, in 1 year"
      var rgxpRelativeDates  = /\bin\s([0-9]+)\s\b(days?|weeks?|months?|years?)/;
      if (string.match(rgxpRelativeDates) !== null) {
        result = string.match(rgxpRelativeDates);
        number = parseInt(result[1], 10);
        if (number < 1) {
          return {};
        }
        switch (result[2]) {
          case 'day':
          case 'days':
            date.setDate(date.getDate() + number);
            break;
          case 'week':
          case 'weeks':
            date.setDate(date.getDate() + (7 * number));
            break;
          case 'month':
          case 'months':
            date.setMonth(date.getMonth() + number);
            break;
          case 'year':
          case 'years':
            date.setFullYear(date.getFullYear() + number);
            break;
          default:
            return {};
        }
        return {
          string: string.replace(result[0], ''),
          timestamp: wunderlist.helpers.datetime.getWorldWideDate(date)
        };
      }

      // Check for "on monday, on tuesday, on wednesday, on thursday, on friday, on saturday, on sunday"
      var rgxpOnWeekday    = /\bon\b\s(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i;
      if (string.match(rgxpOnWeekday) !== null) {
        var weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        var today = date.getDay();
        var difference = 0;
        result = string.match(rgxpOnWeekday);
        for (var i = 0, max = weekdays.length; i < max; i++) {
          if (weekdays[i] === result[1].toLowerCase()) {
            difference = i - today;
            if (difference < 0) {
              difference = difference + 7;
            } else if (difference === 0) {
              difference = 7;
            }
            string = string.replace(result[0], 'in ' + difference + ' days');
            return smartScanForDate(string, doNaturalRecognition);
          }
        }
      }

      // Check for "on 21st of may, on 21 may"
      var rgxpOnStandard = /\bon\s([0-9]+)(st|nd|rd|th)?\s\b(of)?\s?\b(January|February|March|April|May|June|July|August|September|October|November|December)/i;
      if (string.match(rgxpOnStandard) !== null) {
        result = string.match(rgxpOnStandard);
        number = parseInt(result[1], 10);
        month = wunderlist.helpers.utils.ucfirst(result[4]);
        date = wunderlist.helpers.utils.setToFuture(new Date(month + ' ' + number + ', ' + date.getFullYear()));
        return {
          string: string.replace(result[0], ''),
          timestamp: wunderlist.helpers.datetime.getWorldWideDate(date)
        };
      }

      // Check for "on may 21st, on may 21"
      var rgxpOnAlternate   = /\bon\s\b(January|February|March|April|May|June|July|August|September|October|November|December)\s\b([0-9]+)(st|nd|rd|th)?/i;
      if (string.match(rgxpOnAlternate) !== null) {
        result = string.match(rgxpOnAlternate);
        number = parseInt(result[2], 10);
        month = wunderlist.helpers.utils.ucfirst(result[1]);
        date = wunderlist.helpers.utils.setToFuture(new Date(month + ' ' + number + ', ' + date.getFullYear()));
        return {
          string: string.replace(result[0], ''),
          timestamp: wunderlist.helpers.datetime.getWorldWideDate(date)
        };
      }
    }

    // Check for "#monday, #tuesday, #wednesday, #thursday, #friday, #saturday, #sunday"
    var rgxpPUWeekdays    = /\#(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i;
    if (string.match(rgxpPUWeekdays) !== null) {
      result = string.match(rgxpPUWeekdays);
      string = string.replace(result[0], 'on ' + result[1]);
      return smartScanForDate(string, true);
    }
    
    // Check for "#21may"
    var rgxpPUExplicitDates  = /\#([0-9]+)(January|February|March|April|May|June|July|August|September|October|November|December)/i;
    if (string.match(rgxpPUExplicitDates) !== null) {
      result = string.match(rgxpPUExplicitDates);
      string = string.replace(result[0], 'on ' + result[1] + ' ' + result[2]);
      return smartScanForDate(string, true);
    }
    
    // Check for "#may21"
    var rgxpPUAlternateDates = /\#(January|February|March|April|May|June|July|August|September|October|November|December)([0-9]+)/i;
    if (string.match(rgxpPUAlternateDates) !== null) {
      result = string.match(rgxpPUAlternateDates);
      string = string.replace(result[0], 'on ' + result[2] + ' ' + result[1]);
      return smartScanForDate(string, true);
    }
    
    // Check for "#3d, #2w, #2m, #1y"
    var rgxpPURelativeDates  = /\#([0-9]+)(d|w|m|y)/i;
    if (string.match(rgxpPURelativeDates) !== null) {
      result        = string.match(rgxpPURelativeDates);
      var fullParams = {
        'd':   'days',
        'w':   'weeks',
        'm':   'months',
        'y':   'years'
      };
      string = string.replace(result[0], 'in ' + result[1] + ' ' + fullParams[result[2]]);
      return smartScanForDate(string, true);
    }
    
    // Check for "#td"
    if (string.match('#td')) {
      string = string.replace('#td', 'today');
      return smartScanForDate(string, true);
    }
    
    // Check for "#tm"
    if (string.match('#tm')) {
      string = string.replace('#tm', 'tomorrow');
      return smartScanForDate(string, true);
    }

    return {};
  }


  function syncPositionsToDB() {
    var tasks = $("ul.mainlist li"), i = 1, len = tasks.length;
    wunderlist.helpers.task.setDefaults();
    async.forEachSeries(tasks, function(liElement, next){
      liElement = $(liElement);
      wunderlist.helpers.task.set({
        id: liElement.attr("id"),
        // Update list_id in case of drag-drop across lists
        list_id: liElement.attr("rel"),
        position: i++
      }).update(false, function(err, result) {
        if(i <= len) {
          next();
        }
      });
    });
  }


  // ADD a new task to the db and frontend
  var list_id, task_name;
  function addToDOM(important, markup) {
    if ($("ul.filterlist").length > 0 || $('#left a.active').length === 1) {
      var ulElement = $('ul#filterlist' + list_id);
      var pendingImportantTasks = ulElement.find('li.more:not(.done) .fav');
      
      if (ulElement !== undefined && ulElement.is('ul')) {
        if (addNewTaskToTop) {
          //ulElement.prepend(markup).find('li:first').hide().fadeIn(225);
          if (important) {
            $(ulElement).prepend(markup).find("li:first").hide().fadeIn(225);
          } else {
            if (pendingImportantTasks.size() > 0) {
              pendingImportantTasks.last().parent().after(markup).next().hide().fadeIn(225);
            } else {
              $(ulElement).prepend(markup).find("li:first").hide().fadeIn(225);
            }
          }
        } else {
          if (important) {
            if (pendingImportantTasks.size() > 0) {
              pendingImportantTasks.last().parent().after(markup).next().hide().fadeIn(225);
            } else {
              $(ulElement).prepend(markup).find("li:last").hide().fadeIn(225);
            }
          } else {
            $(ulElement).append(markup).find("li:last").hide().fadeIn(225);
          }
        }
      } else {
        var listHTML  = '<h3 class="clickable cursor" rel="' + list_id + '">' + $('a#list' + list_id + ' b').text() + '</h3>'+
                        '<ul id="filterlist' + list_id + '" rel="' + ulElement.attr('rel') + '" class="mainlist sortable filterlist">' +
                        markup + '</ul>';
      
        // If adding to inbox in filter view, the inbox should be inserted before any other list
        wunderlist.database.getLists(list_id, function(err, lists){
          if (lists[0].inbox == 1) {
            $('div#content .add').after(listHTML);
          } else {
            $('div#content').append(listHTML);
          }
        });
      }
    } else { // ORDINARY LIST
      if (addNewTaskToTop) {
        if (important) {
          $("ul.mainlist").prepend(markup).find("li:first").hide().fadeIn(225);
        } else {
          if ($('ul.mainlist li.more:not(.done) .fav').size() > 0) {
            $('ul.mainlist li.more:not(.done) .fav').last().parent().after(markup).next().hide().fadeIn(225);
          } else {
            $("ul.mainlist").prepend(markup).find("li:first").hide().fadeIn(225);
          }
        }
      } else {
        if (important) {
          if ($('ul.mainlist li.more:not(.done) .fav').size() > 0) {
            $('ul.mainlist li.more:not(.done) .fav').last().parent().after(markup).next().hide().fadeIn(225);
          } else {
            $("ul.mainlist").prepend(markup).find("li:last").hide().fadeIn(225);
          }
        } else {
          $("ul.mainlist").append(markup).find("li:last").hide().fadeIn(225);
        }
      }
      wunderlist.helpers.datetime.createDatepicker();
    }

    $("input.input-add").val('');
    $(".add .showdate").remove();

    totalFocusOut = false;

    // Reset DatePicker
    $('.datepicker').val('');
    
    wunderlist.frontend.sortdrop.makeSortable();
    wunderlist.frontend.filters.updateBadges();
    wunderlist.helpers.datetime.convertTimestampToString();
    
    if (addNewTaskToTop) {
      syncPositionsToDB();
      addNewTaskToTop = false;
    }
  }

  function add() {
    var text = $("input.input-add").val();
    if (text.length > 0) {
      // Add Task to List
      list_id       = $("ul.mainlist").attr("rel");
      task_name     = wunderlist.helpers.utils.convertString(text);
      
      // Tasks default not be important
      var important = 0;
      
      // Check if task should be prio
      if (task_name.indexOf('*') === 0) {
        task_name = task_name.substr(1);
        important = 1;
      }
      
      // Trim whitespace
      task_name = $.trim(task_name);
      
      // Init timestamp & scan for the date
      var timestamp = 0;
      var smartDate = smartScanForDate(task_name);
      
      // Process the smartDate results
      if (smartDate.timestamp && smartDate.string) {
        timestamp  = smartDate.timestamp;
        task_name  = smartDate.string;
        /*
          var day             = smartDate['day'];
          var monthName       = smartDate['month'];
          var year            = smartDate['year'];
          var smartDateObject = new Date();
          var monthNumber     = wunderlist.helpers.datetime.getMonthNumber(monthName);
          smartDateObject.setMonth(monthNumber);
          smartDateObject.setDate(day);
          smartDateObject.setFullYear(year);
          timestamp           = wunderlist.helpers.datetime.getWorldWideDate(smartDateObject);
          task_name           = smartDate['string'];
        */
      }
      
      if (task_name !== '') {
        if (timestamp === 0) {
          timestamp = $(".add .showdate").attr('rel');
        }

        timestamp = timestamp || 0;
        important = important || 0;
        
        if (isNaN(parseInt(list_id, 10)) || $('#left a.active').length === 1) {
          var activeFilter = $('#left a.active');
          
          if (list_id === 'today' || activeFilter.attr('id') === 'today') {
            timestamp = wunderlist.helpers.datetime.getWorldWideDate();
          } else if (list_id === 'tomorrow' || activeFilter.attr('id') === 'tomorrow') {
            timestamp = wunderlist.helpers.datetime.getWorldWideDate() + 86400;
          } else if (list_id === 'starred' || activeFilter.attr('id') === 'starred') {
            important = 1;
          }
          
          // On Filters set it to the inbox
          list_id = 1;
        }

        var task_id  = wunderlist.helpers.task.set({
          name: task_name,
          list_id: list_id,
          date: timestamp,
          important: important
        }).insert(function(err, taskId){
          var taskHTML = wunderlist.helpers.html.generateTaskHTML(taskId, task_name, list_id, 0, important, timestamp);
          addToDOM(important, taskHTML);
        });

      } else {
        $("input.input-add").val('');
      }
    }
  }


  /**
   * Saves a task to the database
   *
   * @author Dennis Schneider, Christian Reber, Daniel Marschner, Marvin Labod
   */
  function edit() {
    focusOutEnabled = false;

    var task_name = $('#task-edit').val();
    var task_id = $('#task-edit').parent().attr('id');
    
    $('#task-edit').parent().find('.description').html(wunderlist.helpers.utils.replaceLinks(unescape(task_name))).show();
    $('#task-edit').remove();
    
    wunderlist.helpers.task.set({
      id: task_id,
      name: wunderlist.helpers.utils.convertString(task_name)
    }).update(false, wunderlist.frontend.filters.updateBadges);

    // TODO: What would this line do ??
    //$('html').find('.description').html();
    focusOutEnabled = true;
  }


  /**
   * Cancel the edit mode of a task
   *
   * @author Dennis Schneider, Christian Reber, Daniel Marschner, Marvin Labod
   */
  function cancel() {
    focusOutEnabled = false;

    var listElement = $('#task-edit').parent();
    listElement.children('input#task-edit').remove();
    listElement.children('span.description').show();
  }


  /**
   * Delete a task from the list
   * @author Dennis Schneider, Daniel Marschner
   */
 // UPDATE the task deleted status in HTML
  function updateDeleted(instance) {
      var removeList = false;
      var liElement  = $('li#' + instance.id);
      var ulElement  = liElement.parent('ul');

      // TODO: fix this for done tasks
      if (ulElement.hasClass('filterlist') && ulElement.children('li').length === 1) {
        if (ulElement.children('li').length === 0) {
          removeList = true;
        }
      } else {
        if (liElement.find('.checked').length === 1) {
          removeList = true;
        }
      }

      if (removeList === true) {
        var hElement = ulElement.prev();
        if (hElement.is('h3')){
          hElement.remove();
        }
        ulElement.remove();
      }

      liElement.slideUp('fast', function(){
        liElement.remove();
      });

      wunderlist.frontend.notes.closeNoteWindow(instance.id);
  }

  function deletes(deleteElement) {
    var liElement = deleteElement.parent();
    var id = liElement.attr('id');

    wunderlist.helpers.task.set({
      id: liElement.attr('id'),
      list_id: liElement.attr('rel'),
      deleted: 1
    }).update(false, updateDeleted);
  }


  /**
   * Open a prompt asking for the deletion of a task
   * @author Dennis Schneider, Daniel Marschner
   */
  var deleteTaskDialog;
  function openTaskDeleteDialog(deleteElement) {
    var buttons = {};
    buttons[wunderlist.language.data.delete_task_no]  = function() {
      deleteTaskDialog.dialog('close');
    };
    buttons[wunderlist.language.data.delete_task_yes] = function() {
      deletes(deleteElement);
      deleteTaskDialog.dialog('close');
    };

    deleteTaskDialog = $('<div></div>').dialog({
      autoOpen    : true,
      draggable   : false,
      modal       : true,
      closeOnEscape: true,
      dialogClass : 'dialog-delete-task',
      title       : wunderlist.language.data.delete_task_question,
      buttons     : buttons,
      open        : function(event, ui) {
        // Focus on the no button
        var noButton = $('.ui-dialog-buttonset button:first');
        noButton.focus();
        noButton.addClass("input-bold");
      }
    });
  }


  // UPDATE the task done status in HTML
  function updateDone(instance) {
    if (instance.id !== undefined && instance.id > 0 && instance.done !== undefined) {
      var liElement = $('li#' + instance.id),
          lastLiElement, firstDoneLiElement, doneLiElementCount,
          ulElement = 'ul.mainlist';

      if (instance.done === 1) {
        liElement.addClass('done');

        // If it is not the search / filter site, create a done list at the bottom
        if ($('ul.searchlist').length === 0 && $('ul.filterlist').length === 0) {
          if ($("ul#donelist_list_today").length === 0) {
            $("ul.mainlist").after("<h3 class='head_today'>" + wunderlist.language.data.done_today + "</h3>");
            $("div#content h3.head_today").after("<ul id='donelist_list_today' class='donelist'></ul>");
          }

          liElement.slideUp('fast', function() {
            liElement.prependTo('ul#donelist_list_today').slideDown();
          });
        }
        // On the search list, just append the checked task to the end of the searchlist
        else if ($('ul.searchlist').length > 0) {
          // Get the last searched task
          lastLiElement = liElement.parent('ul.searchlist').find('li:last');

          if (liElement.attr('id') != lastLiElement.attr('id')) {
            liElement.slideUp('fast', function() {
              liElement.appendTo('ul.searchlist').slideDown();
            });
          }
        }
        // On the filter and search list, just append the checked task to the end of the parent filterlist
        else {
          // Get the last task
          lastLiElement = liElement.parent('ul.filterlist').find('li:last');

          if (liElement.attr('id') != lastLiElement.attr('id')) {
            liElement.slideUp('fast', function() {
              liElement.appendTo('ul#filterlist' + liElement.attr('rel')).slideDown();
            });
          }
        }
      }

      if (instance.done === 0) {
        if ($('a#done').hasClass('active')) {
          if (liElement.parent('ul.filterlist').find('li').length === 1) {
            liElement.parent().prev().remove();
            liElement.parent().remove();
          }

          liElement.remove();
          return;
        }

        if (liElement.parent('ul.donelist').find('li').length === 1) {
          liElement.parent().prev().remove();
          liElement.parent().remove();
        }


        if ($('ul.filterlist').length > 0 || $('ul.searchlist').length > 0) {
          var parentElement = liElement.parent($('ul.filterlist').length > 0 ? 'ul.filterlist' : 'ul.searchlist');

          // Get the last task
          lastLiElement      = parentElement.find('li:last');
          firstDoneLiElement = parentElement.find('li.done:first');
          doneLiElementCount = parentElement.find('li.done').length;

          ulElement = $('ul.filterlist').length > 0 ? 'ul#filterlist' + liElement.attr('rel') : 'ul.searchlist';
        }

        if (doneLiElementCount !== undefined) {
          if (doneLiElementCount > 1) {
            if (liElement.attr('id') == lastLiElement.attr('id') ||
               (liElement.attr('id') !== lastLiElement.attr('id') &&
                liElement.attr('id') !== firstDoneLiElement.attr('id'))) {
              liElement.slideUp('fast', function() {
                if (liElement.find('span.fav').length === 1){
                  liElement.prependTo(ulElement).slideDown();
                } else {
                  liElement.insertBefore(firstDoneLiElement).slideDown();
                }
              });
            }
          }
        } else {
          liElement.slideUp('fast', function() {
            if(liElement.find('span.fav').length === 1){
              liElement.prependTo(ulElement).slideDown();
            } else {
              liElement.appendTo(ulElement).slideDown();
            }
          });
        }

        liElement.removeClass('done');
        wunderlist.helpers.datetime.convertTimestampToString();

        liElement.children('input.datepicker').remove();
        liElement.children('img.ui-datepicker-trigger').remove();

        if (liElement.children('span.showdate').length === 0) {
          var datepickerHTML = '<input type="hidden" class="datepicker" value="0"/>';
          $(datepickerHTML).insertAfter(liElement.children('span.description'));
        }

        wunderlist.helpers.datetime.createDatepicker();
      }
    }
  }


  // UPDATE the task list_id
  function updateList(instance) {
    if (instance.id !== undefined && instance.id > 0 && instance.list_id !== undefined && instance.list_id > 0) {
      var liElement = $('li#' + instance.id);
      var oldListId = liElement.attr('rel');
      var newListId = instance.list_id.toString();
      var listHTML;

      if (oldListId !== instance.list_id) {
        if ($('ul.filterlist').length === 0) {
          liElement.remove();
        } else {
          var ulElement = $('ul#filterlist' + oldListId.toString());

          if (wunderlist.frontend.sortdrop.taskDroped === true) {
            if ($('ul#filterlist' + instance.list_id).length === 0) {
              listHTML  = '<h3 class="clickable cursor" rel="' + instance.list_id + '">' + $('a#list' + instance.list_id + ' b').text() + '</h3>';
              listHTML += '<ul id="filterlist' + instance.list_id + '" rel="' + ulElement.attr('rel') + '" class="mainlist sortable filterlist"></ul>';

              $('div#content').append(listHTML);
              wunderlist.frontend.sortdrop.makeSortable();
            } else {
              /*
              if (liElement.find('span.fav').length === 1) {
                window.setTimeout(function() {
                  liElement.appendTo('ul#filterlist' + newListId).slideDown();
                }, 10);
              } else {
                window.setTimeout(function() {
                  liElement.appendTo('ul#filterlist' + newListId).slideDown();
                }, 10);
              }
              */
            }
            /*
            window.setTimeout(function() {
              liElement.appendTo('ul#filterlist' + newListId).slideDown();
            }, 10);
            */
            liElement.appendTo('ul#filterlist' + newListId).delay(10).slideDown();
            wunderlist.frontend.sortdrop.taskDroped = false;
          }

          // TODO: do this with callbacks instead of timers
          window.setTimeout(function() {
            var liCount = ulElement.children('li').length;
            if (liCount === 0) {
              // Remove list headline title and the ul element
              ulElement.prev().remove();
              ulElement.remove();
            }
          }, 10);
        }

        liElement.attr('rel', instance.list_id);
      }
    }
  }


  function addTasksHandler(e) {
    var elementId, taskName, element, stepUp, stepDown;
    wunderlist.timer.pause();
    var aimSetting = wunderlist.settings.getInt('add_item_method', 0);
    
    // If not empty and Return gets pressed, new task will be added
    if(e.keyCode === 13 && aimSetting === 0) {
      add();
      wunderlist.timer.resume();
    } else if(e.keyCode === 27) { // If ESC gets pressed, close Add Task
      totalFocusOut = false;
      //isEdit = false;
      wunderlist.timer.resume();
    } else if (e.keyCode === 38) {
      if (stepUp === false) {
        stepUp = true;
        element = $('div#lists > a.ui-state-disabled');
        elementId = element.prev().attr('id');
        taskName = $("div.add input").val();

        if(elementId === undefined) {
          $('div#lists a').last().click();
        } else {
          $('div#lists > a.ui-state-disabled').prev().click();
        }

        wunderlist.lastSavedTaskName = $("div.add input").val(taskName);
      }

      setTimeout(function() {
        $(".addwrapper input").focus();
        //$("div.add input").val(taskName);
        delete wunderlist.lastSavedTaskName;
        stepUp = false;
      }, 50);
    } else if (e.keyCode === 40) {
      if(stepDown === false) {
        stepDown = true;
        element = $('div#lists > a.ui-state-disabled');
        elementId = element.next().attr('id');
        taskName = $("div.add input").val();

        if(elementId === undefined) {
          $('div#lists a').first().click();
        } else {
          $('div#lists > a.ui-state-disabled').next().click();
        }
        
        wunderlist.lastSavedTaskName = wunderlist.lastSavedTaskName || $("div.add input").val(taskName);
      }

      setTimeout(function() {
        $(".addwrapper input").focus();
        //$("div.add input").val(taskName);
        delete wunderlist.lastSavedTaskName;
        stepDown = false;
      }, 50);
    }
  }


  function triggerEditMode(e) {
    var spanElement = $(e.target), liElement = spanElement.parent('li'), titleText;

    if (liElement.hasClass('done') === false) {
      var timestampElement = liElement.children('span.timestamp');
      var doneIsActive = ($('div#left a#done.active').length === 1);

      // Check if edit mode has already been activated
      if($('#task-edit').length === 0 && doneIsActive === false) {
        wunderlist.timer.pause();

        // Get input values
        titleText = spanElement.text();
        spanElement.hide();

        var html_code  = '<input type="text" id="task-edit" value="" />';

        // Edit the Actual task into an edit task
        liElement.children(".checkboxcon").after(html_code);

        $('input#task-edit').val(titleText);
        $("input#task-edit").select();

        totalFocusOut = false;
      }
    }
  }


  function selectDate(e) {
    var spanElement = $(e.target), liElement = spanElement.parent('li'), description, dateInput, datePickerInput, datePickerImage;
    description = liElement.find(".description");
    dateInput   = liElement.find(".datepicker");

    description.after("<input type='hidden' class='datepicker'/>");
  
    wunderlist.helpers.datetime.createDatepicker();
    
    datePickerInput = liElement.find(".datepicker");
    datePickerImage = liElement.find(".ui-datepicker-trigger");
    datePickerImage.click().remove();
      
    // This is the Friday night hack to remove the doubled datepicker
    // :) Thank you ladies and gentlemen!
    setTimeout(function() {
      if (liElement.find("input.hasDatepicker").length == 2)
        liElement.find("input.hasDatepicker").eq(0).remove();
    }, 100);
  }


  function cancelTask(e) {
    if(e.keyCode == 27) {
      var node = $(e.currentTarget);
      node.val('');
      $('div.add span.timestamp').remove();
      node.blur();
      wunderlist.timer.resume();
    }
  }


  function saveOnBlur(e) {
    // TODO: delegating from the entire document is not such a great idea... bad performance
    var editInput = $('input#task-edit');
    if(editInput.is('input')) {
      var clickedElement = $(e.target);
      if(clickedElement.attr('id') !== 'task-edit' && editInput.val().length > 0) {
        edit();
      }
    }
  }


  function saveEditedTask(e) {
    if(e.keyCode == 13) { // Enter key
      edit();
      wunderlist.timer.resume();
    } else if(e.keyCode == 27) { // Esc Key
      totalFocusOut = false;
      cancel();
      wunderlist.timer.resume();
    }
  }


  function toggleDoneStatus(e) {
    if(checkClicked === false) {
      checkClicked = true;
      var node = $(e.currentTarget), parent = node.parent();
      node.toggleClass("checked");

      // If it is not checked, check and append to done list
      var done, done_date;
      if(node.hasClass("checked")) {
        done = 1;
        done_date = wunderlist.helpers.datetime.getWorldWideDate();
      } else { // If is already checked, append to upper list
        done = 0;
        done_date = 0;
      }

      wunderlist.helpers.task.set({
        id: parent.attr("id"),
        list_id: parent.attr("rel").replace('list', ''),
        done: done,
        done_date: done_date
      }).update(false, updateDone);
    }

    setTimeout(function() {
      checkClicked = false;
    }, 100);
  }


  function toggleImportanceFlag(e){
    // TODO: figure this out
    if($('a#done.active').length !== 0) {
      return;
    }

    var node = $(e.currentTarget);
    var liElement = node.parent('li');
    var ulElement = liElement.parent('ul');
    var id = liElement.attr("id");

    var setImportant, target;
    if(node.hasClass("favina")) {
      // Can't flag done tasks as important
      if(liElement.hasClass('done')) {
        return;
      }
      // mark as important
      setImportant = 1;
      target = ulElement.find('li:first');
    } else {
      // mark as unimportant
      setImportant = 0;
      target = ulElement.find('span.fav:last').parent();
    }
    node.toggleClass("favina", !setImportant);

    // Move the task to new position only if there is more than one task on the list
    // or when a task is not already at the correct position
    if (ulElement.children('li').length > 1 && id !== target.attr('id')) {
      liElement.slideUp('fast', function() {
        if(setImportant === 0) {
          liElement = liElement.insertAfter(target);
        } else {
          liElement = liElement.prependTo(ulElement);
        }
        liElement.slideDown(400);
      });
    }

    wunderlist.helpers.task.set({
      id: id,
      important: setImportant
    }).update(false, syncPositionsToDB);
  }


  // TODO: init is too big .. break it up ... large functions are a menace
  function init() {
    
    var stepUp   = false;
    var stepDown = false;
    
    $("div.add input").live('keyup', addTasksHandler);
    
    shortcut.add('alt+enter', function (e) {
      if ( $('div.add input:focus').size() > 0 ) {
        addNewTaskToTop = true;
        add();
        addNewTaskToTop = false;
      }
    });
    
    // For testing purposes, to null the count, just uncomment this
    //wunderlist.settings.setInt('number_of_shown_add_task_hints', 0);
    
    var numberOfShownHints = wunderlist.settings.getInt('number_of_shown_add_task_hints', 0) + 1;
    var isShowingAgain = false;
    if (numberOfShownHints < 5) {
      $('.add_task_hint:hidden').live('click', function () {
        //alert();
      });
      $('.addwrapper input').live('focus', function () {
        if ($('.addwrapper input').val().length < 15) {
          setTimeout(function () {
            isShowingAgain = true;
            $('.add_task_hint').fadeIn('fast', function () {
              setTimeout(function () {
                isShowingAgain = false;
              }, 250);
            });
          }, 50);
        }
      });
      $('.addwrapper input').live('keyup', function () {
        if ($('.addwrapper input').val().length < 15) {
          $('.add_task_hint').fadeIn('fast');
        } else {
          $('.add_task_hint').fadeOut('fast');
        }
      });
      $('.addwrapper input').live('blur', function () {
        setTimeout(function () {
          if (!isShowingAgain) {
            $('.add_task_hint').fadeOut('fast');
          }
        }, 200);
      });
      wunderlist.settings.setInt('number_of_shown_add_task_hints', numberOfShownHints);
    }
    
    $('.addwrapper input').live('focus', function () {
      $('.addwrapper input').attr("placeholder", "");
    }).live('blur', function () {
      $('.addwrapper input').attr('placeholder', wunderlist.language.data.add_task);
    });


    $("div.add input").live('keydown', 'Esc', cancelTask);
    
    // DoubleClick on Task - Edit mode
    $('.mainlist li .description').live('dblclick', triggerEditMode);
      
    // Initiate The Datepicker when clicking an existing Date
    $('.mainlist li .showdate').live('click', selectDate);

    // Save The Task on a click elsewhere
    $('html').live('click', saveOnBlur);

    // Save edited Task
    $('#task-edit').live('keyup', saveEditedTask);

    $(".add input").live('focusout', function () {
      if($(this).val() === '') {
        wunderlist.timer.resume();
      }
    });
    
    // Do the check or uncheck a task magic
    $('.checkboxcon').live('click', toggleDoneStatus);

    // Toggle importance flag
    $("span.fav, span.favina", $("ul.mainlist")).live("click", toggleImportanceFlag);
      
      // Delete Button Mouse Over
    $("ul.mainlist li, ul.donelist li").live('mouseover', function () {
      var node = $(this);
      var description  = node.find('span.description');
      var deletebutton = node.find('span.delete');

      if(description.length === 1) {
        deletebutton.show();
      } else {
        deletebutton.hide();
      }
    }).live('mouseout', function () {
      $(this).find('.delete').hide();
    });

    // Delete function for the clicked task
    $('div.add').live('click', function() {
      $('input.input-add').focus();
    });

    // Delete function for the clicked task
    $("li span.delete").live('click', function() {
      var node = $(this);
      if (wunderlist.settings.getInt('delete_prompt', 1) === 1) {
        openTaskDeleteDialog(node);
      } else {
        deletes(node);
      }
    });
  }

  var self = {
    "datePickerOpen": false, //TODO: shared state.. REMOVE
    "init": init,
    "add": add,
    "edit": edit,
    "cancel": cancel,
    "deletes": deletes,
    "syncPositionsToDB": syncPositionsToDB,
    "updateList": updateList
  };

  return self;
})(jQuery, window, wunderlist, async, shortcut);