var tasks = tasks || {};

tasks.checkClicked    = false;
tasks.focusOutEnabled = true;
tasks.totalFocusOut   = false;
tasks.datePickerOpen  = false;
tasks.dateBeforEdit   = '';
tasks.addNewTaskToTop = false;

// ADD a new task to the db and frontend
tasks.add = function() {
	if ($("input.input-add").val() != '')
	{
		// Add Task to List
		list_id       = $("ul.mainlist").attr("rel");
		task_name     = wunderlist.database.convertString($("input.input-add").val());
		
		// Tasks default not be important
		var important = 0;
		
		// Check if task should be prio
		if (task_name.indexOf('*') == 0) {
			task_name = task_name.substr(1);
			important = 1;
		}
		
		// Trim whitespace
		task_name = $.trim(task_name);
		
		// Init timestamp & scan for the date
		var timestamp = 0;
		var smartDate = wunderlist.smartScanForDate(task_name);
		
		// Process the smartDate results
		if (smartDate.timestamp && smartDate.string) {
			timestamp	= smartDate.timestamp;
			task_name	= smartDate.string;
			/*
		    var day             = smartDate['day'];
		    var monthName       = smartDate['month'];
		    var year            = smartDate['year'];
		    var smartDateObject = new Date();
		    var monthNumber     = html.getMonthNumber(monthName);
		    smartDateObject.setMonth(monthNumber);
		    smartDateObject.setDate(day);
		    smartDateObject.setFullYear(year);
		    timestamp           = html.getWorldWideDate(smartDateObject);
		    task_name           = smartDate['string'];
			*/
		}
		
		if (task_name != '')
		{
		    if (timestamp == 0)
		    {
			    timestamp = $(".add .showdate").attr('rel');
			}

			if (timestamp == undefined)
				timestamp = 0;
			
			important = important || 0;
			
			if (isNaN(parseInt(list_id)) || $('#left a.active').length == 1)
			{
				var activeFilter = $('#left a.active');
				
				if (list_id == 'today' || activeFilter.attr('id') == 'today')
					timestamp = html.getWorldWideDate();
				else if (list_id == 'tomorrow' || activeFilter.attr('id') == 'tomorrow')
					timestamp = html.getWorldWideDate() + 86400;
				else if (list_id == 'starred' || activeFilter.attr('id') == 'starred')
					important = 1;
				
				// On Filters set it to the inbox
				list_id = 1;
			}
			
			task.name      = task_name;
			task.list_id   = list_id;
			task.date      = timestamp;
			task.important = important;
			
			var task_id  = task.insert();	
			
			var taskHTML = html.generateTaskHTML(task_id, task_name, list_id, 0, important, timestamp);
			
			if ($("ul.filterlist").length > 0 || $('#left a.active').length == 1)
			{
				var ulElement = $('ul#filterlist' + list_id);
				
				if (ulElement != undefined && ulElement.is('ul'))
					if (tasks.addNewTaskToTop) {
						ulElement.prepend(taskHTML).find('li:first').hide().fadeIn(225);
					} else {
						ulElement.append(taskHTML).find('li:last').hide().fadeIn(225);
					}
				else
				{
					listHTML  = '<h3 class="clickable cursor" rel="' + list_id + '">' + $('a#list' + list_id + ' b').text() + '</h3>';
					listHTML += '<ul id="filterlist' + list_id + '" rel="' + ulElement.attr('rel') + '" class="mainlist sortable filterlist">' + taskHTML + '</ul>';
					
					// If adding to inbox in filter view, the inbox should be inserted before any other list
					var theLists = wunderlist.database.getLists(list_id);
					if (theLists[0].inbox == 1) {
						$('div#content .add').after(listHTML);
					} else {
						$('div#content').append(listHTML);
					}
				}
			}
			else
			{
				// ORDINARY LIST
				if (tasks.addNewTaskToTop) {
					$("ul.mainlist").prepend(taskHTML).find("li:first").hide().fadeIn(225);
				} else {
					$("ul.mainlist").append(taskHTML).find("li:last").hide().fadeIn(225);
				}
				html.createDatepicker();
			}
			
			
			$("input.input-add").val('');
			$(".add .showdate").remove();

			tasks.totalFocusOut = false;

			// Reset DatePicker
			$('.datepicker').val('');
			
			makeSortable();
			filters.updateBadges();
			html.make_timestamp_to_string();
			
			if (tasks.addNewTaskToTop) {
				task.updatePositions();
				task.addNewTaskToTop = false;
			}
		}
		else
			$("input.input-add").val('');
	}
};

