var html = html || {};

/**
 * Generates the HTML structure for the settings dialog
 *
 * @author Marvin Labod
 */
html.generateNotesDialogHTML = function() {
    var html_code = '<div class="notes_buffer">' +
			'<textarea></textarea><div class="savednote"><div class="inner"></div></div>' +
			'</div>' +
    		'<div class="notes_buttons">' +
    			'<span class="hint">'+ wunderlist.ucfirst(settings.shortcutkey) +' + '+ wunderlist.language.data.return_key +': ' + wunderlist.language.data.save_and_close_changes +'</span>' +
    			'<input id="save-and-close" class="input-button button-login" type="submit" value="'+ wunderlist.language.data.save_and_close_changes +'" />' +
    			'<input id="save-note" class="input-button" type="submit" value="'+ wunderlist.language.data.edit_changes +'" />' +
    		'</div>';

	return html_code;
};

/**
 * Returns the HTML structure of the login/register Dialog
 *
 * @author Marvin Labod
 */
html.generateShareListDialogHTML = function(list_id) {
	var html_code =  '<p>' + wunderlist.language.data.sharelist_info +'</p>' +
			'<p class="small"><b>' + wunderlist.language.data.sharelist_hint + '</b>: ' + wunderlist.language.data.sharelist_hint_text + '</p>' +
			'<input type="hidden" id="share-list-id" rel="'+ list_id +'" />' +
			'<p class="clearfix"><input class="input-login input-sharelist" type="text" id="share-list-email" name="email" placeholder="' + wunderlist.language.data.invite_email + ',' + wunderlist.language.data.invite_email + '..." />' +
			'<input id="send_share_invitation" class="input-button button-social" type="submit" value="'+ wunderlist.language.data.sharelist_button +'" /></p></div>' +
			'<ul class="sharelistusers"></ul><br/>';

	return html_code;
};

/**
 * Returns the HTML structure of the login/register Dialog
 *
 * @author Daniel Marschner
 */
html.generateLoginRegisterDialogHTML = function() {
	var html_code = '<h1>Wunderlist</h1>' +
		'<div class="wunderlistlogo"><img src="/images/iosicon.png" alt="Wunderlist Icon"/></div>' +
		
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
		'</div>' +
		
		// SITE ELEMENTS
		
		'<div class="wkdownload">' +
		'<a class="iphone" href="http://itunes.apple.com/us/app/wunderlist-to-do-listen/id406644151">Download for iPhone</a>' +
		'<a class="ipad" href="http://itunes.apple.com/us/app/wunderlist-hd/id420670429">Download for iPad</a>' +
		'<a class="android" href="https://market.android.com/details?id=com.wunderkinder.wunderlistandroid">Download for Android</a>';
		
		// TODO: If we launch a linux version we have to optimize that
		if (settings.os === 'darwin')
			html_code += '<a class="windows" href="http://www.6wunderkinder.com/downloads/wunderlist-1.2.2-win.msi">Download for Windows</a>';
		else
			html_code += '<a class="mac" href="http://itunes.apple.com/app/wunderlist/id410628904?mt=12&ls=1">Download for Mac OSX</a>';		
		
		html_code += '</div>' +
		'<div class="wklogo">6W</div>' +
		'<div class="wkseparator"></div>' +
		'<div class="followus"><p>'+
		'<a class="followtwitter" target="_blank" href="http://www.twitter.com/6wunderkinder">Follow us on Twitter</a>' +
		'<a class="followfacebook" target="_blank" href="http://www.facebook.com/6wunderkinder">Follow Us on Facebook</a></p>' +
		'<a href="http://www.6wunderkinder.com" class="wklogowhite">6Wunderkinder</a>' +
		'</div>';

	return html_code;
};

/**
 * Generates the list HTML structure
 *
 * @author Dennis Schneider
 * @author Daniel Marschner
 */
