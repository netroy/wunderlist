var filters = filters || {};

/**
 * Initiates all filter functions on the bottom (buttons on the bottom)
 *
 * @author Christian Reber
 */
filters.init = function() {
	$('.list').click(filters.clearActiveStates);
	$('a#someday').click(function() {wunderlist.database.getFilteredTasks('date', 'withdate')});
	$('a#withoutdate').click(function() {wunderlist.database.getFilteredTasks('date', 'nodate')});
	$('a#all').click(function() {wunderlist.database.getFilteredTasks('all')});
	$('a#starred').click(function() {wunderlist.database.getFilteredTasks('starred')});
	$('a#today').click(function() {wunderlist.database.getFilteredTasks('today')});
	$('a#tomorrow').click(function() {wunderlist.database.getFilteredTasks('tomorrow')});
	$('a#thisweek').click(function() {wunderlist.database.getFilteredTasks('thisweek')});
	$('a#done').click(function() {wunderlist.database.getFilteredTasks('done')});
	
	// Activates a filter
	$('#bottombar #left a.filter').click(function() {
		if ($(this).hasClass('loggedinas') == false)
		{
			filters.setActiveState(this);
			$("a.list").droppable({disabled: false});
			html.make_timestamp_to_string();
		}
		else
			$(this).addClass('active');
	});

	// Show overdue tasks if click on "overdue alert"
	$('div#sidebar div#notification div').click(function() {
		wunderlist.database.getFilteredTasks('overdue');
		html.make_timestamp_to_string();
		$("a.list").droppable({disabled: false});
		$('#bottombar #left a').removeClass('active');
	});
	
	// By clicking on the list headline open the list
	$('h3.clickable').live('click', function() {
		$('a#list' + $(this).attr('rel')).click();
	});
	
	setTimeout(filters.updateBadges, 10);
};

/**
 * Add class="active" on filters
 *
 * @author Dennis Schneider
 */
filters.setActiveState = function(object) {
	$('#bottombar #left a').removeClass('active');
	$('.list').removeClass('ui-state-disabled');
	$(object).addClass('active');
};

/**
 * Removes class="active" on filters
 *
 * @author Christian Reber
 */
filters.clearActiveStates = function(object) {
	$('#bottombar #left a').removeClass('active');
};

/**
 * Creates those tiny little red badges on the filters and on the Dock Icon (only on Mac OS X)
 * to remind the user of "overdue" and "today" tasks
 *
 * TODO: Has to be updated, because of a freaky badge count behaviour. If a sort a task, the badge will hide/show for every task in the list.
 *
 * @author Dennis Schneider, Christian Reber
 */
filters.updateBadges = function() {
	// Generate Badges
	var todaycount	 = wunderlist.database.updateBadgeCount('today');
	var overduecount = wunderlist.database.updateBadgeCount('overdue');

	var today_has_no_badge	 = $('#bottombar #left a#today span').length == 0;
	var overdue_has_no_badge = $('#bottombar #left a#overdue span').length == 0;

	if(today_has_no_badge == true)
	{
		$('#left a#today').append('<span>' + todaycount + '</span>');
	}
	else
	{
		$('#left a#today span').text(todaycount);
		//$('#left a#today span').fadeOut('fast').fadeIn('fast');
		$("#lists").css("bottom","74px");
		$("#note").css("bottom","74px");
	}

	if(overduecount > 1)
	{
		overdue_text = overduecount + ' ' + wunderlist.language.data.overdue_text_pl;
		$('div#sidebar div#notification').fadeIn('fast');
		$("#lists").css("bottom","74px");
		$("#note").css("bottom","74px");
	}
	else if(overduecount == 1)
	{
		overdue_text = overduecount + ' ' + wunderlist.language.data.overdue_text_sl;
		$('div#sidebar div#notification').fadeIn('fast');
		$("#lists").css("bottom","74px");
		$("#note").css("bottom","74px");
	}
	else
	{
		overdue_text = '';
		$('div#sidebar div#notification').fadeOut('fast');
		$("#lists").css("bottom","36px");
		$("#note").css("bottom","36px");
	}

	if(overdue_has_no_badge)
	{
		$('div#sidebar div#notification div').text(overdue_text);
	}
	else
	{
		$('div#sidebar div#notification div').text(overduecount);
		//$('div#sidebar div#notification').fadeOut('fast').fadeIn('fast');
		$("#lists").css("bottom","74px");
	}

	var countAll = overduecount + todaycount;

	if(todaycount == 0)
	{
		$('#left a#today span').remove();
	}

	if(countAll == 0)
	{
		Titanium.UI.setBadge(null);
	}
	else
	{
		Titanium.UI.setBadge(countAll.toString());
	}
};

/**
 * Clears all little red badges
 *
 * @author Christian Reber
 */
filters.clearBadges = function() {
	Titanium.UI.setBadge('');
	$('#left a#today span').remove();
	$('div#sidebar div#notification').hide();
};