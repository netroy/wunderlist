/* global wunderlist */
wunderlist.menu = (function(undefined){

  var recreateTutsClicked = false;
  var switchDateFormatDialog;


  function recreateTutorials() {
      if (recreateTutsClicked === false) {
          recreateTutsClicked = true;
          //wunderlist.recreateTutorials();
      }
      setTimeout(function() {
          recreateTutsClicked = false;
      }, 200);
  }


  function initMenuEvents(){
    var menuUl = $("ul.menu");
    menuUl.delegate("a", "click", function(){
      $("#menublur").click();
    });

    $('a.change_login_data', menuUl).click( wunderlist.account.editProfile );
    $('a.delete_account', menuUl).click( wunderlist.account.deleteAccount );
    $('a.invitation', menuUl).click( wunderlist.account.showInviteDialog );
    $('a.logout', menuUl).click( wunderlist.account.logout );

    $('a.credits', menuUl).click( wunderlist.helpers.dialogs.openCreditsDialog );
    $('a.backgrounds', menuUl).click( wunderlist.helpers.dialogs.openBackgroundsDialog );
    $('a.switchdateformat', menuUl).click( wunderlist.helpers.dialogs.openSwitchDateFormatDialog );
    $('a.deleteprompt', menuUl).click( wunderlist.helpers.dialogs.openDeletePromptDialog );
    $('a.sidebarposition', menuUl).click( wunderlist.helpers.dialogs.openSidebarPositionDialog );
    $('a.create_tutorials', menuUl).click( recreateTutorials );
    $('a.lang', menuUl).click(function() {
        wunderlist.language.switchLang($(this).attr('rel'));
    });
  }


  function initializeTrayIcon(){
  
  }

  function remove(){
    
  }


  function initialize() {
    var menuTimer;
    var blurActive = 0;
/*
    $("a.backgroundswitcher").click(function() {
      clearTimeout(menuTimer);
      $("#backgroundList").fadeIn("100");
      $("#menublur").show();
    });

    $("#backgroundList").mouseenter(function() {
      clearTimeout(menuTimer);
    });
*/

    $("#left ul a").each(function() {
      if ($(this).next("ul").length !== 0) {
        $(this).parent().addClass("hasChild");
      }
    });

    $("#left a:first").click(function() {
      clearTimeout(menuTimer);
      $(this).next().show();
      $("#menublur").show();
    });

    $("#left ul a").mouseenter(function() {
      clearTimeout(menuTimer);
      $(this).parent().parent().find("ul").hide();
      submenu = $(this).next("ul");
      submenu.show();
      $(this).parent().parent().find("li").removeClass("currenttree");
      $(this).parent("li").addClass("currenttree");
    });

    $("#menublur").mouseenter(function() {
      menuTimer = setTimeout(function() {
        $("#left ul").hide();
        $("#left a:first").removeClass("active");
        $("#left li").removeClass("currenttree");
        $("#menublur").hide();
        $('#backgroundList').fadeOut(100);
      }, 350);
    });
  
    initMenuEvents();
  }


  /**
   * MenuItemClass - use this to build the DOM menu
   */
   // TODO: Implement a DOM based menu
   function Item(){
     console.log(["Menu", arguments]);
   }
   Item.prototype = {
     addItem: function(){
       return new Item();
     },
     addSeparatorItem: function(){

     }
   };
   function createMenu(){
     return new Item();
   }
   function setMenu(menu){
     // Do something
   }
   function setBadge(count){
     // update some badge
   }


  return {
    "initialize": initialize,
    "initializeTrayIcon": initializeTrayIcon,
    "remove": remove,
    "createMenu": createMenu,
    "setMenu": setMenu,
    "setBadge": setBadge
  };
})();