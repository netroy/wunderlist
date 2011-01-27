var Layout = Layout || {};

/**
 * Stops the "keydown" event by using the shortcut CTRL+P to print the actual viewing list
 *
 * @author Daniel Marschner
 */
var printShortcutListener = 0;

/**
 * Stops the "keydown" event by using the shortcut CTRL+S to sync the lists and tasks
 *
 * @author Daniel Marschner
 */
var syncShortcutListener = 0;

// Tooltip
var tooltip = function() {
	$("a.more, span.more, #listfunctions a").live("mouseenter", function(e) {
		var content = $(this).attr("rel");
		var offset = $(this).offset();
		var width = $(this).width();

		// if($(this).attr("id") == "all"){width = "-4";}

		$("body").append("<p id='tooltip'>"+ content +"</p>");
		
		var tipWidth = $("#tooltip").width();
		if($(this).attr("id") == "sync"){tipWidth = "36";}

		$("#tooltip").css("top",(offset.top-35) + "px").css("left",(offset.left-tipWidth/2) + "px").fadeIn("fast");
				
		if($(this).parent().attr("id") == "listfunctions") {
			$("#tooltip").css("top",(offset.top+25));
		}
		
		if ($("#cloudtip:visible").length == 1 && $(this).parent().attr("id") == "listfunctions") {
			$("#tooltip").hide();
		}
		
		if($(this).parent().attr("id") == "left") {
			$("#tooltip").css("left",(offset.left+17-tipWidth/2) + "px");
		}
	});
		
	$("a.more, span.more, #listfunctions a").live("mouseleave", function(e) {
		$("#tooltip").remove();
	});
};

/**
 * Starts the syncing animation
 *
 * @author Daniel Marschner
 */
/*
startSyncAnimation = function() {

	$('#tooltip').remove();

	$('span#syncing').addClass('rotation');

	$("body").append("<p id='sync_tooltip'>" + language.data.sync + "</p>");

	$("#sync_tooltip").css("bottom",(41) + "px").css("left",(7) + "px").fadeIn("fast");
}

stopSyncAnimation = function() {

	$('span#syncing').animate({opacity: 1}, 1000, function() {
		$(this).removeClass('rotation');
	});

	$("#sync_tooltip").css("bottom",(41) + "px").css("left",(7) + "px").delay("1000").fadeOut("fast", function() {
		$(this).remove();
	});
}
*/
var rotationTimer = 0;

function rotate(degree) {
	$("span#syncing").css('-webkit-transform','rotate(' + degree + 'deg)');
	rotationTimer = setTimeout(function() {
    	rotate(degree+12);
    },5);
}

startSyncAnimation = function() {

	$('#tooltip').remove();
	$("#bottom-filters").append("<p id='sync_tooltip'>" + language.data.sync + "</p>");
	$("#sync_tooltip").css("bottom",(50) + "px").css("left",(-9) + "px").fadeIn("fast");

    rotate(0);
}

stopSyncAnimation = function() {

	$("#sync_tooltip").css("bottom",(50) + "px").css("left",(-9) + "px").delay("1000").fadeOut("fast", function() {
		$(this).remove();
		clearTimeout(rotationTimer);
	});
}


/**
 * Start the account login / register animation
 *
 * @author Dennis Schneider
 */
Layout.startLoginAnimation = function()
{
	$('#account-buttons input').hide();
	$('#account-buttons #account-loader').fadeIn('slow');
	$('.error').text('');
}

/**
 * Stop the account login / register animation
 *
 * @author Dennis Schneider
 */
Layout.stopLoginAnimation = function()
{
	$('#account-buttons input').fadeIn('slow');
	$('#account-buttons #account-loader').hide();
}

/**
 * Change the sync background image from green to red
 *
 * @author Daniel Marschner
 */
function switchSyncSymbol(status)
{
	if(status == 0)
	{
		if($('span#sync').hasClass("sync_red") == false)
			$('span#sync').addClass('sync_red');

		setTimeout(function() {
			$('p#sync_tooltip').text(language.data.no_sync);
			stopSyncAnimation();
		}, 1000);
	}
	else
	{
		$('span#sync').removeClass('sync_red');
		$('p#sync_tooltip').text(language.data.sync);
	}
}

$(document).ready(function() {

	/**
	 * Init sidebar
	 *
	 * @author Daniel Marschner
	 */
	sidebar.init();
	
	/**
	 * Init the tooltips
	 *
	 * @author Daniel Marschner
	 */
	tooltip();

	/**
	 * Printing with Ctrl / Command + P
	 *
	 * @author Christian Reber,  Daniel Marschner, Dennis Schneider
	 */
	$(document).bind('keydown', shortcutkey + '+p', function (evt) {
		if(printShortcutListener == 0)
		{
			share.print();
		}

		printShortcutListener++;

		setTimeout(function() { printShortcutListener = 0 }, 50);
	});

	/**
	 * Sync with Ctrl + S
	 *
	 * @author Daniel Marschner
	 */
	$(document).bind('keydown', shortcutkey + '+s', function (evt) {
		cancelSaveTask();

        if($(register_dialog).dialog('isOpen') == false || wunderlist.isUserLoggedIn() == true)
		{
			if(syncShortcutListener == 0 && sync.isSyncing == false)
			{
				timer.stop();
				sync.fireSync();
			}

			syncShortcutListener++;

			setTimeout(function() {syncShortcutListener = 0}, 50);
		}
	});

	/**
	 * Init background Switcher
	 *
	 * @author Marvin Labod
	 * @author Daniel Marschner
	 */
	background.init();

	var $theme = Titanium.App.Properties.getString("active_theme");
	$("." + $theme).click();

    // Fixes a problem with webkit and jquery sortable icon
    document.onselectstart = function () {return false;};

	// If program has been opened 5 times, open the invite dialog
	runtime = Titanium.App.Properties.getString('runtime');
	if(runtime % 5 == 0 && invited == 'false')
	account.showInviteDialog();

	// For removing select all
	$(document).bind('keydown', shortcutkey + '+a', function (evt) {
		if ($('#note textarea:focus').length == 0 && $('input:focus').length == 0)
			return false;
	});
});
