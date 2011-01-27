var sidebar = sidebar || {};

/**
 * Initialize the sidebar position
 *
 * @author Daniel Marschner
 */
sidebar.init = function() {
	// Sidebar Position
	if(sidebar_opened_status == "true") {
		$(".togglesidebar").css("-webkit-transform","rotate(0deg)");
		$("#sidebar").css("left","0px");
		$("#lists").css("left","0px");
		$("#content").css("left","259px");
		
		$("#bottom-sidebar").css("width", "259").css("opacity","1");	
		$("#bottom-sidebar, #bottom-filters").removeClass("bottom-noborders");
		$("#macmenu").css("left", "280px");
			
	} else {
		$(".togglesidebar").css("-webkit-transform","rotate(180deg)");
		$("#sidebar").css("left","-269px");
		$("#lists").css("left","-269px");
		$("#content").css("left","0px");
		
		$("#bottom-sidebar").css("width", "0").css("opacity","0");		
		$("#bottom-sidebar, #bottom-filters").addClass("bottom-noborders");
		$("#macmenu").css("left", "20px");
	}

	sidebar.toggle();
}

/**
 * Toggle Sidebar
 *
 * @author Marvin Labod
 */
sidebar.toggle = function() {
	$(".togglesidebar").live('click', function() {

		if(sidebar_opened_status == "true") {
			$(this).css("-webkit-transform","rotate(180deg)");
			$("#sidebar").stop().animate({left: '-269'});
			$("#lists").stop().animate({left: '-269'});
			$("#content").stop().animate({left: '0'});
			
			$("#bottom-sidebar").stop().animate({width:'0', opacity:'0'});
			$("#bottom-sidebar, #bottom-filters").addClass("bottom-noborders");
			$("#macmenu").stop().animate({left: '20'});
			
			sidebar_opened_status = "false";
		} else {
			$(this).css("-webkit-transform","rotate(0deg)");
			$("#sidebar").stop().animate({left: '0'});
			$("#lists").stop().animate({left: '0'});
			$("#content").stop().animate({left: '259'});
			
			$("#bottom-sidebar").stop().animate({width:'259', opacity:'1'});
			$("#bottom-sidebar, #bottom-filters").removeClass("bottom-noborders");
			$("#macmenu").stop().animate({left: '280'});

			sidebar_opened_status = "true";
		}

	});
};

$(function() {
	var sidebarToggle = false;

	// Shortcut Bind Command(or Ctrl)+b - Hide the sidebar
	$(document).bind('keydown', shortcutkey + '+b', function (evt) {
		if(sidebarToggle == false)
		{
			sidebarToggle = true;
			$('div#right span.togglesidebar').click();
		}

		setTimeout(function()
		{
			sidebarToggle = false;
		}, 100);
	});
	
});