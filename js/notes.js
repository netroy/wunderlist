$(function() {
	
	var noteIcons = $(".note");
	var listItems = $("#lists");
	var note = $("#note textarea");
	
	note.hide();
			
	// CLICK
	noteIcons.live("click", function(){
							
		if($(this).hasClass("hasnote")) {
		
			$(this).removeClass("hasnote");
			note.text("").hide();
			listItems.show();
		
		} else {
		
			listItems.hide();
			note.text("sdf khjsdgfkjh gsdjkhfg sdjkhfg kjshdg fkjhsgd fkjhsgdkjfhgsdkjhfg").show();
			noteIcons.removeClass("hasnote");
			$(this).addClass("hasnote");
		}
		
	});
});