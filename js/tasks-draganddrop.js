/**
 * Makes all the lists a droppable element
 *
 * @author Dennis Schneider
 * @author Christian Reber
 * @author Daniel Marschner
 */
function makeListsDropable()
{
    var $droppable_items = $(".list").droppable({
		accept: ".mainlist li",
		hoverClass: "hover",
		drop: function(ev, ui)
		{
			var list   = $(this);
            var listId = list.attr("id");

            // Look for the number
            var number = list.find('span').html();

			ui.draggable.hide('fast', function() {

                // Get the task id
                taskId 		= $(this).attr('id');
				oldListId 	= $(this).attr('rel');

				list.find('span').html(parseInt(number) + 1);

				// Remove the draggable from list
				$(this).remove();

				wunderlist.updateTaskList(taskId, listId);
				wunderlist.updateCount(oldListId);
			});
		}
    });
}

/**
 * Makes the mainlist sortable
 *
 * @author Dennis Schneider
 * @author Christian Reber
 * @author Daniel Marschner
 */
function makeSortable()
{
	// Sortable Tasks
	$(".mainlist").sortable({
   		scroll: 		false,
   		delay:			100,
   		appendTo: 		'body',
   		helper: 		function(event) {
        					return $("<div class='dragging'></div>");
       					},
   		cursorAt: 		{ top: 15, left: 15 },
   		cursor: 		'pointer',
   		placeholder: 	'placeholder',
   		update: 		saveTaskPosition
    });
}

/**
 * Makes the filter list sortable
 *
 * @author Dennis Schneider
 * @author Christian Reber
 * @author Daniel Marschner
 */
function makeFilterListSortable()
{
	// Sortable Tasks on filters
	$(".filterlist").sortable({
   		scroll: 		false,
      	delay:			100,
       	appendTo: 		'body',
       	helper: 		function(event) {
        					return $("<div class='dragging'></div>");
       					},
       	cursorAt: 		{ top: 15, left: 15 },
       	cursor: 		'pointer',
		placeholder: 	'placeholder'
    });
}

/**
 * Saves the position of all tasks in a list
 *
 * @author Dennis Schneider
 * @author Christian Reber
 * @author Daniel Marschner
 */
function saveTaskPosition(event, ui)
{
    // Get all tasks from current list
    var tasks = $("#content .mainlist li");
    i = 0;

    // Call async function to update the position
    jQuery.eachAsync(tasks, {
        delay: 0,
        bulk: 0,
        loop: function()
        {
            task_id = tasks.eq(i).attr("id");
            wunderlist.updateTaskPosition(task_id, i + 1);
            i++;
        }
    });
}