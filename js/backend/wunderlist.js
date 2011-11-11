/**
 * Init the wunderlist framework and all necessary parts
 * @author Christian Reber, Dennis Schneider, Daniel Marschner
 */
wunderlist.init = (function(W, settings, share, Titanium){ 
  "use strict";

  return function() {

    // Set the app title
    var title = (W.account.isLoggedIn() && W.account.email !== '' ? ' - ' + W.account.email : '');
    W.helpers.utils.setTitle('Wunderlist' + title);
  
    // Set the os version
    W.os = Titanium.Platform.name.toLowerCase();
    W.version = Titanium.App.version.toString();
  
    W.language.init();
  
    // Init the datastore
    W.database.init();
  
    settings.init();
    
    W.sync.init();
    
    // Init some other necessary stuff
    // TODO: add the wunderlist prefix
    W.account.init();
    W.timer.init();
    W.menu.initializeTrayIcon();
    W.sharing.init();
    W.notifications.init();
    share.init();
  
    // Init notes
    W.helpers.note.init();
    W.frontend.notes.init();
  
    // Init the dialogs
    W.helpers.dialogs.init();

    // Init the layout
    W.layout.init();
  
    // Check for a new version
    W.updater.checkVersion();  
  
    // Add the wunderlist object to the current window
    Titanium.UI.getCurrentWindow().wunderlist = wunderlist;
  
    // Enable shutdown fix
    Titanium.API.addEventListener(Titanium.EXIT, function() {
      Titanium.Platform.canShutdown();
    });
  };

})(wunderlist, settings, share, Titanium);


/*************************************************************************************/
// Start the wunderlist framework
$(wunderlist.init);