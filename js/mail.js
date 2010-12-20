$(function() {
	
	/**
	 * Send lists by mail
	 *
	 * @author Christian Reber
	 */
	$('h1.sendbymail').live("click", function()
	{
		// Get All Tasks
		var j_tasks = $('ul.mainlist span.description');
		
		
		if (j_tasks.length > 0)
		{
			// Generate List Name
			var name = encodeURI($('#content h1:first').text());

			// Generate Tasks
			var tasks = '';
			j_tasks.each(function() {
				tasks = tasks + encodeURI('• ' + $(this).text()) + '%0A';
			});

			Titanium.Desktop.openURL('mailto:?subject=' + name + '&body=' + tasks + '%0A' + encodeURI(' I generated this list with my task tool wunderlist from 6 Wunderkinder - Get it from http://www.6wunderkinder.com/wunderlist'));
		}
		else
		{
			alert('You want to send an empty list?')
		}
	});
	
});