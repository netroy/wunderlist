/**
 * Init the wunderlist framework and all necessary parts
 * @author Christian Reber, Dennis Schneider, Daniel Marschner
 */
wunderlist.init = (function($, wunderlist, html, Titanium){
  "use strict";

  return function() {

    // Set the app title
    var title = (wunderlist.account.isLoggedIn() && wunderlist.account.email !== '' ? ' - ' + wunderlist.account.email : '');
    wunderlist.helpers.utils.setTitle('Wunderlist ' + title);
  
    // Init settings
    wunderlist.settings.init();
  
    // Set the os version
    wunderlist.version = Titanium.App.version.toString();
  
    wunderlist.language.init();

    wunderlist.helpers.html = html;
  
    // Init the datastore
    wunderlist.database.init();
    
    wunderlist.sync.init();
    
    // Init some other necessary stuff
    // TODO: add the wunderlist prefix
    wunderlist.account.init();

    // Init the timer
    wunderlist.timer.init();

    wunderlist.menu.initializeTrayIcon();
    wunderlist.sharing.init();

    // Init Notifications
    wunderlist.notifications.init();

    // Init lists
    wunderlist.frontend.lists.init();

    // Init Tasks
    wunderlist.frontend.tasks.init();
  
    // Init notes
    wunderlist.frontend.notes.init();
  
    // Init the dialogs
    wunderlist.helpers.dialogs.init();

    // Init the layout
    wunderlist.layout.init();
  
    // Check for a new version
    if(Titanium.Network.online) {
      wunderlist.updater.checkVersion();
    }
  
    // Add the wunderlist object to the current window
    Titanium.UI.getCurrentWindow().wunderlist = wunderlist;
  
    // Enable shutdown fix
    Titanium.API.addEventListener(Titanium.EXIT, function() {
      Titanium.Platform.canShutdown();
    });

    $("body").show();
  };

})(jQuery, wunderlist, html, Titanium);


/*************************************************************************************/
// Start the wunderlist framework
$(wunderlist.init);
