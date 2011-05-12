/**
 * wunderlist.notifications.js
 *
 * Class for handling notifications
 * 
 * @author Dennis Schneider
 */

wunderlist.notifications = wunderlist.notifications || {};

/**
 * Initializes an notification object
 * 
 * @author Dennis Schneider
 */
wunderlist.notifications.init = function()
{
	wunderlist.notification = Titanium.Notification.createNotification(Titanium.UI.createWindow());
};

/**
 * Creates a new notification
 * 
 * @author Dennis Schneider
 */
wunderlist.notifications.createNotification = function(title, message)
{
	wunderlist.notification.setTitle(title);
	wunderlist.notification.setMessage(message);
	wunderlist.notification.show();
};