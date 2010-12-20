/**
 * Note Functionality
 *
 * @author Marvin Labod
 */

$(function() {
	
	var noteIcons = $(".note");
	var listItems = $("#lists");
	var note = $("#note textarea");
	
	var noteContent = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum";
	
	// Hide Note initially
	note.hide();
			
	// Click on Note Icon
	noteIcons.live("click", function(){
		
		note.html(noteContent);
							
		if($(this).hasClass("activenote")) {
		
			listItems.toggle();
			note.toggle();
			$(this).toggleClass("activenote");
		
		} else {
		
			listItems.hide();
			note.show();
			noteIcons.removeClass("activenote");
			$(this).addClass("activenote");
		}
		
	});
});