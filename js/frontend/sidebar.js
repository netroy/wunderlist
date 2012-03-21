/*global console: false*/
define('frontend/sidebar',
      ['libs/jquery', 'views/base', 'helpers/settings', 'helpers/templates'],
      function($, BaseView, settings, templates, undefined) {

  'use strict';

  var isPositionLeft, openStatus, body;
  var positionProperty = 'sidebar_position', openStatusProperty = 'sidebar_opened_status';


  /**
   * Initialize the sidebar position
   */
  function initPosition() {
    isPositionLeft = (settings.getString(positionProperty, 'right') !== 'right');
    openStatus = (settings.getString(openStatusProperty, 'true') === 'true');

    body.toggleClass('sidebarleft', isPositionLeft);
    body.toggleClass('sidebarClosed', !openStatus);
  }


  /**
   * Set the sidebar position based on the settings
   */
  function toggleSidebar() {
    body.toggleClass('sidebarClosed', openStatus);

    openStatus = !openStatus;
    settings.setString(openStatusProperty, openStatus);
  }

  /**
   * Return open status of the sidebar
   */
  function isOpen() {
    return openStatus;
  }


  function isSideBarRight() {
    return !isPositionLeft;
  }


  function setSideBarPosition(position) {
    position = position.toLowerCase();
    if(!!position.match(/^(left|right)$/)) {
      isPositionLeft = (position === 'left');
      settings.setString(positionProperty, position);
    }
    initPosition();
  }


  function init() {
    body = $('body');
    var layout = $('#layout');

    var sidebarView = new BaseView();
    sidebarView.template = templates.get('sidebar');
    layout.append(sidebarView.render().el);

    initPosition();

    layout.delegate('a.toggleSidebar', 'click', toggleSidebar);
  }

  return {
    'init': init,
    'isOpen': isOpen,
    'isSideBarRight': isSideBarRight,
    'setSideBarPosition': setSideBarPosition,
    'initPosition': initPosition,
    'toggleSidebar': toggleSidebar
  };

});