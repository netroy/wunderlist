var Search = Search || {};

var cancelEditTask = false;
var focusSearch    = 0;

$(document).ready(function() {

	// Empty Input Field
	$(".searchside .clearsearch").click(function() {
		wunderlist.frontend.lists.openList(1);
		$("input#search").val('').blur();
	});


	// Bind search
	$("input#search").keyup(function(event) {
		if(event.keyCode == 13) {
			if($(this).val() != '') {
				$value = $(this).val();
				wunderlist.database.search($value);
				html.make_timestamp_to_string();
			} else {
				wunderlist.frontend.lists.openList(1);
			}
		} else if($(this).val() != '') {
			$("a.list").droppable({ disabled: false });

			$value = $(this).val();
			wunderlist.database.search($value);
			html.make_timestamp_to_string();
		} else {
			if(focusSearch === 0){
			  wunderlist.frontend.lists.openList(1);
			}   
		}

		$('#left a').removeClass('active');
	});
});

Search.clear = function() {
	$('#search').val('');
}
