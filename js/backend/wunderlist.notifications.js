/**
 * wunderlist.notifications.js
 * Class for handling notifications
 * @author Dennis Schneider
 */

wunderlist.notifications = (function(window, $, wunderlist, Titanium, undefined){
  "use strict";

  var notification,
      icon = "/images/wunderlist.png",
      allowed, popup, 
      delay = 4000,
      self;

  /**
   * Notification class to be used for DOM based notification fallback
   * TODO: we don't really need a class to do this, remove the class.
   */
  function NotificationWindow(){

  }

  NotificationWindow.prototype = {
    setTitle: function(title){
      this.title = title;
    },
    setMessage: function(message){
      this.message = message;
    },
    show: function(){
      // TODO: implement a DOM based notification system
    }
  };

  /**
   * Factory function for creating notifications
   */
  function createNotification(){
    return new NotificationWindow();
  }


  /**
   * Creates a new notification for App using Titanium
   * @param title - title of the notification
   * @param message - text for the notification
   * @author Dennis Schneider
   */
  function createNotificationTitanium(title, message) {
    notification.setTitle(title);
    notification.setMessage(message);
    notification.show();
  }

  /**
   * Creates a new notification for App using WebKit Notification API (currently chrome only)
   * @param title - title of the notification
   * @param message - text for the notification
   */
  function createNotificationWebkit(title, message) {
    if(!allowed){
      return;
    }
    popup = notification.createNotification(icon, title, message);
    popup.show();
    window.setTimeout(function(){
      popup.cancel();
    }, delay);
  }


  /**
   * Initializes an notification object
   * @author Dennis Schneider
   */
  function init() {
    if(Titanium.Notification) {
      notification = Titanium.Notification.createNotification(Titanium.UI.createWindow());
      self.createNotification = createNotificationTitanium;
    } else if(window.webkitNotifications) {
      notification = window.webkitNotifications;
      allowed = true;
      if(notification.checkPermission() !== 0){
        allowed = false;
        notification.requestPermission(function(){
          allowed = true;
        });
      }
      self.createNotification = createNotificationWebkit;
    }

    if (!notification) {
      self.createNotification = createNotification;
    }

    $(window).unload(function(){
      if(typeof popup.cancel === 'function'){
        popup.cancel();
      }
    });
  }


  self = {
    "init": init
  };
  
  return self;

})(window, jQuery, wunderlist, Titanium);



