$(function()
{
    // Fav remove
    $(".mainlist span.fav").live("click", function()
    {
    	var done_is_active = ($('#bottombar #left a#done.active').length == 1);
    	if(done_is_active == false)
		{
			// Get the last favourite task
			$item = $('#list').find('span.fav:last').parent();

	        $(this).addClass("favina").removeClass("fav");

	        // Get the task id
	        $task_id = $(this).parent().attr("id");

	        if($(this).parent().attr("id") != $item.attr("id")) {

	        	$(this).parent().slideUp('fast', function() {

	        		$(this).insertAfter($item).slideDown();

	        	});
	        }

	        // Make this task important
	        wunderlist.setUnimportant($task_id);
  			saveTaskPosition();
 		}

    });

    // Fav add
    $(".mainlist span.favina").live("click", function()
	{
		var done_is_active = ($('#bottombar #left a#done.active').length == 1);
    	if(done_is_active == false)
    	{
			// Get the last favourite task
			if($('#list li span:first').hasClass('fav'))
				$item = $('#list').find('span.fav:last').parent();
			else
				$item = $('#list').find('span:first').parent();

			// Search favourite spans (only in mainlist!)
			$favcount 	= $('.mainlist span.fav').length;
	        $task_id 	= $(this).parent().attr("id");

	        $(this).removeClass("favina").addClass("fav");

        	$(this).parent().slideUp('fast', function() {

        		$(this).prependTo("#list").slideDown();
        	});

	        // Make this task important
	        wunderlist.setImportant($task_id);
        }
    });

});