html.generateListContentHTML = function(list_id, list_name) {
	var html_code = '';

	if(list_id != 1 && wunderlist.account.isLoggedIn() == true)
		html_code += "<div id='listfunctions'><a rel='" + wunderlist.language.data.print_tasks + "' class='list-print'></a><a rel='" + wunderlist.language.data.send_by_mail + "' class='list-email'></a><a rel='" + wunderlist.language.data.share_with_cloud + "' class='list-cloud'></a><div id='cloudtip'><span class='triangle'></span><span class='copy'>" + wunderlist.language.data.copy_link + "</span><span class='link'></span></div></div>";
	else
		html_code += "<div id='listfunctions'><a rel='" + wunderlist.language.data.print_tasks + "' class='list-print'></a><a rel='" + wunderlist.language.data.send_by_mail + "' class='list-email'></a><a rel='" + wunderlist.language.data.share_with_cloud + "' class='list-cloud'></a><div id='cloudtip'><span class='triangle'></span><span class='copy'>" + wunderlist.language.data.copy_link + "</span><span class='link'></span></div></div>";
	
	html_code += "<h1>" + unescape(list_name) + "</h1>";
	html_code += "<div class='add'>";
	html_code += "<div class='addwrapper'><input type='text' class='input-add' placeholder='" + wunderlist.language.data.add_task + "' /></div>";
	html_code += "<input type='hidden' class='datepicker'/>";
	html_code += "</div>";
	html_code += "<ul id='list' rel='" + list_id + "' class='mainlist sortable'></ul>";

	return html_code;
};

/**
 * Generates a task in HTML
 *
 * @author Dennis Schneider
 * @author Daniel Marschner
 */
html.generateTaskHTML = function(id, name, list_id, done, important, date, note) {
	var taskHTML = "<li class='more" + (done == 1 ? " done" : "") + "' rel='" + list_id + "' id='" + id + "'>";
	
	if (done == 1)
	{
		taskHTML += "<div class='checkboxcon checked'>";
		taskHTML += "<input tabIndex='-1' class='input-checked' type='checkbox' checked='checked' />";
	}
	else
	{
		taskHTML += "<div class='checkboxcon'>";
		taskHTML += "<input tabIndex='-1' class='input-checked' type='checkbox' />";
	}
	
    var unescapedName = unescape(name);
    var name          = wunderlist.replace_links(wunderlist.strip_tags(unescape(name)));
    
    if (name == '')
         name = wunderlist.language.data.new_task;

	taskHTML += '</div>';
	taskHTML += '<span class="icon ' + (important == 1 ? 'fav' : 'favina') + '"></span>';
	taskHTML += '<span class="description">' + name + '</span>';

	if (date != '' && date != '0')
		taskHTML += '<span class="showdate timestamp" rel="' + date + '"></span>';
	else
		taskHTML += '<input type="hidden" class="datepicker" value="0"/>';
	
	taskHTML += '<span class="icon delete"></span>';

	if (note != '' && note != undefined)
		taskHTML += '<span class="icon note activenote">' + note + '</span>';
	else
		taskHTML += '<span class="icon note"></span>';
	
	taskHTML += '</li>';

	return taskHTML;
};

/**
 * Returns the HTML structure of a new list (SIDEBAR)
 *
 * @author Daniel Marschner
 */
html.generateNewListElementHTML = function(listId, listElementName, listElementInputClass) {
	if(listId == undefined || listId == '')
		listId = 'x';

	if(listElementName == undefined || listElementName == '')
		listElementName = wunderlist.language.data.new_list;

	if(listElementInputClass == undefined || listElementInputClass == '')
		listElementInputClass = 'input-list';

	var html_code  = "<a id='" + listId + "' class='list sortablelist'>";
    	html_code += "<span>0</span>";
    	html_code += "<div class='deletep'></div>";
    	html_code += "<div class='savep'></div>";
    	html_code += "<div class='editp'></div>";
    	html_code += "<input class='" + listElementInputClass + "' maxlength='255' type='text' value='" + wunderlist.database.convertString(listElementName) + "' />";
    	html_code += "</a>";

	return html_code;
};

/**
 * Returns the HTML structure for the credits dialog
 *
 * @author Daniel Marschner
 */
