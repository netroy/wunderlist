var notifications = notifications || {};

/**
 * Initializes an notification object
 * 
 * @author Dennis Schneider
 */
notifications.init = function()
{
	this.notification = Titanium.Notification.createNotification(Titanium.UI.createWindow());
}

/**
 * Creates a new notification
 * 
 * @author Dennis Schneider
 */
notifications.createNotification = function(title, message)
{
	this.notification.setTitle(title);
	this.notification.setMessage(message);
	this.notification.show();
}

/*
	var notificationMessage = 'Successfully synced your data';
	
	if(sync_table_step1 != undefined && sync_table_step1.new_tasks > 0)
	{
		notificationMessage += ' Added ' + sync_table_step1.new_tasks.length + ' new tasks';
	}
	
	if(sync_table_step1 != undefined && sync_table_step1.new_lists > 0)
	{
		notificationMessage += ' Added ' + sync_table_step1.new_tasks.length + ' new lists';
	}	
	
	notifications.createNotification('wunderlist sync', notificationMessage);	
*/
