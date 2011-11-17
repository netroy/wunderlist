/**
 * Init the wunderlist framework and all necessary parts
 * @author Christian Reber, Dennis Schneider, Daniel Marschner
 */
wunderlist.init = (function($, wunderlist, settings, Titanium){ 
  "use strict";

  return function() {

    // Set the app title
    var title = (wunderlist.account.isLoggedIn() && wunderlist.account.email !== '' ? ' - ' + wunderlist.account.email : '');
    wunderlist.helpers.utils.setTitle('Wunderlist ' + title);
  
    // Set the os version
    wunderlist.os = Titanium.Platform.name.toLowerCase();
    wunderlist.version = Titanium.App.version.toString();
  
    wunderlist.language.init();
  
    // Init the datastore
    wunderlist.database.init();
  
    settings.init();
    
    wunderlist.sync.init();
    
    // Init some other necessary stuff
    // TODO: add the wunderlist prefix
    wunderlist.account.init();
    wunderlist.timer.init();
    wunderlist.menu.initializeTrayIcon();
    wunderlist.sharing.init();
    wunderlist.notifications.init();

    // Init lists
    wunderlist.frontend.lists.init();
  
    // Init notes
    wunderlist.helpers.note.init();
    wunderlist.frontend.notes.init();
  
    // Init the dialogs
    wunderlist.helpers.dialogs.init();

    // Init the layout
    wunderlist.layout.init();

    // Init Menu
    wunderlist.menu.initialize();

    // Init share
    wunderlist.frontend.share.init();

    // Init Filters
    wunderlist.frontend.filters.init();
  
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

})(jQuery, wunderlist, settings, Titanium);


/*************************************************************************************/
// Start the wunderlist framework
$(wunderlist.init);