html.generateCreditsDialogHTML = function() {
	var html_code = '<p><b>Wunderlist</b> is an easy-to-use task management tool, that runs on Windows, Mac, Linux and on Apple iOS. Register for free to sync your todos online. No matter where you are, your Wunderlist follows you.<br /><br />' +
		'<b>What´s next?</b><br><br>' +
		'We are currently working on something pretty big. We call it <b>Wunderkit</b>, an online business platform that will change the way you look at corporate software products.<br /><br />' +
		'We hope you enjoy our first tool to make your daily life more effective and enjoyable.<br><br>' + 
		'<strong>Wunderlist</strong> - ' + Titanium.App.version + '</p>';

		return html_code;
};

/**
 * Generate the HTML structure for the backgrounds dialog
 *
 * @author Daniel Marschner
 */
html.generateBackgroundsDialogHTML = function() {
	var html_code =  '<p>&raquo; <a href="http://downloads.dvq.co.nz" target="_blank">Handcrafted Wood Texture</a> (DVQ)<br/>' +
			'&raquo; <a href="http://blog.artcore-illustrations.de" target="_blank">Balloon Monster</a> (Artcore Illustrations)<br/>' +
			'&raquo; <a href="http://www.galaxygui.com/" target="_blank">Dark Wood Texture</a> (Galaxgui)</p>';
	return html_code;
};

/**
 * Generates the HTML structure for the sidebar dialog
 *
 * @author Dennis Schneider
 */
html.generateSidebarHTML = function() {
    var html_code = '<div id="sidebar-position-radios" class="radios">' +
			'<p><b>' + wunderlist.language.data.sidebar_position_text + '</b></p>' +
			'<p><label><input id="sidebar_position_1" type="radio" name="sidebarPosition" value="1" /> <span>' + wunderlist.language.data.left + '</span></label> &nbsp; &nbsp; &nbsp; <label><input id="sidebar_position_0" type="radio" name="sidebarPosition" value="0" /> <span>' + wunderlist.language.data.right + '</span></label></p>' +
 			'</div>' +
    		'<p class="clearfix"><input id="cancel-settings" class="input-button" type="submit" value="'+ wunderlist.language.data.cancel +'" /> <input id="confirm-settings" class="input-button" type="submit" value="'+ wunderlist.language.data.save_changes +'" /></p></div>';
    		
	return html_code;
};

/**
 * Generates the HTML structure for the delete prompt dialog
 *
 * @author Dennis Schneider
 */
html.generateDeletePromptHTML = function() {
    var html_code = '<div id="task-delete-radios" class="radios">' +
       		'<p><b>' + wunderlist.language.data.delete_task_prompt + '</b></p>' +
			'<p><input id="task_delete_1" type="radio" name="taskDelete" value="1" /> <span>' + wunderlist.language.data.yes + '</span> &nbsp; &nbsp; &nbsp; <input id="task_delete_0" type="radio" name="taskDelete" value="0" /> <span>' + wunderlist.language.data.no + '</span></p>' +
 			'</div>' +
    		'<p class="clearfix"><input id="cancel-settings" class="input-button" type="submit" value="'+ wunderlist.language.data.cancel +'" /> <input id="confirm-settings" class="input-button" type="submit" value="'+ wunderlist.language.data.save_changes +'" /></p></div>';
    		
	return html_code;
};

/**
 * Generates the HTML structure for the add item method dialog
 *
 * @author Daniel Marschner
 */
html.generateAddItemMethodHTML = function() {
    var html_code = '<div id="add-item-method-radios" class="radios">' +
       		'<p><b>' + wunderlist.language.data.add_item_method_content + '</b></p>' +
			'<p><input id="add_item_method_0" type="radio" name="addItemMethod" value="0" /> <span>' + wunderlist.language.data.return_key + '</span> &nbsp; &nbsp; &nbsp; <input id="add_item_method_1" type="radio" name="addItemMethod" value="1" /> <span>' + wunderlist.ucfirst(settings.shortcutkey) + ' + ' + wunderlist.language.data.return_key + '</span></p>' +
 			'</div>' +
    		'<p class="clearfix"><input id="cancel-settings" class="input-button" type="submit" value="'+ wunderlist.language.data.cancel +'" /> <input id="confirm-settings" class="input-button" type="submit" value="'+ wunderlist.language.data.save_changes +'" /></p></div>';
    		
	return html_code;
};

/**
 * Generates the HTML structure for the date format dialog
 *
 * @author Dennis Schneider
 */