/**
 * Saves a task to the database
 *
 * @author Dennis Schneider, Christian Reber, Daniel Marschner, Marvin Labod
 */
tasks.edit = function() {
	tasks.focusOutEnabled = false;

    var task_name = $('#task-edit').val();
	var task_id   = $('#task-edit').parent().attr('id');
	
	$('#task-edit').parent().find('.description').html(wunderlist.replace_links(unescape(task_name))).show();
	$('#task-edit').remove();
	
	task.id   = task_id;
	task.name = wunderlist.database.convertString(task_name);
	task.update();

	filters.updateBadges();

	$('html').find('.description').html();

    tasks.focusOutEnabled = true;
};

/**
 * Cancel the edit mode of a task
 *
 * @author Dennis Schneider, Christian Reber, Daniel Marschner, Marvin Labod
 */
tasks.cancel = function() {
	tasks.focusOutEnabled = false;

    var listElement = $('#task-edit').parent();
	listElement.children('input#task-edit').remove();
    listElement.children('span.description').show();
};

/**
 * Delete a task from the list
 *
 * @author Dennis Schneider, Daniel Marschner
 */
tasks.deletes = function(deleteElement) {
	var liElement = deleteElement.parent();
	
	task.id      = liElement.attr('id');
	task.list_id = liElement.attr('rel');
	task.deleted = 1;
	task.updateDeleted();
	task.update();
};

