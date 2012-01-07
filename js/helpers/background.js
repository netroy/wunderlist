/* global wunderlist */
wunderlist.helpers.background = (function($, wunderlist, undefined){
  "use strict";

  var body, backgroundList, activeBackground, switcher;

  /**
   * Default settings for the background list
   * @author Daniel Marschner
   */
  var bgSettings = {
    defaultBgColor:    '#000',
    defaultBgRootPath: 'backgrounds/',
    defaultBgPosition: 'top center'
  };


  /**
   * Defining the background list; modify here to add new backgrounds
   * @author Daniel Marschner
   */
  var defaultBgColor = bgSettings.defaultBgColor;
  var defaultBgPosition = bgSettings.defaultBgPosition;
  var bgList = {
    'bgone'    : {bgPath: 'wood.jpg',         bgPosition: defaultBgPosition, bgColor: defaultBgColor},
    'bgtwo'    : {bgPath: 'wheat.jpg',        bgPosition: 'center center',   bgColor: defaultBgColor},
    'bgthree'  : {bgPath: 'bokeh.jpg',        bgPosition: 'center center',   bgColor: defaultBgColor},
    'bgfour'   : {bgPath: 'blue.jpg',         bgPosition: defaultBgPosition, bgColor: '#2b1023'},
    'bgfive'   : {bgPath: 'royal_purple.jpg', bgPosition: defaultBgPosition, bgColor: defaultBgColor},
    'bgsix'    : {bgPath: 'darkfade.jpg',     bgPosition: defaultBgPosition, bgColor: '#242424'},
    'bgseven'  : {bgPath: 'whitefade.jpg',    bgPosition: defaultBgPosition, bgColor: '#9c9c9c'},
    'bgeight'  : {bgPath: 'monster.jpg',      bgPosition: 'top right',       bgColor: '#81bcb8'},
    'bgnine'   : {bgPath: 'darkwood.jpg',     bgPosition: 'center center',   bgColor: defaultBgColor},
    'bgten'    : {bgPath: 'chalkboard.jpg',   bgPosition: defaultBgPosition, bgColor: '#000'},
    'bgeleven' : {bgPath: 'forrest.jpg',      bgPosition: defaultBgPosition, bgColor: '#000'},
    'bgtwelve' : {bgPath: 'leaf.jpg',         bgPosition: defaultBgPosition, bgColor: '#000'}
  };

  function switchBg(e, name) {
    if(typeof name !== 'string' || typeof bgList[name] === 'undefined') {
      if(e && e.target){
        name = $(e.target).attr("class");
      } else {
        name = "bgone";
      }
    }

    // set active menu switch
    var bg = bgList[name];
    var bgPath = bgSettings.defaultBgRootPath + bg.bgPath;

    activeBackground.attr("class", name);

    // update the background-image for the body
    body.css({
      'background-image': 'url(' + bgPath + ')',
      'background-position': bg.bgPosition,
      'background-color': bg.bgColor
    });

    // Highlight the currently selected
    $("a.active", backgroundList).removeClass("active");
    $("a."+name,  backgroundList).addClass("active");

    wunderlist.settings.setString('active_theme', name);
  }

  /**
   * Initialize the background switcher
   * @author Daniel Marschner
   */
  function init(){
    body = $("body");
    backgroundList = $('#backgroundList');
    activeBackground = $("#activebackground");
    switcher = $('a.backgroundswitcher');

    backgroundList.hide();
    switcher.click(function() {
      backgroundList.fadeToggle(100);
    });

    $.each(bgList, function(bgClass) {
      backgroundList.append('<a class="' + bgClass + '"> </a>');
    });
    backgroundList.delegate('a', 'click', switchBg);

    var theme = wunderlist.settings.getString("active_theme", "bgone");
    switchBg(null, theme);

  /*
    var menuTimer;
  
    // Menu Blur
    $("#menublur").mouseenter(function(){
      menuTimer = setTimeout(function() {
    
        // Account Menu
        $("#left ul").hide();
        $("#left a:first").removeClass("active");
        $("#left li").removeClass("currenttree");
        $("#menublur").hide();
          
        // Background Switcher
        $('#backgroundList').fadeOut(100);
      
        backgroundListOpen = 0;
      
        }, 350);
    });
  
    backgroundListOpen = 0;
  
    // Background Switcher
    $("a.backgroundswitcher").click(function(){
      clearTimeout(menuTimer);
    
      if(backgroundListOpen === 0) {
        $("#backgroundList").fadeIn("100");
        $("#menublur").show();
        backgroundListOpen = 1;
      }
    
      else {
        $("#backgroundList").hide();
        $("#menublur").hide();
        backgroundListOpen = 0;
      }
    });
  
    $("#backgroundList").mouseenter(function(){
      clearTimeout(menuTimer);
    });

    // Load Default Active State
    //$(".bgchooser a.bgone").addClass("active");
  */
  }


  return {
    "init": init
  };
})(jQuery, wunderlist);