html.generateSwitchDateFormatHTML = function() {
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
};

/**
 * Returns the HTML structure for the invitation dialog
 *
 * @author Daniel Marschner
 */
html.generateSocialDialogHTML = function() {
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
};

/**
 * Returns the HTML structure for the edit profile dialog
 *
 * @author Daniel Marschner
 */
html.generateEditProfileDialogHTML = function() {
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
};

/**
 * Shows the date in system specific format
 *
 * @author Christian Reber
 */
html.showDateByLanguage = function(object, day, month, year) {
	if(Titanium.App.Properties.hasProperty('dateformat') == true)
		var dateformat = Titanium.App.Properties.getString('dateformat');
	else
		var dateformat = wunderlist.language.code;

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
	else if(dateformat == 'us')
	{
		$(object).html(month + '/' + day + '/' + year);
	}
	else
	{
		$(object).html(year + '/' + month + '/' + day);
	}
};

/**
 * Converts a timestamp to a real date, or a string like "today, yesterday or tomorrow"
 *
 * @author Christian Reber, Dennis Schneider
 */
html.make_timestamp_to_string = function() {
	$('.timestamp').each(function(intIndex) {

		// Convert Timestamp to normal date
		var timestamp      = $(this).attr('rel');
		var selected_date  = new Date(timestamp * 1000);

		var day   = selected_date.getDate();
		var month = selected_date.getMonth() + 1; //January is 0!
		var year  = selected_date.getFullYear();

		var today  = new Date();
		var tday   = today.getDate();
		var tmonth = today.getMonth() + 1; //January is 0!
		var tyear  = today.getFullYear();

		if (day < 10) {day = '0' + day}
		if (month < 10) {month = '0' + month}

		// Remove red color everytime
		$(this).removeClass('red');	
		
		// If older then yesterday, mark red and show the date
		if((day < (tday - 1) && month == tmonth && year == tyear) || (month < tmonth && year == tyear) || (year < tyear)) 
		{
			$(this).addClass('red');
			html.showDateByLanguage(this, day, month, year);
		}
		// If yesterday, mark red and show "yesterday"
		else if((day < tday && day > tday - 2) && month == tmonth && year == tyear) 
		{
			$(this).addClass('red');
			$(this).html(wunderlist.language.data.yesterday);
		}
		// or today
		else if(day == tday && month == tmonth && year == tyear) 
		{
			$(this).html(wunderlist.language.data.today);
		}
		// or tomorrow
		else if((day > tday && day < (tday + 2)) && month == tmonth && year == tyear) 
		{
			$(this).html(wunderlist.language.data.tomorrow);
		}
		else 
		{
			html.showDateByLanguage(this, day, month, year);
		}

	});
};

/**
 * Convert the date to the beginning of the day at 00:00:00
 *
 * @author Dennis Schneider
 */
html.getWorldWideDate = function(date) {
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
};

/**
 * Get the the name of the month
 *
 * @author Dennis Schneider
 */
html.getMonthName = function(month_number) {
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
};

/**
 * Get the month number by the given month name
 *
 * @author Dennis Schneider
 */
html.getMonthNumber = function(monthName) {
    var monthNames = {
        "January" : 0, 
        "February" : 1, 
        "March" : 2, 
        "April" : 3, 
        "May" : 4, 
        "June" : 5,
        "July" : 6, 
        "August" : 7, 
        "September" : 8, 
        "October" : 9, 
        "November" : 10, 
        "December" : 11
    };
    
    return monthNames[monthName];
};

/**
 * Get the the name of the day
 *
 * @author Dennis Schneider
 */
html.getDayName = function(day_number) {
	var day = new Array(7);
	day[0] = 'Sunday';
	day[1] = 'Monday';
	day[2] = 'Tuesday';
	day[3] = 'Wednesday';
	day[4] = 'Thursday';
	day[5] = 'Friday';
	day[6] = 'Saturday';

	return day[day_number];
};

/**
 * Enhances the DatePicker
 *
 * @author Dennis Schneider
 */
