/** Returns the HTML structure of the login/register Dialog
 *
 * @author Daniel Marschner
 */
function generateLoginRegisterDialogHTML()
{
	html = '<p class="pl8">' + language.data.login_hint + '</p><br />' +
		'<div class="wunderlistlogo"></div>'+
		'<input class="input-login" type="text" id="login-email" name="email" placeholder="' + language.data.email + '" />' +
		'<input class="input-login" type="password" id="login-password" name="password" placeholder="' + language.data.password + '" />' +
		'<div id="account-buttons">' +
		'<input class="input-button register button-login" type="submit" id="loginsubmit" value="' + language.data.login + '" />' +
		'<input class="input-button register" type="submit" id="registersubmit" value="' + language.data.register + '" />' +
		'<input class="input-button" type="submit" id="cancelreg" value="' + language.data.no_thanks + '" />' +
		'<img id="account-loader" src="images/ajax-loader.gif" />' +
		'</div>' +
		'<p class="error"></p>' +
        '<p class="pwd"><a id="forgot-pwd" href="#" target="_blank">' + language.data.forgot_password + '</a></p>' +
		'<div class="followus"><p>' +
		'<a class="followtwitter" target="_blank" href="http://www.twitter.com/6wunderkinder"></a>' +
		'<a class="followfacebook" target="_blank" href="http://www.facebook.com/6wunderkinder"></a></p></div>';

	return html;
}

/**
 * Generates the list HTML structure
 *
 * @author Dennis Schneider
 * @author Daniel Marschner
 */
generateListContentHTML = function(list_id, list_name)
{
	var html = '';

	html += "<h1>" + unescape(list_name) + "</h1>";
	html += "<div class='add'>";
	html += "<input type='text' class='input-add' placeholder='" + language.data.add_task + "' />";
	html += "<input type='hidden' class='datepicker'/>";
	html += "</div>";
	html += "<ul id='list' rel='" + list_id + "' class='mainlist'></ul>";

	return html;
}

/**
 * Generates a task in HTML
 *
 * @author Dennis Schneider
 * @author Daniel Marschner
 */
generateTaskHTML = function(id, name, list_id, done, important, date)
{
	var favourite;

	// Is the task due today?
	if(important == 1)
		favourite = 'fav" title="'+ language.data.fav + '"';
	else
		favourite = 'favina" title="'+ language.data.favina + '"';

	if(done == 1)
		check = " done";
	else
		check = "";

	var html = "<li class='more" + check + "' rel='" + list_id + "' id='" + id + "'>";
	if(done == 1)
	{
		html += "<div class='checkboxcon checked'>";
		html += "<input tabIndex='-1' class='input-checked' type='checkbox' checked='checked' />";
	}
	else
	{
		html += "<div class='checkboxcon'>";
		html += "<input tabIndex='-1' class='input-checked' type='checkbox' />";
	}

	html += '</div>';
	html += '<span class="icon ' + favourite + '></span>';
	html += '<span class="description">' + unescape(name) + '</span>';

	if(date != '' && date != '0')
		html += '<span class="showdate timestamp" rel="' + date + '"></span>';
	else
		html += '<span class="showdate"></span>';

	html += '<span class="icon delete" title="' + language.data.delete_task + '"></span>';
	html += '</li>';

	return html;
}

/**
 * Returns the HTML structure of a new list (SIDEBAR)
 *
 * @author Daniel Marschner
 */
function generateNewListElementHTML(listId, listElementName, listElementInputClass)
{
	if(listId == undefined || listId == '')
		listId = 'x';

	if(listElementName == undefined || listElementName == '')
		listElementName = language.data.new_list;

	if(listElementInputClass == undefined || listElementInputClass == '')
		listElementInputClass = 'input-list';

	var html  = "<a id='" + listId + "' class='list sortablelist'>";
    	html += "<span>0</span>";
    	html += "<div class='deletep'></div>";
    	html += "<div class='editp'></div>";
    	html += "<div class='savep'></div>";
    	html += "<input class='" + listElementInputClass + "' maxlength='50' type='text' value='" + listElementName + "' />";
    	html += "</a>";

	return html;
}