// On DOM ready
$(function() {
	// Add task by hitting Enter
	$("div.add input").live('keyup', function(e) {
		wunderlist.timer.pause();
		var aimSetting = parseInt(Titanium.App.Properties.getString('add_item_method', '0'));
		
		// If not empty and Return gets pressed, new task will be added
		if(e.keyCode == 13 && aimSetting == 0)
		{
			tasks.add();
			wunderlist.timer.resume();
		}
		// If ESC gets pressed, close Add Task
		else if(e.keyCode == 27)
		{
			tasks.totalFocusOut = false;
			isEdit = false;
			wunderlist.timer.resume();
		}
	});
	
	shortcut.add(settings.shortcutkey + '+enter', function (e) {
		if ( $('div.add input:focus').size() > 0 ) {
			tasks.addNewTaskToTop = true;
			tasks.add();
			tasks.addNewTaskToTop = false;
		}
	});

	$("div.add input").live('keydown', 'Esc', function (evt) {
		if(evt.keyCode == 27) {
	  		$(this).val('');
	  		$('div.add span.timestamp').remove();

			$(this).blur();
			wunderlist.timer.resume();
  		}
	});
	
	// DoubleClick on Task - Edit mode
    $('.mainlist li .description').live('dblclick', function() {
        var liElement = $(this).parent('li');
		
		if (liElement.hasClass('done') == false)
		{
			var timestampElement = liElement.children('span.timestamp');
	        var doneIsActive     = ($('div#left a#done.active').length == 1);

			// Check if edit mode has already been activated
			if($('#task-edit').length == 0 && doneIsActive == false)
			{
				var spanElement = $(this);
	            var liElement   = spanElement.parent();

	            wunderlist.timer.pause();

				// Get input values
				titleText = spanElement.text();
	            spanElement.hide();

				var html_code  = '<input type="text" id="task-edit" value="" />';

				// Edit the Actual task into an edit task
				liElement.children(".checkboxcon").after(html_code);

				$('input#task-edit').val(titleText);
				$("input#task-edit").select();

				tasks.totalFocusOut = false;
			}
		}
    });
    
    // Initiate The Datepicker when clicking an existing Date
    $('.mainlist li .showdate').live('click', function() {
    	var object  = $(this).parent();
    	description = $(this).parent().find(".description");
    	dateInput   = $(this).parent().find(".datepicker");

    	description.after("<input type='hidden' class='datepicker'/>");
		
    	html.createDatepicker();
		
		datePickerInput = $(this).parent().find(".datepicker");
		datePickerImage = $(this).parent().find(".ui-datepicker-trigger");
    	
    	datePickerImage.click().remove();
    	
		// This is the Friday night hack to remove the doubled datepicker
		// :) Thank you ladies and gentlemen!
    	setTimeout(function() {
    		if (object.find("input.hasDatepicker").length == 2)
    			object.find("input.hasDatepicker").eq(0).remove();
    	}, 100);
    });

	// Save The Task on a click elsewhere
    $('html').live('click', function(event) {
        var editInput = $('input#task-edit');

        if(editInput.is('input'))
        {
            var clickedElement = $(event.target);

            if(clickedElement.attr('id') != 'task-edit')
			{
                if(editInput.val().length > 0)
				    tasks.edit();
            }
        }
    });

    // Save edited Task
    $('#task-edit').live('keyup', function(e) {
        if(e.keyCode == 13)
		{
			tasks.edit();
			wunderlist.timer.resume();
		}
		else if(e.keyCode == 27)
		{
			tasks.totalFocusOut = false;
            tasks.cancel();
			wunderlist.timer.resume();
		}
	});

	$(".add input").live('focusout', function () {
		if($(this).val() == '') {
			
			wunderlist.timer.resume();
		}
	});
	
	// Do the check or uncheck a task magic
	$('.checkboxcon').live('click', function(event) {
        if(tasks.checkClicked == false)
        {
            tasks.checkClicked = true;
            
            $(this).toggleClass("checked");

            var is_checked = $(this).hasClass("checked");
							
        	task.id      = $(this).parent().attr("id");
            task.list_id = $(this).parent().attr("rel").replace('list', '');

			// If it is not checked, check and append to done list
            if(is_checked)
            {
				task.done      = 1;
				task.done_date = html.getWorldWideDate();	
      		}
      		// If is already checked, append to upper list
            else
            {
				task.done      = 0;
				task.done_date = 0;
           	}
			
			task.updateDone();
			task.update();
         }

         setTimeout(function() { tasks.checkClicked = false; }, 100);
    });
    
    // Make this task unimportant
    $("ul.mainlist span.fav").live("click", function() {
    	if($('a#done.active').length == 0)
		{
			// Make this task unimportant
	        task.id        = $(this).parent('li').attr("id");
	        task.important = 0;
	        task.updateImportant();
	        task.update();
	        task.updatePositions();
		}
    });

    // Make this task important
    $("ul.mainlist span.favina").live("click", function() {
		var liElement = $(this).parent('li');
		
		if ($('a#done.active').length == 0 && liElement.hasClass('done') == false)
		{
			task.id        = liElement.attr('id');
			task.important = 1;
			task.updateImportant();
	        task.update();
	        task.updatePositions();
		}
    });
    
    // Delete Button Mouse Over
	$("ul.mainlist li, ul.donelist li").live('mouseover', function () {
		var description  = $(this).find('span.description');
		var deletebutton = $(this).find('span.delete');

		if(description.length == 1)
			deletebutton.show();
		else
			deletebutton.hide();
	});

	$(".mainlist li, .donelist li").live('mouseout', function () {
		$(this).find('.delete').hide();
	});

	// Delete function for the clicked task
    $('div.add').live('click', function() {
		$('input.input-add').focus();
	});

	// Delete function for the clicked task
    $("li span.delete").live('click', function() {
		if (settings.getDeleteprompt() == 1)
			dialogs.openTaskDeleteDialog($(this));
		else
			tasks.deletes($(this));
	});
});