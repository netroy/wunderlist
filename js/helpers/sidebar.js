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
		$("#sidebar").css("right","0px");
		$("#lists").css("right","0px");
		$("#content").css("right","239px");
	} else {
		$(".togglesidebar").css("-webkit-transform","rotate(180deg)");
		$("#sidebar").css("right","-249px");
		$("#lists").css("right","-249px");
		$("#content").css("right","0px");
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
			$("#sidebar").stop().animate({right: '-249'});
			$("#lists").stop().animate({right: '-249'});
			$("#content").stop().animate({right: '0'});
			sidebar_opened_status = "false";
		} else {
			$(this).css("-webkit-transform","rotate(0deg)");
			$("#sidebar").stop().animate({right: '0'});
			$("#lists").stop().animate({right: '0'});
			$("#content").stop().animate({right: '239'});
			sidebar_opened_status = "true";
		}

	});
};