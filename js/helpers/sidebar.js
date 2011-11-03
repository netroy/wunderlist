/* global wunderlist */
wunderlist.sidebar = (function(undefined){
  var Properties = Titanium.App.Properties;
  var isPositionRight, openStatus;
  var body, toggleButton;


  /**
   * Initialize the sidebar position
   * @author Dennis Schneider, Marvin Labod
   */
  function initPosition() {
    toggleButton.toggleClass("hidden", openStatus);
    body.toggleClass("sidebarleft", isPositionRight);
    body.toggleClass("sidebarClosed", openStatus);
  }


  /**
   * Set the sidebar position based on the settings
   * @author Dennis Schneider
   */
  function toggleSidebar() { 
    openStatus = !openStatus;
    Properties.setString('sidebar_opened_status', openStatus);
    toggleButton.toggleClass("hidden", openStatus);
    // body.toggleClass("sidebarleft", !isPositionRight);
    body.toggleClass("sidebarClosed", openStatus);
  }

  /**
   * Initialize the sidebar
   * @author Daniel Marschner, Dennis Schneider
   */
  function init() {
    isPositionRight = (Properties.getString('sidebar_position', 'right') !== "right");
    openStatus = (Properties.getString('sidebar_opened_status', 'true') === "true");

    body = $("body");
    toggleButton = $(".togglesidebar");

    initPosition();
    $("a.togglesidebar", "#right").live('click', toggleSidebar);  
    $("#content, #sidebar").addClass("slideTransition");
  }

  return {
    "init": init,
    "initPosition": initPosition
  };
})();