/**
 * Returns the HTML structure for the credits dialog
 *
 * @author Daniel Marschner
 */
function generateCreditsDialogHTML()
{
	html = '<p><b>wunderlist</b> is an easy-to-use task management tool, that runs on Windows, Mac, Linux and on Apple iOS. Register for free to sync your todos online. No matter where you are, your wunderlists follows you.<br /><br />' +
		'<b>What´s next?</b><br><br>' +
		'We are currently working on something pretty big. We call it <b>wunderkit</b>, an online business platform that will change the way you look at corporate software products.<br /><br />' +
		'We hope you enjoy our first tool to make your daily life more effective and enjoyable.<br /><br /></p>' +

		'<p class="logo"><img src="images/logo.png"></p>';

		return html;
}

function generateBackgroundsDialogHTML() {
	html =  '<a href="http://downloads.dvq.co.nz" target="_blank">Handcrafted Wood Texture</a><br/>' +
			'<a href="http://blog.artcore-illustrations.de" target="_blank">Balloon Monster</a><br/>' +
			'<a href="http://www.galaxygui.com/" target="_blank">Dark Wood Texture</a></p>';
	return html;
}

function generateSwitchDateFormatHTML() {
	html =  '<div id="date-format-radios" class="radios"><p><input type="radio" id="date_de" name="switchDate" value="de"> <span>dd.mm.YYYY</span></p>' +
    		'<p><input type="radio" id="date_us" name="switchDate" value="us"> <span>mm/dd/YYYY</span></p>' +
       		'<p><input type="radio" id="date_en" name="switchDate" value="en"> <span>dd/mm/YYYY</span></p></div>' +
       		'<div id="week-start-day-radios" class="radios">' +
       		'<span class="ui-widget-header custom-dialog-headline">' + language.data.startday + '</span>' +
			'<p><input id="startday_1" type="radio" name="startDay" value="1" /><span>' + language.data.monday + '</span></p>' +
			'<p><input id="startday_0" type="radio" name="startDay" value="0" /><span>' + language.data.sunday + '</span></p>' +
 			'</div>' +
    		'<p><input id="cancel-dateformat" class="input-button" type="submit" value="'+ language.data.cancel +'" /> <input id="confirm-dateformat" class="input-button" type="submit" value="'+ language.data.save_changes +'" /></p>';
	return html;
}

/**
 * Returns the HTML structure for the invitation dialog
 *
 * @author Daniel Marschner
 */
function generateSocialDialogHTML()
{
	html = '<div id="invitebox"><div class="wunderlistlogo"></div>'+

		'<p class="invitefriends">' + language.data.invite + ':</p>' +
		'<textarea class="textarea-dialog" id="invite-text" maxlength="140">'+ language.data.invitetextarea +'</textarea>' +
		'<p><input class="input-login input-social" type="text" id="email" name="email" value="' + language.data.invite_email + '" />' +
		'<input id="send_invitation" class="input-button button-social" type="submit" value="send" /></p>' +


		'<p class="socialmedia"><span class="icons">' +
		'<a href="http://www.stumbleupon.com/submit/?url=' + encodeURI('http://www.6wunderkinder.com') + '" target="_blank" class="stumbleupon"></a> ' +
		'<a href="http://digg.com/submit?url=' + encodeURI('http://www.6wunderkinder.com') + '" target="_blank" class="digg"></a> ' +
		'<a href="http://twitter.com/home?status=' + encodeURI('wunderlist - http://www.6wunderkinder.com') + '" target="_blank" class="twitter"></a> ' +
		'<a href="http://www.facebook.com/sharer.php?u=' + encodeURI('http://www.6wunderkinder.com') + '&t=' + encodeURI('wunderlist') + '" target="_blank" class="facebook"></a> ' +
		'</span>' +
		language.data.invite_without_email +
		'<span>' + language.data.invite_spread_word + '</span></p></div>';

	return html;
}

