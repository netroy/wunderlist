/* global wunderlist */
wunderlist.helpers.datetime = (function(window, $, wunderlist, undefined) {


  /**
   * Shows the date in system specific format
   * @author Christian Reber
   */
  function showDateByLanguage(node, day, month, year) {
    var dateformat;
    if(wunderlist.settings.hasProperty('dateformat') === true) {
      dateformat = wunderlist.settings.getString('dateformat');
    } else {
      dateformat = wunderlist.language.code;
    }

    // Format date by system language - germany
    if(dateformat === 'de') {
      node.html(day + '.' + month + '.' + year);
    } else if(dateformat === 'en') {
      node.html(day + '/' + month + '/' + year);
    } else if(dateformat == 'us') { // Format date by system language - english countries
      node.html(month + '/' + day + '/' + year);
    } else {
      node.html(year + '/' + month + '/' + day);
    }
  }


  /**
   * Converts a timestamp to a real date, or a string like "today, yesterday or tomorrow"
   * @author Christian Reber, Dennis Schneider
   */
  function convertTimestampToString() {
    $('.timestamp').each(function(intIndex) {
      var node = $(this);
      // Convert Timestamp to normal date
      var timestamp      = node.attr('rel');
      var selected_date  = new Date(timestamp * 1000);

      var day   = selected_date.getDate();
      var month = selected_date.getMonth() + 1; //January is 0!
      var year  = selected_date.getFullYear();

      var today  = new Date();
      var tday   = today.getDate();
      var tmonth = today.getMonth() + 1; //January is 0!
      var tyear  = today.getFullYear();

      if (day < 10) {
        day = '0' + day;
      }

      if (month < 10) {
        month = '0' + month;
      }

      // Remove red color everytime
      node.removeClass('red');
      
      // If older then yesterday, mark red and show the date
      if((day < (tday - 1) && month == tmonth && year == tyear) || (month < tmonth && year == tyear) || (year < tyear)) {
        node.addClass('red');
        showDateByLanguage(node, day, month, year);
      }
      // If yesterday, mark red and show "yesterday"
      else if((day < tday && day > tday - 2) && month == tmonth && year == tyear) {
        node.addClass('red');
        node.html(wunderlist.language.data.yesterday);
      }
      // or today
      else if(day == tday && month == tmonth && year == tyear) {
        node.html(wunderlist.language.data.today);
      }
      // or tomorrow
      else if((day > tday && day < (tday + 2)) && month == tmonth && year == tyear) {
        node.html(wunderlist.language.data.tomorrow);
      } else {
        showDateByLanguage(node, day, month, year);
      }
    });
  }


  var monthsArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var monthsMap = {};
  for(var i = 0, l = monthsArray.length; i < l; i++) {
    monthsMap[monthsArray[i]] = i;
  }

  /**
   * Get the the name of the month
   * @author Dennis Schneider
   */
  function getMonthName(monthNumber) {
    return monthsArray[monthNumber];
  }


  /**
   * Get the month number by the given month name
   * @author Dennis Schneider
   */
  function getMonthNumber(monthName) {
      return monthsMap[monthName];
  }


  /**
   * Get the the name of the day
   * @author Dennis Schneider
   */
  var daysArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function getDayName(dayNumber) {
    return daysArray[dayNumber];
  }


  /**
   * Handle clicks on the date picker
   */
  function handleDatePicker(e) {
    var node = $(e.currentTarget);
    if (node.hasClass('add') !== true){
      node.children('.ui-datepicker-trigger').remove();
      node.children('input.datepicker').remove();
      node.children('span.showdate').remove();
      node.children('span.description').after("<input type='hidden' class='datepicker'/>");

      createDatepicker();
      
      node.children('span.timestamp').attr('rel', '0');
      
      if ($('a#later').hasClass('active') || $('a#someday').hasClass('active') ||
          $('a#thisweek').hasClass('active') || $('a#tomorrow').hasClass('active') ||
          $('a#today').hasClass('active')) {
        // Store the parent, before removing the element
        var parentList = node.parent();
        
        // Remove the object from the filter list
        node.remove();
        
        // If the parent list now is empty, remove it and it's headline
        if (parentList.children('li').size() < 1 ) {
          parentList.prev().remove();
          parentList.remove();
        }
        
        // If the view is not empty, reload it
        if ($('#content li').size() < 1) {
          if ($('a#later').hasClass('active') || $('a#someday').hasClass('active') ||
              $('a#thisweek').hasClass('active')) {
            setTimeout(function () {
              $('#bottombar #left a.filter.active').trigger('click');
            }, 250);
          }
        }
      }
    } else {
      $('#add-input-date').fadeOut(250, function () {
        $('div.addwrapper').animate({ right: '15px' }, 300);
        node.children('div.addwrapper').children('span.showdate').remove();
      });
      
      var adder = $('.add .input-add');
      if(adder.val().length > 0) {
        adder.select();
      } else {
        adder.focus();
      }
    }
    
    $('#ui-datepicker-div').hide();
    
    if (node.hasClass('add') !== true) {
      wunderlist.helpers.task.set({
        id: node.attr('id'),
        date: 0
      }).update();
    }

    setTimeout(function() {
      wunderlist.frontend.tasks.datePickerOpen = false;
    }, 10);
  }


  /**
   * Enhances the DatePicker
   * @author Dennis Schneider
   */
  function addRemoveDateButton() {
    var datePicker = $('#ui-datepicker-div');
    $('div.remove_date', datePicker).remove();
    datePicker.append("<div class='remove_date'>" + wunderlist.language.data.no_date + "</div>");
    $('div.remove_date', datePicker).die().live('click', handleDatePicker);
  }


  function beforeShow() {
    var $edit_li = $(this).parent();

    setTimeout(function() {
      var timestamp = $edit_li.children('.timestamp').attr('rel');
      if (timestamp !== undefined && timestamp !== 0) {
        var currentDate = new Date(timestamp * 1000);
        $edit_li.find('.datepicker').datepicker("setDate" , currentDate);
      }
      addRemoveDateButton($edit_li);
    }, 5);

    wunderlist.frontend.tasks.datePickerOpen = true;
  }

  function onChangeMonthYear(year, month, inst) {
    var $edit_li = $(this).parent();
    setTimeout(function() {
      addRemoveDateButton($edit_li);
    }, 5);
  }

  function onClose() {
    // nothing here todo
  }

  function onSelect(dateText, inst) {
    setTimeout(function() {
      datePickerOpen = false;
    }, 10);

    // Get timestamp (in seconds) for database
    var date       = new Date(dateText);
    var timestamp  = getWorldWideDate(date);

    var node = $(this), parent = node.parent(), $date, $html;
    if (parent.find('.input-add').length == 1) {
      $date = $(".add input.datepicker").val();
      $html = '<span id="add-input-date" style="display:none;" class="showdate timestamp" rel="' + timestamp + '">&nbsp;</span>';
      $('.add .showdate').remove();

      var adder = $('.add .input-add');
      adder.after($html);

      if(adder.val().length > 0) {
        adder.select();
      } else {
        adder.focus();
      }

      if ($('div.addwrapper').css('right') !== '90px') {
        $('div.addwrapper').animate({
          right: '90px'
        }, 250, function () {
          $('#add-input-date').fadeIn(250);
        });
      } else {
        $('#add-input-date').show();
      }
    } else {
      $date = $("li input.datepicker").val();
      $html = '<span class="showdate timestamp" rel="' + timestamp + '">&nbsp;</span>';
      parent.find('img.ui-datepicker-trigger').remove();
      
      if (parent.find('.showdate').length === 0) {
        parent.find('.description').after($html);
      } else {
        parent.find('.showdate').attr("rel", timestamp);
        parent.find('.datepicker').hide();
      }
      
      wunderlist.helpers.task.set({
        id: $(this).parent().attr("id"),
        date: $(this).parent().find('span.timestamp').attr('rel')
      }).update();
        
      
      if ($('a#withoutdate').hasClass('active')) {
        var parentList = $(this).parent().parent();
        $(this).parent().remove();
        if ($(parentList).children('li').size() < 1) {
          $(parentList).prev().remove();
          $(parentList).remove();
        }
      }
        
      if ($('a#later').hasClass('active') || $('a#someday').hasClass('active') || $('a#thisweek').hasClass('active') || $('a#tomorrow').hasClass('active') || $('a#today').hasClass('active')) {
        var oldTimestamp = $(this).parent().find('span.timestamp').html();
        var timestampElement = $(this).parent().find('span.timestamp');
        setTimeout(function() {
          var newTimestamp = $(timestampElement).html();
          var parentList = $(timestampElement).parent().parent();
          if (oldTimestamp !== newTimestamp) {
            if ($('a#tomorrow').hasClass('active') || $('a#today').hasClass('active')) {
              $(timestampElement).parent().remove();
            } else if ($('a#later').hasClass('active') || $('a#someday').hasClass('active') || $('a#thisweek').hasClass('active')) {
              $('#bottombar #left a.filter.active').trigger('click');
            }
          }
          // If the parent list now is empty, remove it and it's headline
          if ( $(parentList).children('li').size() < 1 ) {
            $(parentList).prev().remove();
            $(parentList).remove();
          }
        }, 250);
      }
    }

    convertTimestampToString();
  }


  /**
   * Creates a beautiful datepicker
   * @author Marvin Labod
   */
  function createDatepicker() {
    var dayNamesEN        = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var dayNamesMinEN     = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    var dayNamesShortEN   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var monthNamesEN      = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var monthNamesShortEN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    var dayNamesFR        = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    var dayNamesMinFR     = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'];
    var dayNamesShortFR   = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    var monthNamesFR      = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    var monthNamesShortFR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui', 'Jui', 'Aoû', 'Sep', 'Oct', 'Nov', 'Dec'];

    var dayNamesDE        = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
    var dayNamesMinDE     = ['So','Mo','Di','Mi','Do','Fr','Sa'];
    var dayNamesShortDE   = ['Son','Mon','Din','Mit','Don','Fre','Sam'];
    var monthNamesDE      = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
    var monthNamesShortDE = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];

    // Check for starting day of the week
    var firstDay;
    if (wunderlist.settings.hasProperty('weekstartday') === true) {
      firstDay = wunderlist.settings.getString('weekstartday', '1');
    } else {
      if (wunderlist.language.code === 'de' || wunderlist.language.code === 'en') {
        firstDay = 1;
      } else {
        firstDay = 0;
      }
      wunderlist.settings.setString('weekstartday', firstDay);
    }

    var dayNamesLang, dayNamesMinLang, dayNamesShortLang, monthNamesLang, monthNamesShortLang;
    if (wunderlist.language.code === 'de') {
        dayNamesLang        = dayNamesDE;
        dayNamesMinLang     = dayNamesMinDE;
        dayNamesShortLang   = dayNamesShortDE;
        monthNamesLang      = monthNamesDE;
        monthNamesShortLang = monthNamesShortDE;
    } else if (wunderlist.language.code === 'fr') {
        dayNamesLang        = dayNamesFR;
        dayNamesMinLang     = dayNamesMinFR;
        dayNamesShortLang   = dayNamesShortFR;
        monthNamesLang      = monthNamesFR;
        monthNamesShortLang = monthNamesShortFR;
    } else {
        dayNamesLang        = dayNamesEN;
        dayNamesMinLang     = dayNamesMinEN;
        dayNamesShortLang   = dayNamesShortEN;
        monthNamesLang      = monthNamesEN;
        monthNamesShortLang = monthNamesShortEN;
    }

    $(".datepicker").datepicker({
      "constrainInput": true,
      "buttonImage": '/images/icons/time.png',
      "buttonImageOnly": true,
      "buttonText": '',
      "showOn": 'both',
      "firstDay": parseInt(firstDay, 10),
      "dayNames": dayNamesLang,
      "dayNamesMin": dayNamesMinLang,
      "dayNamesShort": dayNamesShortLang,
      "monthNames": monthNamesLang,
      "monthNamesShort": monthNamesShortLang,
      "beforeShow": beforeShow,
      "onChangeMonthYear": onChangeMonthYear,
      "onClose": onClose,
      "onSelect": onSelect
    });
  }


  /**
   * Calculates the difference between the current and the given date
   * returns difference between the two dates as number of days
   * @author Dennis Schneider
   */
  function calculateDayDifference(done) {
    var today         = new Date();
    var one_day       = 86400; // One day in seconds
    var unceiled_days = ((today.getTime() / 1000) - done) / (one_day);

    if (unceiled_days > 1){
      return Math.floor(unceiled_days);
    } else {
      return 0;
    }
  }


  /**
   * Convert the date to the beginning of the day at 00:00:00
   * @author Dennis Schneider
   */
  function getWorldWideDate(currentLocationDate) {
    if(!(currentLocationDate instanceof Date)){
      currentLocationDate = new Date();
    }
    currentLocationDate.setMinutes(0);
    currentLocationDate.setHours(0);
    currentLocationDate.setSeconds(0);
    currentLocationDate.setMilliseconds(0);

    var offset = (currentLocationDate.getTimezoneOffset() / 60) * (-1);

    // convert to msec
    // add local time zone offset
    // get UTC time in msec
    var utc = currentLocationDate.getTime() + (currentLocationDate.getTimezoneOffset() * 60000);

    // create new Date object for different city
    // using supplied offset
    var timeZoneLocation = new Date(utc + (3600000 * offset));
    var timestamp = timeZoneLocation.getTime() / 1000;
    
    return Math.round(timestamp);
  }


  /**
   * Generates the HTML structure for the date format dialog
   * @author Dennis Schneider
   */
  function generateSwitchDateFormatHTML() {
    var html_code =  '<div id="date-format-radios" class="radios"><p><input type="radio" id="date_de" name="switchDate" value="de"> <span>dd.mm.YYYY</span></p>' +
          '<p><input type="radio" id="date_us" name="switchDate" value="us"> <span>mm/dd/YYYY</span></p>' +
            '<p><input type="radio" id="date_en" name="switchDate" value="en"> <span>dd/mm/YYYY</span></p>' +
            '<p><input type="radio" id="date_iso" name="switchDate" value="iso"> <span>YYYY/mm/dd</span></p></div>' +
            '<div id="week-start-day-radios" class="radios">' +
            '<span class="custom-dialog-headline">' + wunderlist.language.data.startday + '</span>' +
        '<p><input id="startday_1" type="radio" name="startDay" value="1" /> <span>' + wunderlist.language.data.monday + '</span></p>' +
        '<p><input id="startday_6" type="radio" name="startDay" value="6" /> <span>' + wunderlist.language.data.saturday + '</span></p>' +
        '<p><input id="startday_0" type="radio" name="startDay" value="0" /> <span>' + wunderlist.language.data.sunday + '</span></p>' +
        '</div>' +
          '<p class="clearfix"><input id="cancel-dateformat" class="input-button" type="submit" value="'+ wunderlist.language.data.cancel +'" /> <input id="confirm-dateformat" class="input-button" type="submit" value="'+ wunderlist.language.data.save_changes +'" /></p>';
    return html_code;
  }



  return {
    "getMonthName": getMonthName,
    "getMonthNumber": getMonthNumber,
    "getDayName": getDayName,
    "createDatepicker": createDatepicker,
    "convertTimestampToString": convertTimestampToString,
    "calculateDayDifference": calculateDayDifference,
    "getWorldWideDate": getWorldWideDate,
    "generateSwitchDateFormatHTML": generateSwitchDateFormatHTML
  };

})(window, jQuery, wunderlist);




