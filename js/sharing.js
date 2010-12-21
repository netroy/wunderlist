/**
 * open Sharing Dialog
 *
 * @author Marvin Labod
 */

function openShareListDialog() {
	openDialog(generateDialog('Share List', generateShareListDialogHTML(), 'dialog-sharelist'));
}

$(function() {

	// Open Share Dialog
	$(".sharep").click(function(){
		openShareListDialog();
	});

	// Delete Button for remove Sharing for a single E-Mail
	$(".dialog-sharelist li span").live("click", function(){
		$(this).parent().remove();
		
		var shareListItems = $(".sharelistusers").children("li");
		
		if(shareListItems.length == 0) {
			$("p.invitedpeople").remove();
		}
	});
	
	// Hitting Enter on Input Field
	$(".input-sharelist").live("keydown", function(event){
		if(event.keyCode == 13) {
			
			var shareList = $(".sharelistusers");
			var shareListItems = shareList.children("li");
			
			var email = $(this).val();
			$(this).val("");
			
			shareList.append("<li><span></span> "+ email +"</li>");
						
			if(shareListItems.length == 0) {
				shareList.before("<p class='invitedpeople'><b>Currently invited people</b></br></p>");
			}
		}
	});
});