/**
 * Returns the HTML structure for the edit profile dialog
 *
 * @author Daniel Marschner
 */
function generateEditProfileDialogHTML()
{
	html =
		'<p>' + language.data.edit_profile_desc + '</p>' +
		'<input class="input-normal"          type="text"     id="new_email"    name="new_email" placeholder="'+language.data.new_email_address+'" />' +
		'<input class="input-normal"          type="password" id="new_password" name="new_password" placeholder="'+language.data.new_password+'" />' +
		'<br /><p>' + language.data.edit_profile_old_pw + '</p>' +
		'<input class="input-normal"          type="password" id="old_password" name="old_password" placeholder="'+language.data.old_password+'" />' +
		'<input class="input-button register" type="submit"   id="submit_edit_profile" value="' + language.data.save_changes + '" />'+
		'<input class="input-button"          type="submit"   id="cancel_edit_profile" value="' + language.data.cancel + '" />' +

		'<span class="error"></div>';

	return html;
}

/**
 * Removes HTML Tags
 *
 * @author Dennis Schneider
 */
function strip_tags (input, allowed)
{
	allowed = (((allowed || "") + "")
		.toLowerCase()
		.match(/<[a-z][a-z0-9]*>/g) || [])
		.join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
	var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
	commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
	return input.replace(commentsAndPhpTags, '').replace(tags, function($0, $1)
	{
		return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
	});
}

/**
 * Removes HTML tags and escapes single quotes
 *
 * @author Daniel Marschner
 */
function convertStringForDB(string) {
	//string = strip_tags(string);
	string = string.split('<').join('');
	string = string.split('>').join('');
	string = string.split("'").join(escape("'"));

	return string;
}

/**
 * Validates an integer
 *
 * @author Christian Reber
 */
function isInteger(s) {
	return (s.toString().search(/^-?[0-9]+$/) == 0);
}

/**
 * Shows the date in system specific format
 *
 * @author Christian Reber
 */
function showDateByLanguage(object, day, month, year) {
	if(Titanium.App.Properties.hasProperty('dateformat') == true)
		var dateformat = Titanium.App.Properties.getString('dateformat');
	else
		var dateformat = language.code;

	// Format date by system language - germany
	if(dateformat == 'de')
	{
		$(object).html(day + '.' + month + '.' + year);
	}
	else if(dateformat == 'en')
	{
  		$(object).html(day + '/' + month + '/' + year);
	}
	// Format date by system language - english countries
	else
	{
		$(object).html(month + '/' + day + '/' + year);
	}
}

/**
 * Converts a timestamp to a real date, or a string like "today, yesterday or tomorrow"
 *
 * @author Christian Reber, Dennis Schneider
 */
function make_timestamp_to_string() {
	$('.timestamp').each(function(intIndex) {

		// Convert Timestamp to normal date
		var timestamp      = $(this).attr('rel');
		var selected_date  = new Date(timestamp * 1000);

		var day   = selected_date.getDate();
		var month = selected_date.getMonth() + 1; //January is 0!
		var year  = selected_date.getFullYear();

		if(day < 10) { day = '0' + day }
		if(month < 10) { month = '0' + month }

		var today = new Date();

		// Remove red color everytime
		$(this).removeClass('red');

		// If older then yesterday, mark red and show the date
		if(selected_date.getDate() < today.getDate() - 2 && selected_date.getMonth() <= today.getMonth()) {
			$(this).addClass('red');
			showDateByLanguage(this, day, month, year);
		}
		// If yesterday, mark red and show "yesterday"
		else if((selected_date.getDate() < today.getDate() && selected_date.getDate() > today.getDate() - 2) && selected_date.getMonth() <= today.getMonth()) {
			$(this).html(language.data.yesterday);
			$(this).addClass('red');
		}
		// or today
		else if(selected_date.getDate() == today.getDate() && selected_date.getMonth() == today.getMonth()) {
			$(this).html(language.data.today);
		}
		// or tomorrow
		else if((selected_date.getDate() > today.getDate() && selected_date.getDate() < (today.getDate() + 2)) && selected_date.getMonth() == today.getMonth()) {
			$(this).html(language.data.tomorrow);
		}
		else {
			showDateByLanguage(this, day, month, year);
		}

	});
}

