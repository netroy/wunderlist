var timer = timer || {};

/**
 * Starts the auto update
 *
 * @author Dennis Schneider
 */
timer.init = function()
{
	this.isPaused = false;
	this.auto_update_seconds = 60 * 15;
	this.auto_update_interval = setInterval(function()
	{
		if(timer.isPaused == false)
		{
			timer.auto_update_seconds--;
			if(timer.auto_update_seconds === 0)
			{
				if(wunderlist.isUserLoggedIn() && Titanium.Network.online == true)
					$('#sync').click();
				clearInterval(timer.auto_update_interval);
				timer.init();
			}
		}
	}, 1000);
	
	// check every 10 seconds if day changed (overnight)
	this.former_date = 0; //init
	this.daychange_interval = setInterval(function()
	{
		var current_date = timer.current_date();
		if(this.former_date != current_date && this.former_date != 0 && typeof(this.former_date) != "undefined") 
		{
			account.loadInterface();
		}
		this.former_date = current_date;
		
	}, 10000);
	
	
	return this;
}

/**
 * Returns the current date in the format YYYYMMDD
 *
 * @author Sebastian Kreutzberger
 */
timer.current_date = function()
{
	var now = new Date();
	var ymd = now.getFullYear()+""+now.getMonth()+""+now.getDay();
	return ymd;
}

/**
 * Sets the timer with given seconds
 *
 * @author Dennis Schneider
 */
timer.set = function(seconds)
{
	if(seconds == undefined)
		this.total_seconds = 15;

	this.total_seconds = parseInt(seconds);
	return this;
}

/**
 * Starts the timer countdown
 *
 * @author Dennis Schneider
 */
timer.start = function()
{
	this.interval = setInterval(function()
	{
		if(timer.isPaused == false)
		{
			timer.total_seconds--;
			if(timer.total_seconds === 0)
			{
				if(wunderlist.isUserLoggedIn() && Titanium.Network.online == true)
					$('#sync').click();

				clearInterval(timer.interval);
			}
		}
	}, 1000);
	return this;
}

/**
 * Stops the timer
 *
 * @author Dennis Schneider
 */
timer.stop = function()
{
	clearInterval(this.interval);
	return this;
}

/**
 * Pauses both timers
 *
 * @author Dennis Schneider
 */
timer.pause = function()
{
	this.isPaused = true;
	return this;
}

/**
 * Resumes both timers
 *
 * @author Dennis Schneider
 */
timer.resume = function()
{
	this.isPaused = false;
	return this;
}



// timer.midnight = function()
// {
// 	var now      = getWorldWideDate();
// 	var midnight = getWorldWideDate(new Date("Sep 29 2007 00:00:01"));
// 	var seconds = (theevent - now) / 1000;
// 	var minutes = seconds / 60;
// 	var hours = minutes / 60;
// 	var days = hours / 24;
// 	ID=window.setTimeout("timer.midnight();", 60000);
// 	function update() {
// 	now = new Date();
// 	seconds = (theevent - now) / 1000;
// 	seconds = Math.round(seconds);
// 	minutes = seconds / 60;
// 	minutes = Math.round(minutes);
// 	hours = minutes / 60;
// 	hours = Math.round(hours);
// 	days = hours / 24;
// 	days = Math.round(days);
// 	document.form1.days.value = days;
// 	document.form1.hours.value = hours;
// 	document.form1.minutes.value = minutes;
// 	document.form1.seconds.value = seconds;
// 	ID=window.setTimeout("update();",1000);
// 	}
// }