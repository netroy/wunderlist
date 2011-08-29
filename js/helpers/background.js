var background = background || {};

/**
 * Default settings for the background list
 *
 * @author Daniel Marschner
 */
background.settings = {
	defaultBgColor:    '#000',
	defaultBgRootPath: 'backgrounds/',
	defaultBgPosition: 'top center'
};

/**
 * Defining the background list; modify here to add new backgrounds
 *
 * @author Daniel Marschner
 */
background.list = {
	'bgsix'    : {bgPath: background.settings.defaultBgRootPath + 'darkfade.jpg',     bgPosition: background.settings.defaultBgPosition, bgColor: '#242424'},
	'bgseven'  : {bgPath: background.settings.defaultBgRootPath + 'whitefade.jpg',    bgPosition: background.settings.defaultBgPosition, bgColor: '#9c9c9c'},
	'bgfour'   : {bgPath: background.settings.defaultBgRootPath + 'blue.jpg',         bgPosition: background.settings.defaultBgPosition, bgColor: '#2b1023'},
	'bgone'    : {bgPath: background.settings.defaultBgRootPath + 'wood.jpg', 	      bgPosition: background.settings.defaultBgPosition, bgColor: background.settings.defaultBgColor},
	'bgnine'   : {bgPath: background.settings.defaultBgRootPath + 'darkwood.jpg',     bgPosition: 'center center',                       bgColor: background.settings.defaultBgColor},
	'bgfive'   : {bgPath: background.settings.defaultBgRootPath + 'royal_purple.jpg', bgPosition: background.settings.defaultBgPosition, bgColor: background.settings.defaultBgColor},
	'bgeight'  : {bgPath: background.settings.defaultBgRootPath + 'monster.jpg',      bgPosition: 'top right',                           bgColor: '#81bcb8'},
	'bgtwo'    : {bgPath: background.settings.defaultBgRootPath + 'wheat.jpg',        bgPosition: 'center center',                       bgColor: background.settings.defaultBgColor},
	'bgthree'  : {bgPath: background.settings.defaultBgRootPath + 'bokeh.jpg', 	      bgPosition: 'center center',                       bgColor: background.settings.defaultBgColor},
	'bgten'    : {bgPath: background.settings.defaultBgRootPath + 'chalkboard.jpg',   bgPosition: background.settings.defaultBgPosition, bgColor: '#000'},
	'bgtwelve' : {bgPath: background.settings.defaultBgRootPath + 'leaf.jpg',         bgPosition: background.settings.defaultBgPosition, bgColor: '#000'},
	'bgeleven' : {bgPath: background.settings.defaultBgRootPath + 'forrest.jpg',      bgPosition: background.settings.defaultBgPosition, bgColor: '#000'}
};

/**
 * Initialize the background switcher
 *
 * @author Daniel Marschner
 */
background.init = function() {

	// ------------------------------ Build Background List -----------------------------
	var bgCounter = 1;
		
	$('#right').prepend('<a class="backgroundswitcher"><span class="activebackground"></span></a>');
	
	$('#backgroundList').hide();

	$('a.activebackground').bind('click', function() {
		$('#backgroundList').fadeToggle(100);
	});

	$.each(background.list, function(bgClass) {
		$('#backgroundList').prepend('<a class="' + bgClass + '">' + (bgCounter++) + '</a>');

		$('a.' + bgClass).bind('click', function() {
			
			// set active menu switch
			var bgName = background.list[bgClass].bgPath.substring(12,background.list[bgClass].bgPath.length-4);			
			$(".activebackground").css("background","url('images/icon_" + bgName + ".png')");
			
			// change background
			$('#bghelp').fadeOut(200, function() {
                $(this).css('background', background.list[bgClass].bgColor + ' url(' + background.list[bgClass].bgPath + ') '+ background.list[bgClass].bgPosition +' no-repeat').fadeIn(200)
			});
			$('body').css('background','none');
			styleActive(this);
			Titanium.App.Properties.setString('active_theme', bgClass);
		});
	});

	// ------------------------------ Switcher Behavior -------------------------------------
	
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
		
		if(backgroundListOpen == 0) {
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
	$(".bgchooser a.bgone").addClass("active");

	// Active State
	styleActive = function(object) {
		 $("#bottombar #right a").removeClass("active");
		 $(object).addClass("active");
	};

	// Hide bghelp container at start
	$("#bghelp").hide();
}