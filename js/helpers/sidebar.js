/* global wunderlist */
wunderlist.helpers.sidebar = (function($, wunderlist, undefined){
  "use strict";

  var isPositionLeft, openStatus;
  var body, toggleButton;

  /**
   * Initialize the sidebar position
   * @author Dennis Schneider, Marvin Labod
   */
  function initPosition() {
    isPositionLeft = (wunderlist.settings.getString('sidebar_position', 'right') !== "right");
    openStatus = (wunderlist.settings.getString('sidebar_opened_status', 'true') === "true");

    toggleButton.toggleClass("hidden", !openStatus);
    body.toggleClass("sidebarleft", isPositionLeft);
    body.toggleClass("sidebarClosed", !openStatus);
  }


  /**
   * Set the sidebar position based on the settings
   * @author Dennis Schneider
   */
  function toggleSidebar() {
    toggleButton.toggleClass("hidden", openStatus);
    body.toggleClass("sidebarClosed", openStatus);

    openStatus = !openStatus;
    wunderlist.settings.setString('sidebar_opened_status', openStatus);
  }
  

  /**
   * Return open status of the sidebar
   */
  function isOpen(){
    return openStatus;
  }


  function isSideBarRight(){
    return !isPositionLeft;
  }


  function setSideBarPosition(position){
    position = position.toLowerCase();
    if(!!position.match(/^(left|right)$/)) {
      isPositionLeft = (position === 'left');
      wunderlist.settings.setString('sidebar_position', position);
    }
    initPosition();
  }


  /**
   * Initialize the sidebar
   * @author Daniel Marschner, Dennis Schneider
   */
  function init() {
    body = $("body");
    toggleButton = $("a.togglesidebar", "#right");

    initPosition();
    toggleButton.live('click', toggleSidebar);
    $("#content, #sidebar").addClass("slideTransition");
  }

  return {
    "init": init,
    "isOpen": isOpen,
    "isSideBarRight": isSideBarRight,
    "setSideBarPosition": setSideBarPosition,
    "initPosition": initPosition,
    "toggleSidebar": toggleSidebar
  };
})(jQuery, wunderlist);