wunderlist.updater = (function($, wunderlist, undefined){
  "use strict";

  /**
   * Check if the current version of Wunderlist is the newest one
   * @author Daniel Marschner
   */
  function checkVersion() {
    var UTILS = wunderlist.helpers.utils;
    var DIALOGS = wunderlist.helpers.dialogs;
    $.ajax({
      url     : '/version.txt',//'https://s3.amazonaws.com/wunderlist/version.txt',
      type    : 'GET',
      success : function(response_data, text, xhrobject) {
        var response   = JSON.parse(xhrobject.responseText);
        var curVersion = parseInt(UTILS.str_replace('.', '', wunderlist.version), 10);
        var newVersion = parseInt(UTILS.str_replace('.', '', response.version), 10);
      
        if (response.version !== undefined && newVersion > curVersion) {
          var updateHTML = '<p>' + wunderlist.helpers.utils.replaceLinks(response.message) + '</p>';
          var updateMsgDialog = DIALOGS.generateDialog('Update Message', updateHTML);
          DIALOGS.openDialog(updateMsgDialog);
        }
      }
    });
  }

  return {
    "checkVersion": checkVersion
  };

})(jQuery, wunderlist);

