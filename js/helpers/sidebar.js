var sidebar = sidebar || {};

/**
 * Initialize the sidebar
 *
 * @author Daniel Marschner, Dennis Schneider
 */
sidebar.init = function() {
	sidebar.initPosition();
	
	$(".togglesidebar").live('click', function() {
		sidebar.setPosition();
	});	
};

/**
 * Initialize the sidebar position
 *
 * @author Dennis Schneider, Marvin Labod
 */
sidebar.initPosition = function() {
	// Sidebar Position	
	if (settings.getSidebarPosition() == "right")
	{		
		$("body").removeClass("sidebarleft");
		
		// Sidebar Position Left
		if (settings.sidebar_opened_status == "true")
		{
			$(".togglesidebar").removeClass("hidden");
			$("#sidebar").css("left","auto").css('right', '0px');
			$("#lists").css("left","auto").css('right', '0px');
			$("#content").css("left","0px").css('right', '259px');			
		} 
		else 
		{
			$(".togglesidebar").addClass("hidden");
			$("#sidebar").css("left", "auto").css('right', '-269px');
			$("#lists").css("left", "auto").css('right', '-269px');
			$("#content").css("left", "0px").css('right', '0px');						
		}
	}
	else if (settings.getSidebarPosition() == "left") 
	{	
		$("body").addClass("sidebarleft");

		if (settings.sidebar_opened_status == "true") 
		{
			$(".togglesidebar").removeClass("hidden");
			$("#sidebar").css("right", "auto").css('left', '0px');
			$("#lists").css("right", "auto").css('left', '0px');
			$("#content").css("right", "0px").css('left', '259px');						
		} 
		else 
		{	
			$(".togglesidebar").addClass("hidden");			
			$("#sidebar").css("right", "auto").css('left', '-269px');
			$("#lists").css("right", "auto").css('left', '-269px');
			$("#content").css("right", "0px").css('left', '0px');					
		}
	}
};

/**
 * Set the sidebar position based on the settings
 *
 * @author Dennis Schneider
 */
sidebar.setPosition = function() {
	if (settings.getSidebarPosition() == "right") 
	{
		$("body").removeClass("sidebarleft");
		
		// Sidebar Position Left
		if (settings.sidebar_opened_status == "true") {
			$(".togglesidebar").addClass("hidden");
			$("#sidebar").stop().animate({right: '-269'});
			$("#lists").stop().animate({right: '-269'});
			$("#content").stop().animate({right: '0'});
			settings.sidebar_opened_status = "false";		
		} 
		else 
		{
			$(".togglesidebar").removeClass("hidden");
			$("#sidebar").stop().animate({right: '0'});
			$("#lists").stop().animate({right: '0'});
			$("#content").stop().animate({right: '259'});
			settings.sidebar_opened_status = "true";		
		}
	}
	else if (settings.getSidebarPosition() == "left") 
	{
		$("body").addClass("sidebarleft");

		if (settings.sidebar_opened_status == "true") {
			$(".togglesidebar").addClass("hidden");
			$("#sidebar").stop().animate({left: '-269'});
			$("#lists").stop().animate({left: '-269'});
			$("#content").stop().animate({left: '0'});								
			settings.sidebar_opened_status = "false";		
		} 
		else 
		{
			$(".togglesidebar").removeClass("hidden");
			$(this).css("-webkit-transform","rotate(0deg)");
			$("#sidebar").stop().animate({left: '0'});
			$("#lists").stop().animate({left: '0'});
			$("#content").stop().animate({left: '259'});
			settings.sidebar_opened_status = "true";			
		}
	}
};