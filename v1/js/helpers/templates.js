/* global wunderlist */
wunderlist.helpers.templates = (function($, wunderlist, undefined) {

  "use strict";

  function render(template, data) {
    data = data || wunderlist;
    return template.replace(/\{\{[\w\.\-\(\)]+\}\}/g, function(match){
      var token = match.replace(/[\{\}]/g,"");
      try {
        return (new Function("data", "return data." + token))(data);
      } catch(e) {
        return "";
      }
    });
  }

  return {
    "render": render
  };

})(jQuery, wunderlist);