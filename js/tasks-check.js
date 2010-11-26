$(function()
{
	var checkClicked = 0;

    $('.checkboxcon').live('click', function(event)
	{
        checkClicked++;

        if(checkClicked == 1)
        {
            //cancelSaveTask();

            $(this).toggleClass("checked");

            is_checked = $(this).hasClass("checked");

        	$(this).parent().toggleClass('done');

            $task_id = $(this).parent().attr("id");
            $list_id = $("ul#list").attr("rel");

			// If it is not checked, check and append to done list
            if(is_checked)
            {
                wunderlist.taskDone($task_id, $list_id);

				// If it is not the search side, create a done list at the bottom
				if($('ul.search').length == 0)
				{
					if($("#donelist_list_today").length == 0) {
						$(".mainlist").after("<h3 class='head_today'>" + language.data.done_today + "</h3>");
						$("#content h3.head_today").after("<ul id='donelist_list_today' class='donelist'></ul>")
					}

					$(this).parent().slideUp('fast', function() {
						$(this).prependTo("#donelist_list_today").slideDown();
					});
				}
				// On the search side, just append the checked task to the end of the mainlist
				else
				{
					$(this).parent().slideUp('fast', function() {
						$(this).appendTo(".mainlist").slideDown();
					});									
				}
      		}
      		// If is already checked, append to upper list
            else
            {
                wunderlist.taskUndone($task_id, $list_id);

                make_timestamp_to_string();

                $countli = $(this).parent().parent(".donelist").find("li");

    			var done_is_active = ($('div#filter a#done.active').length == 1);
    			if(done_is_active)
    			{
    				$(this).parent().remove();
    				return;
    			}

                if($countli.length == 1)
    			{
                	$(this).parent().parent().prev().remove();
                	$(this).parent().parent().remove();
                }

                $(this).parent().slideUp('fast', function()
    			{
                	if($(this).find("span.fav").length == 1)
    				{
                		$(this).prependTo(".mainlist").slideDown();
                	}
                	else
    				{
    					$(this).appendTo(".mainlist").slideDown();
    				}

      			});
           	}

			filters.updateBadges();
         }

         setTimeout(function() { checkClicked = 0; }, 100);
    });

});