/**
 * Convert the date to the beginning of the day at 00:00:00
 *
 * @author Dennis Schneider
 */
function getWorldWideDate(date)
{
    // create Date object for current location
	if(date == undefined)
    	currentLocationDate = new Date();
	else
		currentLocationDate = date;

	currentLocationDate.setMinutes(0);
	currentLocationDate.setHours(0);
    currentLocationDate.setSeconds(0);
	currentLocationDate.setMilliseconds(0);

	var offset = (currentLocationDate.getTimezoneOffset() / 60) * (-1);

    // convert to msec
    // add local time zone offset
    // get UTC time in msec
    utc = currentLocationDate.getTime() + (currentLocationDate.getTimezoneOffset() * 60000);

    // create new Date object for different city
    // using supplied offset
    timeZoneLocation = new Date(utc + (3600000 * offset));

	var timestamp = timeZoneLocation.getTime() / 1000;
	timestamp     = Math.round(timestamp);

	return timestamp;
}

/**
 * Get the the name of the month
 *
 * @author Dennis Schneider
 */
function getMonthName(month_number)
{
	var month = new Array(12);
	month[0]  = "January";
	month[1]  = "February";
	month[2]  = "March";
	month[3]  = "April";
	month[4]  = "May";
	month[5]  = "June";
	month[6]  = "July";
	month[7]  = "August";
	month[8]  = "September";
	month[9]  = "October";
	month[10] = "November";
	month[11] = "December";

	return month[month_number];
}

/**
 * Get the the name of the day
 *
 * @author Dennis Schneider
 */
function getDayName(day_number)
{
	var day = new Array(7);
	day[0] = 'Sunday';
	day[1] = 'Monday';
	day[2] = 'Tuesday';
	day[3] = 'Wednesday';
	day[4] = 'Thursday';
	day[5] = 'Friday';
	day[6] = 'Saturday';

	return day[day_number];
}

/**
 * Enhances the DatePicker
 *
 * @author Dennis Schneider
 */
function addRemoveDateButton(object)
{
	$('#ui-datepicker-div').append("<div class='remove_date'>" + language.data.no_date + "</div>");
	$('#ui-datepicker-div div.remove_date').die();
	$('#ui-datepicker-div div.remove_date').live('click', function()
	{
		object.children('.showdate').hide();
		$(".datepicker").datepicker('hide');
		object.children('input#task-edit').focus();
		object.children('.timestamp').attr('rel', '0');

        setTimeout(function() { datePickerOpen = false }, 10);
	});
}

/**
 * Creates a beautiful datepicker
 *
 * @author Marvin Labod
 */
