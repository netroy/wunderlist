var taskDroped = false;

/**
 * Makes all the lists a droppable element
 *
 * @author Dennis Schneider, Christian Reber, Daniel Marschner
 */
makeListsDropable = function() {
    $('.list').droppable({
		accept     : 'ul.mainlist li',
		hoverClass : 'hover',
		drop       : function(ev, ui) {
			taskDroped = true;
			
			var list_id  = $(this).attr('id').replace('list','');
			
			ui.draggable.hide('fast', function() {
				task.id      = $(this).attr('id');
				task.list_id = list_id;
				task.updateList();
				task.update();
			});
		}
    });
};

/**
 * Make the filters starred, today and tomorrow droppable for tasks
 *
 * @author Daniel Marschner
 */
makeFilterDropable = function() {
	$('a.filter').droppable({
		accept     : 'ul.mainlist li',
		hoverClass : 'droppable',
		drop       : function(ev, ui) {
			var taskID                 = ui.draggable.attr('id');
			var droppedTask            = $('li#' + taskID);
			var droppedTaskParent      = ($('ul.filterlist').length > 0 ? $('ul#filterlist' + droppedTask.attr('rel')) : $('ul#' + droppedTask.attr('rel')));
			var activeFilter           = droppedTaskParent.attr('rel');
			var droppedFilter          = $(this).attr('id');
			var today                  = html.getWorldWideDate();
			var tomorrow               = (today + 86400);
			var droppedTaskDate        = droppedTask.children('span.showdate');
			var droppedTaskDateInput   = droppedTask.children('input.datepicker');
			var droppedTaskDateTrigger = droppedTask.children('.ui-datepicker-trigger');
			var acceptFilter           = false;
			
			// UPDATE task by dropping on filter starred
			if (droppedFilter == 'starred')
			{
				acceptFilter = true;
				
				if (activeFilter != 'starred' || !isNaN(parseInt(activeFilter)))
				{
					if (droppedTask.children('span.favina').length == 1)
					{
						task.id        = taskID;
						task.important = 1;
						task.updateImportant();
						task.update();
					}
				}
			}
			
			// UPDATE task by dropping on filter today
			if (droppedFilter == 'today')
			{
				acceptFilter = true;
				
				if (activeFilter != 'today' || !isNaN(parseInt(activeFilter)))
				{
					if (droppedTaskDate.hasClass('timestamp') == false || droppedTaskDate.attr('rel') != today)
					{
						if (droppedTaskDate.length == 0) {	
												
							droppedTaskDateInput.remove();
							droppedTaskDateTrigger.remove();
							droppedTask.children('.description').after('<span class="showdate timestamp" rel="' + today + '">&nbsp;</span>');
								
						} else {
							droppedTaskDate.addClass('timestamp').attr('rel', today);
						}
						
						task.id   = taskID;
						task.date = today;
						task.update();
						
						html.make_timestamp_to_string();
					}

				}
			}
			
			// UPDATE task by dropping on filter tomorrow
			if (droppedFilter == 'tomorrow')
			{
				acceptFilter = true;
														
				if (activeFilter != 'tomorrow' || !isNaN(parseInt(activeFilter)))
				{
					if (droppedTaskDate.hasClass('timestamp') == false || droppedTaskDate.attr('rel') != tomorrow)
					{
					
						if (droppedTaskDate.length == 0) {	
												
							droppedTaskDateInput.remove();
							droppedTaskDateTrigger.remove();
							droppedTask.children('.description').after('<span class="showdate timestamp" rel="' + tomorrow + '">&nbsp;</span>');
								
						} else {
							droppedTaskDate.addClass('timestamp').attr('rel', tomorrow);
						}					
						
						task.id   = taskID;
						task.date = tomorrow;
						task.update();
						
						html.make_timestamp_to_string();
					}
				}
			}
			
			// UPDATE task by dropping on filter withoutdate
			if (droppedFilter == 'withoutdate')
			{
				acceptFilter = true;
				
				if (activeFilter != 'withoutdate' || !isNaN(parseInt(activeFilter)))
				{
					if (droppedTaskDate.hasClass('timestamp') == true)
					{											
						droppedTaskDate.remove();
						droppedTask.children('.description').after("<input type='hidden' class='datepicker'/>");
						html.createDatepicker();
						
						task.id   = taskID;
						task.date = 0;
						task.update();
					}
				}
			}
			
			if ($('ul.filterlist').length > 0 && acceptFilter == true)
			{				
				if ((droppedFilter != 'starred' && activeFilter != 'thisweek' && activeFilter != 'all' && activeFilter != droppedFilter) || 
				    (activeFilter == 'thisweek' && droppedFilter == 'withoutdate'))
				{
					if (droppedTaskParent.children('li').length == 2)
					{
						droppedTaskParent.prev().remove();
						droppedTaskParent.remove();
					}	
					
					droppedTask.remove();
				}
			}
		}
    });
};

/**
 * Makes the mainlist sortable
 *
 * @author Dennis Schneider, Christian Reber, Daniel Marschner
 */
makeSortable = function() {
	// Sortable Tasks
	$("ul.sortable").sortable({
   		scroll      : true,
		containment : 'document',
   		delay       : 100,
   		appendTo    : 'body',
   		helper      : function() { return $("<div class='dragging'></div>"); },
   		cursorAt    : {top : 15, left : 15},
   		cursor      : 'pointer',
   		placeholder : 'placeholder',
   		update      : function(ev, ui) {
   			task.updatePositions();
   		}
    });
};

$(function() {
	
	$(document).mousemove(function(e) {
		if ($('.dragging').size() > 0) {
			var currentOffset = $('#content').scrollTop();
			var height = $(document).height();
			if (e.pageY < 100) {
				$('#content').scrollTop(currentOffset - 50);
			} else if (e.pageY > (height - 100)) {
				$('#content').scrollTop(currentOffset + 50);
			}
		}	
	});
	
});

