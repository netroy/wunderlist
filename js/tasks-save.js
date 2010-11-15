var focusOutEnabled = true;
var totalFocusOut   = false;
var datePickerOpen  = false;
var dateBeforEdit   = '';

/**
 * Saves a task to the database
 *
 * @author Dennis Schneider, Christian Reber, Daniel Marschner
 */
function saveTask()
{
	focusOutEnabled = false;

    $newtitle         = convertStringForDB($('#task-edit').val());
	$task_id          = $('#task-edit').parent().attr("id");
	$datepicker       = $('#task-edit').parent().find('.datepicker');
	$datepicker_image = $('#task-edit').parent().find('img.ui-datepicker-trigger');
	$date             = $('#task-edit').parent().find('span.timestamp').attr('rel');

	if($date == undefined) $date = 0;

	$('#task-edit').parent().find('.description').html(unescape($newtitle));
	$('#task-edit').parent().find('.description').show();

	if($date == '') $date = 0;

	$("span.fav").show();
	$("span.favina").show();

	$datepicker.remove();
	$datepicker_image.remove();
	$('#task-edit').remove();

	wunderlist.updateTask($task_id, $newtitle, $date);
	filters.updateBadges();

    focusOutEnabled = true;
}

/**
 * Cancel saving the task
 *
 * @author Dennis Schneider, Christian Reber, Daniel Marschner
 */
function cancelSaveTask()
{
	focusOutEnabled = false;

    var listElement = $('#task-edit').parent();

    listElement.children('.datepicker').remove();
	listElement.children('img.ui-datepicker-trigger').remove();
	listElement.children('input#task-edit').remove();

    if(listElement.has('span.timestamp'))
        listElement.children('span.timestamp').replaceWith(dateBeforEdit);

    listElement.children('span.fav').show();
	listElement.children('span.favina').show();
    listElement.children('span.description').show();

    focusOutEnabled = true;
}

/**
 * Initialize saving tasks
 *
 * @author Dennis Schneider, Christian Reber, Daniel Marschner
 */
$(function()
{

	// DoubleClick on Task - Edit mode
    $('.mainlist li .description').live('dblclick', function()
	{
        var timestampElement = $(this).parent().children('span.timestamp');

        if(timestampElement.is('span'))
            dateBeforEdit = timestampElement.clone();
        else
            dateBeforEdit = '';

        var doneIsActive = ($('div#left a#done.active').length == 1);

		// Überprüfen ob der Edit Modus bereits aktiviert ist
		if($('#task-edit').length == 0 && doneIsActive == false)
		{
			var spanElement = $(this);
            var liElement   = spanElement.parent();

            timer.pause();

			liElement.children("span.fav").hide();
			liElement.children("span.favina").hide();

			// Get input values
			titleText = spanElement.text();
            spanElement.hide();

			html  = '<input type="text" id="task-edit" value="' + titleText + '" />';
			html += '<input type="hidden" class="datepicker title="' + language.data.choose_date + '" />';

			// Edit the Actual task into an edit task
			liElement.children(".checkboxcon").after(html);
			$("input#task-edit").focus();

			createDatepicker();

			totalFocusOut = false;
		}
    });

    $('html').live('click', function(event) {
        var editInput = $('input#task-edit');

        if(editInput.is('input'))
        {
            var clickedElement = $(event.target);

            if(clickedElement.attr('id') != 'task-edit' && datePickerOpen == false) {
                if(editInput.val().length > 0)
                    saveTask();
            }
        }
    });

    // Save edited Task
    $('#task-edit').live('keyup', function(e) {
        if(e.keyCode == 13)
		{
			saveTask();
			timer.resume();
		}
		else if(e.keyCode == 27)
		{
			totalFocusOut = false;
            cancelSaveTask();
			timer.resume();
		}
	});

});