function createDatepicker()
{
	var dayNamesEN        = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	var dayNamesMinEN     = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
	var dayNamesShortEN   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	var monthNamesEN 	  = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	var monthNamesShortEN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	var dayNamesFR        = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
	var dayNamesMinFR     = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'];
	var dayNamesShortFR   = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
	var monthNamesFR 	  = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
	var monthNamesShortFR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui', 'Jui', 'Aoû', 'Sep', 'Oct', 'Nov', 'Dec'];

	var dayNamesDE        = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
	var dayNamesMinDE 	  = ['So','Mo','Di','Mi','Do','Fr','Sa'];
	var dayNamesShortDE   = ['Son','Mon','Din','Mit','Don','Fre','Sam'];
	var monthNamesDE 	  = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
	var monthNamesShortDE = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];

	// Check for starting day of the week
	if(Titanium.App.Properties.hasProperty('weekstartday') == true)
		var firstDay = Titanium.App.Properties.getString('weekstartday', '1');
	else
	{
		if(language.code == 'de' || language.code == 'en')
			var firstDay = 1;
		else
			var firstDay = 0;

		Titanium.App.Properties.setString('weekstartday', firstDay.toString());
	}

	if(language.code == 'de')
	{
  		var dayNamesLang        = dayNamesDE;
  		var dayNamesMinLang     = dayNamesMinDE;
  		var dayNamesShortLang   = dayNamesShortDE;
  		var monthNamesLang      = monthNamesDE;
  		var monthNamesShortLang = monthNamesShortDE;
	}
	else if(language.code == 'fr')
	{
  		var dayNamesLang        = dayNamesFR;
  		var dayNamesMinLang     = dayNamesMinFR;
  		var dayNamesShortLang   = dayNamesShortFR;
  		var monthNamesLang      = monthNamesFR;
  		var monthNamesShortLang = monthNamesShortFR;
	}
	else
	{
  		var dayNamesLang        = dayNamesEN;
  		var dayNamesMinLang     = dayNamesMinEN;
  		var dayNamesShortLang   = dayNamesShortEN;
  		var monthNamesLang      = monthNamesEN;
  		var monthNamesShortLang = monthNamesShortEN;
	}

	$(".datepicker").datepicker({
		constrainInput: true,
		buttonImage: 'icons/time.png',
		buttonImageOnly: true,
		buttonText: language.data.choose_date,
		showOn: 'both',
		firstDay: parseInt(firstDay),
		dayNames: dayNamesLang,
		dayNamesMin: dayNamesMinLang,
		dayNamesShort: dayNamesShortLang,
		monthNames: monthNamesLang,
		monthNamesShort: monthNamesShortLang,
		beforeShow: function() {
			var $edit_li = $(this).parent();

			setTimeout(function() {
				var timestamp = $edit_li.children('.timestamp').attr('rel');
				if(timestamp != undefined && timestamp != 0)
				{
					var currentDate = new Date(timestamp * 1000);
					$edit_li.find('.datepicker').datepicker("setDate" , currentDate);
				}
				addRemoveDateButton($edit_li);
			}, 5);

            datePickerOpen = true;
		},
		onChangeMonthYear: function(year, month, inst) {
			var $edit_li = $(this).parent();
			setTimeout(function() {
				addRemoveDateButton($edit_li);
			}, 5);
		},
		onClose: function() {
			if($(this).parent().children("#task-edit").length == 1)
            {
				$("#task-edit").focus();

                setTimeout(function() { datePickerOpen = false }, 10);
            }
			else
				$(".input-add").focus();
		},
		onSelect: function(dateText, inst) {
            setTimeout(function() { datePickerOpen = false }, 10);

            // Get timestamp (in seconds) for database
			var date       = new Date(dateText);
			var timestamp  = getWorldWideDate(date);

			if($(this).parent().find('.input-add').length == 1)
			{
				var $date = $(".add input.datepicker").val();
				var $html = '<span class="showdate timestamp" rel="' + timestamp + '">&nbsp;</span>';
				$('.add .showdate').remove();
				$('.add .input-add').after($html);

				if($('.add .input-add').val().length > 0)
					$('.add .input-add').select();
				else
					$('.add .input-add').focus();
			}
			else
			{
				var $date = $("li input.datepicker").val();
				var $html = '<span class="showdate timestamp" rel="' + timestamp + '">&nbsp;</span>';
				$(this).parent().find('.showdate').remove();
				$('#task-edit').after($html);
				$('#task-edit').select();
			}

			make_timestamp_to_string();
		}
	});
}