html.addRemoveDateButton = function(object) {
	$('#ui-datepicker-div div.remove_date').remove();
	$('#ui-datepicker-div').append("<div class='remove_date'>" + wunderlist.language.data.no_date + "</div>");
	$('#ui-datepicker-div div.remove_date').die();
	$('#ui-datepicker-div div.remove_date').live('click', function() {	
		if (object.hasClass('add') != true)
		{
			object.children('.ui-datepicker-trigger').remove();
			object.children('input.datepicker').remove();
			object.children('span.showdate').remove();
			object.children('span.description').after("<input type='hidden' class='datepicker'/>");
			html.createDatepicker();
			
			object.children('span.timestamp').attr('rel', '0');
			
			if ($('a#later').hasClass('active') || $('a#someday').hasClass('active') || $('a#thisweek').hasClass('active') || $('a#tomorrow').hasClass('active') || $('a#today').hasClass('active')) {
				// Store the parent, before removing the element
				var parentList = $(object).parent();
				
				// Remove the object from the filter list
				$(object).remove();
				
				// If the parent list now is empty, remove it and it's headline
				if ( $(parentList).children('li').size() < 1 ) {
					$(parentList).prev().remove();
					$(parentList).remove();
				}
				
				// If the view is not empty, reload it
				if ($('#content li').size() < 1) {
					if ($('a#later').hasClass('active') || $('a#someday').hasClass('active') || $('a#thisweek').hasClass('active')) {
						setTimeout(function () {
							$('#bottombar #left a.filter.active').trigger('click');
						}, 250);
					}
				}
			}
		}
		else
		{
			$('#add-input-date').fadeOut(250, function () {
				$('div.addwrapper').animate({ right: '15px' }, 300);
				object.children('div.addwrapper').children('span.showdate').remove();
			});
			
			if($('.add .input-add').val().length > 0) {
				$('.add .input-add').select();
			} else {
				$('.add .input-add').focus();
			}
		}
		
		$('#ui-datepicker-div').hide();
		
		if (object.hasClass('add') != true)
		{
			task.id   = object.attr('id');
			task.date = 0;
			task.update();
		}

        setTimeout(function() {datePickerOpen = false}, 10);
	});
};

/**
 * Creates a beautiful datepicker
 *
 * @author Marvin Labod
 */
html.createDatepicker = function() {
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
	if (Titanium.App.Properties.hasProperty('weekstartday') == true)
	{
		var firstDay = Titanium.App.Properties.getString('weekstartday', '1');
	}
	else
	{
		if (wunderlist.language.code == 'de' || wunderlist.language.code == 'en')
		{
			var firstDay = 1;
		}
		else
		{
			var firstDay = 0;
		}

		Titanium.App.Properties.setString('weekstartday', firstDay.toString());
	}

	if (wunderlist.language.code == 'de')
	{
  		var dayNamesLang        = dayNamesDE;
  		var dayNamesMinLang     = dayNamesMinDE;
  		var dayNamesShortLang   = dayNamesShortDE;
  		var monthNamesLang      = monthNamesDE;
  		var monthNamesShortLang = monthNamesShortDE;
	}
	else if (wunderlist.language.code == 'fr')
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
		buttonText: '',
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
				if (timestamp != undefined && timestamp != 0)
				{
					var currentDate = new Date(timestamp * 1000);
					$edit_li.find('.datepicker').datepicker("setDate" , currentDate);
				}
				html.addRemoveDateButton($edit_li);
			}, 5);

            tasks.datePickerOpen = true;
		},
		onChangeMonthYear: function(year, month, inst) {
			var $edit_li = $(this).parent();
			setTimeout(function() {
				html.addRemoveDateButton($edit_li);
			}, 5);	
		},
		onClose: function() {
			// nothing here todo
		},
		onSelect: function(dateText, inst) {
            setTimeout(function() {datePickerOpen = false}, 10);

            // Get timestamp (in seconds) for database
			var date       = new Date(dateText);
			var timestamp  = html.getWorldWideDate(date);

			if ($(this).parent().find('.input-add').length == 1)
			{
				var $date = $(".add input.datepicker").val();
				var $html = '<span id="add-input-date" style="display:none;" class="showdate timestamp" rel="' + timestamp + '">&nbsp;</span>';
				$('.add .showdate').remove();
				$('.add .input-add').after($html);

				if($('.add .input-add').val().length > 0)
					$('.add .input-add').select();
				else
					$('.add .input-add').focus();
				
				if ($('div.addwrapper').css('right') !== '90px') {
					$('div.addwrapper').animate({
						right: '90px'
					}, 250, function () {
						$('#add-input-date').fadeIn(250);
					});
				} else {
					$('#add-input-date').show();
				}
			}
			else
			{
				var $date = $("li input.datepicker").val();
				var $html = '<span class="showdate timestamp" rel="' + timestamp + '">&nbsp;</span>';
				$(this).parent().find('img.ui-datepicker-trigger').remove();
				
				if ($(this).parent().find('.showdate').length == 0)
					$(this).parent().find('.description').after($html);				
				else
				{
					$(this).parent().find('.showdate').attr("rel", timestamp);
					$(this).parent().find('.datepicker').hide();
				}
				
				task.id   = $(this).parent().attr("id");
				task.date = $(this).parent().find('span.timestamp').attr('rel');
				task.update();
					
				
				if ($('a#withoutdate').hasClass('active')) {
					var parentList = $(this).parent().parent();
					$(this).parent().remove();
					if ( $(parentList).children('li').size() < 1 ) {
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

			html.make_timestamp_to_string();
		}
	});
};

