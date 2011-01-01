var deleteTaskDialog;

$(function() {

	// Delete Button Mouse Over
	$(".mainlist li, .donelist li").live('mouseover', function () {

		description  = $(this).find("span.description");
		deletebutton = $(this).find('.delete');

		if(description.length == 1) {
			deletebutton.show();
		}
		else {
			deletebutton.hide();
		}

	});

	$(".mainlist li, .donelist li").live('mouseout', function () {
		$(this).find('.delete').hide();
	});

	// Delete function for the clicked task
    $(".delete").live('click', function() {
		var deleteElement = $(this);

        if (deleteTaskDialog == undefined || deleteTaskDialog.dialog('isOpen') == false)
        {
            var buttonsDeleteTask = {};
        	buttonsDeleteTask[language.data.delete_task_no]  = function() { $(this).dialog('close') };
        	buttonsDeleteTask[language.data.delete_task_yes] = function() {

        		var liElement = deleteElement.parent();
				var ulElement = liElement.parent();
				var taskId    = liElement.attr('id');
        		var listId    = liElement.attr('rel');

                if (ulElement.children('li').length == 1 && liElement.find('.checked').length == 1)
        		{
        			var hElement = ulElement.prev();

                    if (hElement.is('h3'))
                        hElement.remove();

        			ulElement.remove();
        		}

                liElement.remove();

                wunderlist.deleteTaskById(taskId, listId);
        		filters.updateBadges();

        		closeDialog(deleteTaskDialog);
        	};

            deleteTaskDialog = $('<div></div>')
        		.dialog({
        			autoOpen: false,
        			draggable: false,
        			dialogClass: 'dialog-delete-task',
        			title: language.data.delete_task_question,
        			buttons: buttonsDeleteTask,
        			open: function(event, ui) {
        				$('.ui-dialog-buttonset button:last').focus();
        			}
        	});

            openDialog(deleteTaskDialog);
        }
	});

});
