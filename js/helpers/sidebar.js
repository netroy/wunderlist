/* global wunderlist */
wunderlist.helpers.sidebar = (function($, wunderlist, undefined){
  "use strict";

  var isPositionRight, openStatus;
  var body, toggleButton;


  /**
   * Initialize the sidebar position
   * @author Dennis Schneider, Marvin Labod
   */
  function initPosition() {
    isPositionRight = (wunderlist.settings.getString('sidebar_position', 'right') !== "right");
    openStatus = (wunderlist.settings.getString('sidebar_opened_status', 'true') === "true");

    toggleButton.toggleClass("hidden", !openStatus);
    body.toggleClass("sidebarleft", isPositionRight);
    body.toggleClass("sidebarClosed", !openStatus);
  }


  /**
   * Set the sidebar position based on the settings
   * @author Dennis Schneider
   */
  function toggleSidebar() {
    toggleButton.toggleClass("hidden", openStatus);
    // body.toggleClass("sidebarleft", !isPositionRight);
    body.toggleClass("sidebarClosed", openStatus);

    openStatus = !openStatus;
    wunderlist.settings.setString('sidebar_opened_status', openStatus);
  }

  /**
   * Initialize the sidebar
   * @author Daniel Marschner, Dennis Schneider
   */
  function init() {
    body = $("body");
    toggleButton = $(".togglesidebar");

    initPosition();
    $("a.togglesidebar", "#right").live('click', toggleSidebar);  
    $("#content, #sidebar").addClass("slideTransition");
  }

  /**
   * Return open status of the sidebar
   */
  function isOpen(){
    return openStatus;
  }

  return {
    "init": init,
    "isOpen": isOpen,
    "initPosition": initPosition,
    "toggleSidebar": toggleSidebar
  };
})(jQuery, wunderlist);