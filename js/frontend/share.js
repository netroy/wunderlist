var share = share || {};

share.init = function() {
	$('#listfunctions a.list-email').live("click", share.share_by_email);
	$('#listfunctions a.list-cloud').live("click", dialogs.showCloudAppDialog);
	$('#listfunctions a.list-print').live("click", share.print);
	
	// Open URL on click
	$('#cloudtip span.link').live("click", function() {
		Titanium.Desktop.openURL($(this).text());
	});
	
	// Copy Link into clipboard
	$('#cloudtip span.copy').live("click", function() {
		Titanium.UI.Clipboard.setText($('#cloudtip span.link').text());
	});
};

/**
 * Send lists by mail
 *
 * @author Christian Reber, Daniel Marschner
 */
share.share_by_email = function() {
	// Get All Tasks
	var sharingTasks = $('ul.mainlist li');
	
	if (sharingTasks.length > 0)
	{
		// Generate List Name
		var name = encodeURIComponent('Wunderlist - ' + $('#content h1:first').text());
		var body = '';

		$('ul.mainlist li').each(function() {
			body += encodeURIComponent("• " + Encoder.htmlDecode($(this).children('span.description').text()));

			// Add date
			if ($(this).children('span.showdate').html() != '' && $(this).children('span.showdate').html() != null)
				body += "%20(" + $(this).children('span.showdate').html() + ")";
			
			// Add note
			if ($(this).children('span.note').html() != '')
				body += "%0d%0a" + encodeURIComponent(Encoder.htmlDecode($(this).children('span.note').html())) + "%0d%0a";

			body += "%0d%0a";
		});
		
		Titanium.Desktop.openURL("mailto:?subject=" + name + "&body=" + body + "%0d%0a" + encodeURI(' I generated this list with my task tool Wunderlist from 6 Wunderkinder - Get it from http://www.6wunderkinder.com/wunderlist'));
	}
	else
	{
		dialogs.showErrorDialog(wunderlist.language.data.empty_list);
	}
};

/**
 * Send lists to Cloudapp
 *
 * @author Christian Reber, Daniel Marschner
 */
share.share_with_cloudapp = function() {
	// Get All Tasks
	if ($('ul.mainlist span.description').length > 0)
	{
		var user_credentials = wunderlist.account.getUserCredentials();

		// Generate data
		var data = {
			'email' : user_credentials['email'],
			'list'  : $('#content h1:first').text(),
			'tasks' : []
		};

		$('ul.mainlist li').each(function() {
			var new_task = [];

			new_task.push($(this).children('span.description').html());

			// Add date
			if ($(this).children('span.showdate').hasClass('timestamp'))
				new_task.push(parseInt($(this).children('span.timestamp').attr('rel')) + 86400);
			else
				new_task.push(0);
			
			// Add note
			if ($(this).children('span.note').html() != '')
				new_task.push($(this).children('span.note').html());

			data['tasks'].push(new_task);
		});
		
		// Generate CloudApp Link
		$.ajax({
			url     : 'http://cloudapp.wunderlist.net',
			type    : 'POST',
			data    : data,
			success : function(response_data, text, xhrobject)
			{
				var response = $.parseJSON(response_data);
				
				// Everything fine?
				if (response.code == 100)
				{
					$('#cloudtip span.link').text(response.url).parent().show();
				}
				// Else show an error
				else
				{
					alert(wunderlist.language.data.try_again_later);
				}
			}
		});
	}
	else
	{
		dialogs.showErrorDialog(wunderlist.language.data.empty_list);
	}
};

/**
 * Print the current list
 *
 * @author Christian Reber
 */
share.print = function() {
	// NOTE: This is a workaround for printing - Titanium doesn't support window.print(), so we have to do it that way, still cool feature
	
	// Are they any tasks?	
	if ($('ul.mainlist span.description').length > 0)
	{
		// Create the temporary printfile
		var file = Titanium.Filesystem.getApplicationDataDirectory() + '/print.htm';
		file     = Titanium.Filesystem.getFile(file);

		// Load template
		var template = Titanium.Filesystem.getApplicationDirectory() + '/Resources/print.html';
		template     = Titanium.Filesystem.getFile(template).read().toString();

		// Replace List Title
		template = template.replace(/####LIST####/g, $('#content h1:first').text());

		// Build tasks HTML
		var html_code = '';
		
		var last_headline = '',
			new_headline = false;
		
		//<ul class="wunderlist">
		
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
			if ($(this).children('span.showdate').html() != '' && $(this).children('span.showdate').html() != null)
				html_code += ' (<b>' + $(this).children('span.showdate').html() + '</b>)';
			
			// Add note
			if ($(this).children('span.note').html() != '')
				html_code += '<p>' + $(this).children('span.note').html().replace(/\n/g,'<br/>') + '</p>';
			
			html_code += '</li>';
		});
		
		html_code += '</ul>';
		
		// Replace Tasks
		template = template.replace(/####TASKS####/g, html_code);

		file.write(template);
		
		if (settings.os === 'darwin')
			var file_url = 'file://';
		else
			var file_url = 'file:///';

		Titanium.Desktop.openURL(file_url + encodeURI(file));
	}
	else
	{
		dialogs.showErrorDialog(wunderlist.language.data.empty_list);
	}
};

/**
 * Get the tasks for the according shared list
 *
 * @author Dennis Schneider
 */
share.getTasksForSharing = function(is_filter_list, list_id) {
	// Is it a filterlist or a normal list?
	if (is_filter_list == false)
	{
		// Get all tasks from database within the current list
		var tasks = wunderlist.database.getTasks(undefined, list_id);
	}
	else
	{
		var type = $('ul#list').attr('type');

		if (type == 'withdate')
		{
			var tasks = wunderlist.database.getFilteredTasksForPrinting('date', type);
		}
		else if (type == 'nodate')
		{
			var tasks = wunderlist.database.getFilteredTasksForPrinting('date', type);
		}
		else
		{
			var tasks = wunderlist.database.getFilteredTasksForPrinting(type);
		}
	}

	return tasks;
};

/**
 * Converts a timestamp to a real date
 *
 * @author Christian Reber, Dennis Schneider
 */
convert_timestamp_into_date = function(timestamp) {
	var selected_date  = new Date(timestamp * 1000);

	if(timestamp != 0)
	{
		var day   = selected_date.getDate();
		var month = selected_date.getMonth() + 1; //January is 0!
		var year  = selected_date.getFullYear();

		if (day < 10) { 
			day = '0' + day;
		}
		if (month < 10)	{ 
			month = '0' + month;
		}

		var today = new Date();

		if (Titanium.App.Properties.hasProperty('dateformat') == true)
			var dateformat = Titanium.App.Properties.getString('dateformat');
		else
			var dateformat = wunderlist.language.code;

		if (dateformat == 'de') {
			return day + '.' + month + '.' + year;
		}
		else if (dateformat == 'en') {
	  		return day + '/' + month + '/' + year;
		}
		else {
			return month + '/' + day + '/' + year;
		}
	}
	else
	{
		return 'No Date';
	}
};