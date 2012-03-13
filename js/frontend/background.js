/*global console: false*/
define('frontend/background', ['libs/jquery', 'helpers/settings'], function($, settings, undefined) {

  'use strict';

  var body, backgroundList, activeBackground, switcher,
      themeNames = ['one', 'two', 'three', 'four', 'five', 'six', 'seven',
                    'eight', 'nine', 'ten', 'eleven', 'twelve'];

  function switchBg(e, name) {
    if(typeof name !== 'string') {
      if(e && e.target) {
        name = $(e.target).attr('rel');
      } else {
        name = 'one';
      }
    }

    // set active menu switch
    body.attr('rel', name);

    // Highlight the currently selected
    $('a.active', backgroundList).removeClass('active');
    $('a[rel="'+name+'"]',  backgroundList).addClass('active');

    settings.setString('active_theme', name);
  }


  /**
   * Initialize the background switcher
   */
  function init() {
    body = $('body');
    switcher = $('#bottomBar a.backgroundSwitcher');

    backgroundList = $('.backgroundList', switcher);
    activeBackground = $('.activeBackground', switcher);

    backgroundList.hide();
    switcher.click(function() {
      backgroundList.fadeToggle(100);
    });

    var i,len;
    for(i=0, len = themeNames.length; i < len; i++) {
      backgroundList.append('<a class="icon" rel="' + themeNames[i] + '"> </a>');
    }

    backgroundList.delegate('a', 'click', switchBg);

    switchBg(null, settings.getString('active_theme', 'one'));

  }


  return {
    'init': init
  };

});