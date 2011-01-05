var share = share || {};

share.init = function()
{
	$('a.list-email').live("click", share.share_by_email);
	$('a.list-cloud').live("click", showCloudAppDialog);
	$('a.list-print').live("click", share.print);
	
	// Open URL on click
	$('#cloudtip span.link').live("click", function() {
		Titanium.Desktop.openURL($(this).text());
	});
	
	// Copy Link into clipboard
	$('#cloudtip span.copy').live("click", function() {
		Titanium.UI.Clipboard.setText($('#cloudtip span.link').text());
	});
}

/**
 * Send lists by mail
 *
 * @author Christian Reber
 */
share.share_by_email = function()
{
	// Get All Tasks
	var j_tasks = $('ul.mainlist span.description');
	
	if (j_tasks.length > 0)
	{
		// Generate List Name
		var name = encodeURI('wunderlist - ' + $('#content h1:first').text());

		var list_id        = $('ul#list').attr('rel');
		var is_filter_list = ($('ul.mainlist').hasClass('filterlist') == true);

		var tasks = share.getTasksForSharing(is_filter_list, list_id);
		
		// Build tasks html
		var body = '';
		
		$.each(tasks, function(key, value)
		{
			// Add task
			if (is_filter_list == false)
			{
				body += encodeURI('• ' + value.name);
			}
			else
			{
				body += encodeURI('• ' + value.task_name);
			}

			// Add date
			if (value.date != '')
			{
				body += '%20(' + convert_timestamp_into_date(value.date) + ')';
			}
			
			// Add note
			if (value.note != '')
			{
				body += '%0A%0A' + encodeURI(value.note) + '%0A';
			}
			
			body += '%0A';
		});

		Titanium.Desktop.openURL('mailto:?subject=' + name + '&body=' + body + '%0A' + encodeURI(' I generated this list with my task tool wunderlist from 6 Wunderkinder - Get it from http://www.6wunderkinder.com'));
	}
	else
	{
		alert(language.data.empty_list)
	}
}

/**
 * Send lists to Cloudapp
 *
 * @author Christian Reber
 */
share.share_with_cloudapp = function()
{
	var url = 'http://cloudapp.wunderlist.net';
	
	// Get All Tasks
	if ($('ul.mainlist span.description').length > 0)
	{
		// Generate data
		var data = {};		
		var user_credentials = wunderlist.getUserCredentials();

		data['email']    = user_credentials['email'];
		data['password'] = user_credentials['password'];
		data['list']     = $('#content h1:first').text();

		var list_id        = $('ul#list').attr('rel');
		var is_filter_list = ($('ul.mainlist').hasClass('filterlist') == true);

		var tasks = share.getTasksForSharing(is_filter_list, list_id);
		
		// Build tasks html
		data['tasks'] = new Array();
		
		$.each(tasks, function(key, value)
		{
			var new_task = new Array();
			
			// Add name
			if (is_filter_list == false)
			{
				new_task.push(unescape(value.name));
			}
			else
			{
				new_task.push(unescape(value.task_name));
			}

			// Add date
			new_task.push(value.date);
			
			// Add note
			new_task.push(unescape(value.note));
			
			data['tasks'].push(new_task);
		});
		
		// Generate CloudApp Link
		$.ajax({
			url  : url,
			type : 'POST',
			data : data,
			
			success: function(response_data, text, xhrobject)
			{
				var response = eval('(' + response_data + ')');
				
				// Everything fine?
				if (response.code == 100)
				{
					$('#cloudtip span.link').text(response.url).parent().show();
				}
				// Else show an error
				else
				{
					alert(language.data.try_again_later);
				}
			}
		});
	}
	else
	{
		alert(language.data.empty_list);
	}
}

/**
 * Print the current list
 *
 * @author Christian Reber
 */
share.print = function()
{
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

		var list_id        = $('ul#list').attr('rel');
		var is_filter_list = ($('ul.mainlist').hasClass('filterlist') == true);

		var tasks = share.getTasksForSharing(is_filter_list, list_id);
		
		// Build tasks html
		var html = '';
		
		$.each(tasks, function(key, value)
		{
			// Add task
			if (is_filter_list == false)
			{
				// If is normal list
				html += '<li><span></span>' + unescape(value.name);
			}
			else
			{
				// If is filter list
				html += '<li><span></span>' + unescape(value.task_name);
			}
			
			// Add date
			if (value.date != '')
			{
				html += ' (<b>' + convert_timestamp_into_date(value.date) + '</b>)';
			}
			
			// Add note
			if (value.note != '')
			{
				html += '<p>' + unescape(value.note.replace(/\n/g,'<br/>')) + '</p>';
			}
			
			html += '</li>';
		});
		
		// Replace Tasks
		template = template.replace(/####TASKS####/g, html);

		file.write(template);
		
		if (os == 'darwin')
			var file_url = 'file://';
		else
			var file_url = 'file:///';

		Titanium.Desktop.openURL(file_url + encodeURI(file));
	}
	else
	{
		alert(language.data.empty_list);
	}
}

/**
 * Get the tasks for the according shared list
 *
 * @author Dennis Schneider
 */
share.getTasksForSharing = function(is_filter_list, list_id)
{
	// Is it a filterlist or a normal list?
	if (is_filter_list == false)
	{
		// Get all tasks from database within the current list
		var tasks = wunderlist.getTasksByListId(list_id);
	}
	else
	{
		var type = $('ul#list').attr('type');

		if (type == 'withdate')
		{
			var tasks = wunderlist.getFilteredTasksForPrinting('date', type);
		}
		else if (type == 'nodate')
		{
			var tasks = wunderlist.getFilteredTasksForPrinting('date', type);
		}
		else
		{
			var tasks = wunderlist.getFilteredTasksForPrinting(type);
		}
	}

	return tasks;
}

/**
 * Converts a timestamp to a real date
 *
 * @author Christian Reber, Dennis Schneider
 */
convert_timestamp_into_date = function(timestamp)
{
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
			var dateformat = language.code;

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