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