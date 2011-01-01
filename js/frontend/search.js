var Search = Search || {};

var cancelEditTask = false;

$(document).ready(function() {

	// Empty Input Field
	$(".searchside .clearsearch").click(function() {
		openList(1);
		$("input#search").val('').blur();
	});


	// Bind search
	$("input#search").keyup(function(event) {
		if(event.keyCode == 13)
		{
			if($(this).val() != '')
			{
				$value = $(this).val();
				wunderlist.liveSearch($value);
				make_timestamp_to_string();
			}
			else
			{
				openList(1);
			}
		}
		else if($(this).val() != '')
		{
			$("a.list").droppable({ disabled: false });

			$value = $(this).val();
			wunderlist.liveSearch($value);
			make_timestamp_to_string();
		}
		else
		{
			if(focusSearch == 0)
                openList(1);
		}

		$('#left a').removeClass('active');
	});

    var focusSearch = 0;

	// Shortcut Bind Command(or Ctrl)+F - Search
	$(document).bind('keydown', shortcutkey + '+f', function (evt) {
		cancelSaveTask();

        focusSearch++;

        if(focusSearch == 1)
            $('input#search').focus();

        setTimeout(function() { focusSearch = 0; }, 1000);
	});


	var documentEscapeActive = false;
	
	// Shortcut Bind Esc - Go to my tasks
	$(document).bind('keydown', 'Esc', function (evt) {
		if(($(register_dialog).dialog('isOpen') == false || wunderlist.isUserLoggedIn()) && documentEscapeActive == false)
		{
			documentEscapeActive = true;
			
			if($('div.add .input-add:focus').length == 0 && $('#task-edit:focus').length == 0 && !cancelEditTask && $('#lists a.list input').length == 0 && $('#note textarea:focus').length == 0 && $('#note textarea').css('display') == 'none')
			{
				openList(1);
				$("#left a").removeClass("active");
				$("input#search").val('').blur();
			}
			else if($('#note textarea:focus').length == 1 || $('#note textarea').css('display') == 'block')
			{
				$('div#note a#cancel-note').click();
			}
			else
			{
				cancelSaveTask();
				cancelEditTask = true;
			}
			setTimeout(function() {cancelEditTask = false;documentEscapeActive = false}, 1000);
		}
	});

});

Search.clear = function() {
	$('#search').val('');
}