/**
 * Replace a link in a given text with a clickable link
 *
 * @author Dennis Schneider
 */
html.replace_http_link = function(text) {
  var exp = /((http|https|ftp):\/\/[\w?=&.\-\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g;
  return text.replace(exp,"<a href='$1'>$1</a>");
};

/**
 * Build HTML for filters (including Add Field and Sharing Icons)
 *
 * @author Daniel Marschner
 */
html.buildFilteredList = function(title, tasks, show_add, filter) {
	if (show_add == undefined)
		show_add = false;
	
	result = '';
	count  = 0;
	
	// If tasks are set and not empty count them
	if (task != undefined && wunderlist.is_array(tasks) && tasks.length > 0)
		count = tasks.length;
	
	// If there are tasks add the share functionality
	result += "<div id='listfunctions'>";
	result += "<a rel='" + wunderlist.language.data.print_tasks + "' class='list-print'></a>";
	result += "<a rel='" + wunderlist.language.data.send_by_mail + "' class='list-email'></a>";
	result += "<a rel='" + wunderlist.language.data.share_with_cloud + "' class='list-cloud'></a><div id='cloudtip'><span class='triangle'></span><span class='link'></span></div>";
	result += '</div>';		
	
	// Add the title for the filter
	result += '<h1>' + title + '</h1>';

	// Add the "Add new task" field
	if (show_add === true)
	{
		result += '<div class="add">';
		result += '<div class="addwrapper ' + (filter != 'all' && filter != 'starred' ? 'filter-add' : '') + '"><input type="text" class="input-add" placeholder="' + wunderlist.language.data.add_task + '" /></div>';
		if (filter == 'all' || filter == 'starred')
			result += '<input type="hidden" class="datepicker" />';
		result += '</div>';
	}
	
	// Build tasks sorted by list
	if (count > 0)
	{
		actual_list    = 0;
		last_list      = 0;
		last_task_list = 0;
		
		var lists = wunderlist.database.getLists();
		for (var list in lists) {
			for (var ix in tasks)
			{
				if (lists[list].id == tasks[ix].list_id) {
					if (wunderlist.database.existsById('lists', tasks[ix].list_id))
					{
						//alert(tasks[ix].list_id);
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

						result += html.generateTaskHTML(tasks[ix].id, tasks[ix].name, tasks[ix].list_id, tasks[ix].done, tasks[ix].important, tasks[ix].date, tasks[ix].note);

						last_list      = actual_list;
						last_task_list = tasks[ix].list_id;
					}
				}
				
			}
		}
		
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
				
				result += html.generateTaskHTML(tasks[ix].id, tasks[ix].name, tasks[ix].list_id, tasks[ix].done, tasks[ix].important, tasks[ix].date, tasks[ix].note);
								
				last_list      = actual_list;
				last_task_list = tasks[ix].list_id;
			}
		}
		*/
	}
	
	if (show_add === false && count == 0)
		result += '<h3>' + wunderlist.language.data.no_results + '</h3>';

	return result;
};

