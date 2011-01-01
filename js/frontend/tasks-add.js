var totalFocusOut = false;

// Save the task
function saveNewTask()
{
	if($("input.input-add").val() != '')
	{
		// Add Task to List
		list_id   = $(".mainlist").attr("rel");
		task_text = convertStringForDB($("input.input-add").val()); // TODO: Hier muss escaped werden z.b. '' oder ""
		
		if(task_text != '')
		{
			timestamp = $(".add .showdate").attr('rel');

			if(timestamp == undefined) timestamp = 0;

			var last_insert_id = wunderlist.createTask(task_text, list_id, timestamp);
			filters.updateBadges();

			$html  = "<li rel='" + list_id + "' id='" + last_insert_id + "'>";
			$html += "<div class='checkboxcon'>";
			$html += "<input class='input-checked' type='checkbox'/>";
			$html += "</div>";
			$html += "<span class='icon favina'></span>";
			$html += "<span class='description'>" + unescape(task_text) + "</span>";

			if(timestamp != '')
				$html += "<span class='showdate timestamp' rel='" + timestamp + "'></span>";
			else
				$html += "<span class='showdate'></span>";

			$html += "<span class='icon delete' title='delete task'></span>";
			$html += "<span class='icon note' title='notes'></span>";
			$html += "</li>";

			$(".mainlist").append($html);
			$("input.input-add").val('');
			$(".add .showdate").remove();
			makeSortable();

			totalFocusOut = false;

			// Reset DatePicker
			$('.datepicker').val('');
			make_timestamp_to_string();

			Titanium.Analytics.featureEvent('task.added', {
				'time':(new Date()).toString()
			});
		}
		else
		{
			$("input.input-add").val('');
		}
	}
}

// Add Task Bind Functions
$(function() {

	// Add Task by hitting Enter
	$("div.add input").live('keyup', function(e)
	{
		timer.pause();
		// If not empty and Return gets pressed, new task will be added
		if(e.keyCode == 13)
		{
			saveNewTask();
			timer.resume();
		}
		// If ESC gets pressed, close Add Task
		else if(e.keyCode == 27)
		{
			totalFocusOut = false;
			isEdit = false;
			timer.resume();
		}

	});

	$("div.add input").live('keydown', 'Esc', function (evt) {
		if(evt.keyCode == 27) {
	  		$(this).val('');
	  		$('div.add span.timestamp').remove();

			$(this).blur();
			timer.resume();
  		}
	});

	$(".add input").live('focusout', function () {
		if($(this).val() == '')
			timer.resume();
	});

	// Shortcut Bind Command (or Ctrl) + N - Add new task
	$(document).bind('keydown', shortcutkey + '+n', function (evt) {
		cancelSaveTask();

        if($(register_dialog).dialog('isOpen') == false || wunderlist.isUserLoggedIn() == true)
			$('.add input.input-add').focus();
	});

	// Shortcut Bind Command (or Ctrl) + T - Add new task
	$(document).bind('keydown', shortcutkey + '+t', function (evt) {
		cancelSaveTask();

        if($(register_dialog).dialog('isOpen') == false || wunderlist.isUserLoggedIn() == true)
			$('.add input.input-add').focus();
	});

});
