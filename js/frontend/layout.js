/* global wunderlist */
wunderlist.layout = (function(undefined) {

  var syncTooltip, body;


  /**
   * Stops the "keydown" event by using the shortcut CTRL+P to print the actual viewing list
   * @author Daniel Marschner
   */
  var printShortcutListener = 0;

  /**
   * Stops the "keydown" event by using the shortcut CTRL+S to sync the lists and tasks
   * @author Daniel Marschner
   */
  var syncShortcutListener = 0;

  /**
   *  Login / Register / Forgot PW Behavior Fallback
   * @author Marvin Labod
   */
  function registerProcess() {

    // Show and Hide Register Dialog
    $("#showregistersubmit").live("click", function(){
      $('input.input-red').removeClass('input-red');
      $('div.errorwrap p').text('');
      $(".dialog-login .ui-dialog-title").text(wunderlist.language.data.register_your_account);
      $('.dialog-login input#register-email').val($('.dialog-login input#login-email').val());
      $('.dialog-login input#register-password').val($('.dialog-login input#login-password').val());
      $(".showlogindialog").hide();
      $(".showregisterdialog").fadeIn("slow");
      $("#account-loader").hide();
        
      if($('input#login-email').val() !== ""){
        $("#registersubmit").click();
      }
    
      //console.log(wunderlist.language.english.email);
    });
  
    $("#showloginsubmit").live("click",function(){
      $('input.input-red').removeClass('input-red');
      $('div.errorwrap p').text('');
      $(".dialog-login .ui-dialog-title").text(wunderlist.language.data.register_title);
      $('.dialog-login input#register-email').val(wunderlist.language.english.email);
      $('.dialog-login input#register-password').val(wunderlist.language.english.password);
      $(".showregisterdialog").hide();
      $(".showlogindialog").fadeIn("slow");  
      $("#account-loader").hide();
    });
  
    // Show and Hide Forgot PW Dialog
    $("#showforgotpw").live("click",function(){
      $('input.input-red').removeClass('input-red');
      $('div.errorwrap p').text('');
      $(".dialog-login .ui-dialog-title").text(wunderlist.language.data.forgot_password);
      $(".loginbuttons").hide();
      $(".forgotpwbuttons").fadeIn();
      $("#account-loader").hide();
      $('#forgotpw-email').val($('input#login-email').val()).focus();
    });
  
    $("#cancelforgotpw").live("click",function(){
      $(".forgotpwbuttons .errorwrap").hide();
      $("#forgotpw-email").val("");
      $(".dialog-login .ui-dialog-title").text(wunderlist.language.data.register_title);
      $(".forgotpwbuttons").hide();
      $(".loginbuttons").fadeIn();  
    });
  
    // Submit Forgot PW on Return  
    $("#forgotpw-email").live('keyup', function(evt){
      if(evt.keyCode == 13){
        $('#forgot-pwd').click();
      }
    });
  }


  /**
   * Tooltips
   * @author Marvin Labod
   */
  function tooltipHandler(e) {
    var content = $(this).attr("rel");
    var offset = $(this).offset();
    var width = $(this).width();

    body.append("<p id='tooltip'>"+ content +"</p>");

    var tipWidth = $("#tooltip").width();

    if($(this).attr("id") == "sync"){tipWidth = "36";}
    $("#tooltip").css("top",(offset.top-35) + "px").css("left",(offset.left-tipWidth/2) + "px").show();
    
    if($(this).parent().attr("id") == "listfunctions") {
      $("#tooltip").css("top",(offset.top+25));
    }

    if(!wunderlist.helpers.sidebar.isSideBarRight()) {
      if(e.target.className == "list-cloud") {
        $("#tooltip").css("left",(offset.left-40-tipWidth/2) + "px");
      }
    }

    if ($("#cloudtip:visible").length == 1 && $(this).parent().attr("id") == "listfunctions") {
      $("#tooltip").hide();
    }

    if($(this).parent().attr("id") == "left") {
      $("#tooltip").css("left",(offset.left+17-tipWidth/2) + "px");
    }
  }

  function toolTips() {
    $("a.more, span.more, #listfunctions a").live("mouseenter", tooltipHandler);
    $("a.more, span.more, #listfunctions a").live("mouseleave", function(e) {
      $("#tooltip").remove();
    });
  }



  /**
   * Rotate animation on the sync icon
   */
  var rotationTimer = 0, degree = 0;
  function rotate() {
    clearTimeout(rotationTimer);
    $("span#syncing").css('-webkit-transform','rotate(' + degree + 'deg)');
    degree = (degree + 180) % 360;
    rotationTimer = setTimeout(rotate, 800);
  }



  function startSyncAnimation() {
    $('#tooltip').remove();
    body.append("<p id='sync_tooltip'>" + wunderlist.language.data.sync + "</p>");

    if(!wunderlist.helpers.sidebar.isSideBarRight()) {
      syncTooltip.css("bottom",41 + "px").css("left",275 + "px");
    } else {
      syncTooltip.css("bottom",41 + "px").css("left",7 + "px");
    }
  
    syncTooltip.fadeIn("fast");
    rotate(0);
  }

  function stopSyncAnimation() {
    syncTooltip.delay("1000").fadeOut("fast", function() {
      syncTooltip.remove();
      clearTimeout(rotationTimer);
    });
  }


  /**
   * Start the account login / register animation
   * @author Dennis Schneider
   */
  function startLoginAnimation() {
    $('#account-buttons input').hide();
    $('#account-buttons #account-loader').fadeIn('slow');
    $('.error').text('');
  }


  /**
   * Stop the account login / register animation
   * @author Dennis Schneider
   */
  function stopLoginAnimation() {
    $('#account-buttons input').fadeIn('slow');
    $('#account-buttons #account-loader').hide();
  }


  /**
   * Change the sync background image from green to red
   * @author Daniel Marschner
   */
  function switchSyncSymbol(status) {
    if(status === 0) {
      if($('span#sync').hasClass("sync_red") === false){
        $('span#sync').addClass('sync_red');
      }

      setTimeout(function() {
        $('p#sync_tooltip').text(wunderlist.language.data.no_sync);
        stopSyncAnimation();
      }, 1000);

    } else {
      $('span#sync').removeClass('sync_red');
      $('p#sync_tooltip').text(wunderlist.language.data.sync);
    }
  }

  function init() {
    body = $("body");
    syncTooltip = $("#sync_tooltip");

    toolTips();  
    registerProcess();

    /**
     * Init the sidebar. Based on settings put it on left or right
     */
    wunderlist.helpers.sidebar.init();

    /**
     * Init the Search
     */
    wunderlist.frontend.search.init();

    /**
     * Init background Switcher & the page background
     * @author Marvin Labod
     * @author Daniel Marschner
     */
    wunderlist.helpers.background.init();

    // Init share
    wunderlist.frontend.share.init();

    // Init Filters
    wunderlist.frontend.filters.init();

    // Init Sort Drop
    wunderlist.frontend.sortdrop.init();

    // Init Menu
    wunderlist.menu.initialize();

    // Fixes a problem with webkit and jquery sortable icon
    document.onselectstart = function () {
      return false;
    };

    // If program has been opened 5 times, open the invite dialog
    runtime = wunderlist.settings.getString('runtime');
    if(runtime % 10 === 0 && wunderlist.settings.getString('invited', 'false') === 'false') {
      // DEBUG: disable invite popup, gets really annoying
      // wunderlist.account.showInviteDialog();
    }

    $('a.showhelp').bind('click', function() {
      wunderlist.helpers.dialogs.showHelpDialog();
    });

/*
    $(".wklogo").mouseenter(function(){
      $(this).fadeOut();
      $(".followus").fadeIn();
    });

    $(".followus").mouseleave(function(){
      $(this).fadeOut();
      $(".wklogo").fadeIn();
    });
*/
  }


  return {
    "init": init,
    "startSyncAnimation": startSyncAnimation,
    "stopSyncAnimation": stopSyncAnimation,
    "startLoginAnimation": startLoginAnimation,
    "stopLoginAnimation": stopLoginAnimation,
    "switchSyncSymbol": switchSyncSymbol
  };

})();