/**
 * Removes HTML tags and escapes single quotes
 *
 * @author Daniel Marschner
 */
html.convertString = function(string, length) {
	string = string.split('<').join(escape('<'));
	string = string.split('>').join(escape('>'));
	string = string.split("'").join(escape("'"));
	
	if (length != undefined && length > 0)
		string = string.substr(0, length);
	
	return string;
};

/**
 * Clean the string -> HTML or script
 *
 * Ported by: slamidtfyn
 * More info at: www.soerenlarsen.dk/development-projects/xss-clean
 */
html.xss_clean = function(str) {
	str = html.convertString(str);
	str = str.replace(/\\0/gi, '')
	str = str.replace(/\\\\0/gi, '')
	str = str.replace(/#(&\#*\w+)[\x00-\x20]+;#u/g,"$1;")
	str = str.replace(/#(&\#x*)([0-9A-F]+);*#iu/g,"$1$2;")
	str = str.replace(/%u0([a-z0-9]{3})/gi, "&#x$1;")
	str = str.replace(/%([a-z0-9]{2})/gi, "&#x$1;")   
	
	results = str.match(/<.*?>/g, str);
	
	if(results) {
		
		var i
		for(i=0;i<results.length;i++) 
		{
			str = str.replace(results[i], html.html_entity_decode(results[i]));
		}
	}
	        
	str = str.replace(/\\t+/g, " ");
	str = str.replace(/<\?php/g,'&lt;?php');
	str = str.replace(/<\?PHP/g,'&lt;?PHP');
	str = str.replace(/<\?/g,'&lt;?');
	str = str.replace(/\?>/g,'?&gt;');
	words = new Array('javascript', 'vbscript', 'script', 'applet', 'alert', 'document', 'write', 'cookie', 'window');
	
	for(t in words)
	{
		temp = '';
		for (i = 0; i < words[t].length; i++)
		{
			temp += words[t].substr( i, 1)+"\\s*";
		}
		
		temp = temp.substr( 0,temp.length-3);
		myRegExp = new RegExp(temp, "gi");
		str = str.replace(myRegExp, words[t]);
	}
	
	str = str.replace(/\/<a.+?href=.*?(alert\(|alert&\#40;|javascript\:|window\.|document\.|\.cookie|<script|<xss).*?\>.*?<\/a>/gi,"")
	str = str.replace(/<img.+?src=.*?(alert\(|alert&\#40;|javascript\:|window\.|document\.|\.cookie|<script|<xss).*?\>/gi,"");
	str = str.replace(/<(script|xss).*?\>/gi,"");
	str = str.replace(/(<[^>]+.*?)(onblur|onchange|onclick|onfocus|onload|onmouseover|onmouseup|onmousedown|onselect|onsubmit|onunload|onkeypress|onkeydown|onkeyup|onresize)[^>]*>/gi,"$1");
	str = str.replace(/<(\/*\s*)(alert|applet|basefont|base|behavior|bgsound|blink|body|embed|expression|form|frameset|frame|head|html|ilayer|iframe|input|layer|link|meta|object|plaintext|style|script|textarea|title|xml|xss)([^>]*)>/ig, "&lt;$1$2$3&gt;");
	str = str.replace(/(alert|cmd|passthru|eval|exec|system|fopen|fsockopen|file|file_get_contents|readfile|unlink)(\s*)\((.*?)\)/gi, "$1$2&#40;$3&#41;");
	bad = new Array('document.cookie','document.write','window.location',"javascript\s*:","Redirect\s+302");
	
	for (val in bad)
	{
		myRegExp = new RegExp(bad[val], "gi");
		str = str.replace(myRegExp, bad[val]);   
	}
	
	str = str.replace(/<!--/g,"&lt;!--");
	str = str.replace(/-->/g,"--&gt;");
	
	return str;
};

$(function() {
	// Open every link in the browser
	$('a[href^=http], a[href^=https], a[href^=ftp], a[href^=mailto]').live('click', function() {
		Titanium.Desktop.openURL(this.href);
		return false;
	});
	
	// Open every file in the finder app
	$('span.openApp').live('click', function() {
		Titanium.Platform.openApplication($.trim($(this).text()));
	});
});