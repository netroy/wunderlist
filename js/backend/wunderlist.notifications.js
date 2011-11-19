/**
 * wunderlist.notifications.js
 * Class for handling notifications
 * @author Dennis Schneider
 */

wunderlist.notifications = (function(wunderlist, Titanium, undefined){
  "use strict";

  var notification;


  /**
   * Creates a new notification
   * @author Dennis Schneider
   */
  function createNotification(title, message) {
    notification.setTitle(title);
    notification.setMessage(message);
    notification.show();
  }


  /**
   * Initializes an notification object
   * @author Dennis Schneider
   */
  function init() {
    wunderlist.notification = Titanium.Notification.createNotification(Titanium.UI.createWindow());
  }


  return {
    "init": init,
    "createNotification": createNotification
  };
})(wunderlist, Titanium);



