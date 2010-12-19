$(function() {
	$(".mainlist li").each(function() {
	
		var noteIcon = $(this).find(".note");
		var noteIcons = $(".note");
		var listItems = $("#lists a.list");
		var note = $("#note");
		
		// CLICK
		noteIcon.click(function(){
				noteIcons.hide();
				listItems.hide();
				note.show();
				noteIcon.addClass("activenote");
		});
	});
});