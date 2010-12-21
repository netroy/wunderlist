$(function() {
	
	/**
	 * Send lists by mail
	 *
	 * @author Christian Reber
	 */
	$('a.list-email').live("click", function()
	{
		// Get All Tasks
		var j_tasks = $('ul.mainlist span.description');
		
		
		if (j_tasks.length > 0)
		{
			// Generate List Name
			var name = encodeURI('wunderlist - ' + $('#content h1:first').text());

			// Generate Tasks
			var tasks = '';
			j_tasks.each(function() {
				tasks = tasks + encodeURI('• ' + $(this).text()) + '%0A';
			});

			Titanium.Desktop.openURL('mailto:?subject=' + name + '&body=' + tasks + '%0A' + encodeURI(' I generated this list with my task tool wunderlist from 6 Wunderkinder - Get it from http://www.6wunderkinder.com/wunderlist'));
		}
		else
		{
			alert(language.data.empty_list)
		}
	});
	
	/**
	 * Send lists to CloudApp
	 *
	 * @author Christian Reber
	 */
	$('a.list-cloud').live("click", function()
	{
		var url = 'http://cloudapp.localhost';		
		
		// Get All Tasks
		var j_tasks = $('ul.mainlist span.description');
		
		if (j_tasks.length > 0)
		{
			// Generate data
			var data = {};		
			var user_credentials = wunderlist.getUserCredentials();

			data['email']    = user_credentials['email'];
			data['password'] = user_credentials['password'];
			data['list']     = 'wunderlist - ' + $('#content h1:first').text();

			// Generate Tasks
			var tasks = new Array();
			j_tasks.each(function() {
				tasks.push($(this).text());
			});
			
			data['tasks'] = tasks;
			
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
						alert(response.url);
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
	});
	
});