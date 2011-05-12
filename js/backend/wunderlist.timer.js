/**
 * wunderlist.wunderlist.timer.js
 *
 * Class for handling date and time functionality
 * 
 * @author Christian Reber, Dennis Schneider, Daniel Marschner, Sebastian Kreutzberger
 */

wunderlist.timer = wunderlist.timer || {};

/**
 * Starts the auto update
 *
 * @author Dennis Schneider
 */
wunderlist.timer.init = function()
{
	this.isPaused = false;
	this.auto_update_seconds = 60 * 15;
	this.auto_update_interval = setInterval(function()
	{
		if(wunderlist.timer.isPaused == false)
		{
			wunderlist.timer.auto_update_seconds--;
			if(wunderlist.timer.auto_update_seconds === 0)
			{
				if(wunderlist.account.isLoggedIn() && Titanium.Network.online == true)
					$('#sync').click();
				clearInterval(wunderlist.timer.auto_update_interval);
				wunderlist.timer.init();
			}
		}
	}, 1000);
	
	// check every 10 seconds if day changed (overnight)
	this.former_date = 0; //init
	this.daychange_interval = setInterval(function()
	{
		var current_date = wunderlist.timer.current_date();
		if(this.former_date != current_date && this.former_date != 0 && typeof(this.former_date) != "undefined") 
		{
			wunderlist.account.loadInterface();
		}
		this.former_date = current_date;
		
	}, 10000);
	
	
	return this;
};

/**
 * Returns the current date in the format YYYYMMDD
 *
 * @author Sebastian Kreutzberger
 */
wunderlist.timer.current_date = function()
{
	var now = new Date();
	var ymd = now.getFullYear()+""+now.getMonth()+""+now.getDay();
	return ymd;
};

/**
 * Sets the timer with given seconds
 *
 * @author Dennis Schneider
 */
wunderlist.timer.set = function(seconds)
{
	if(seconds == undefined)
		this.total_seconds = 15;

	this.total_seconds = parseInt(seconds);
	return this;
};

/**
 * Starts the timer countdown
 *
 * @author Dennis Schneider
 */
wunderlist.timer.start = function()
{
	this.interval = setInterval(function()
	{
		if(wunderlist.timer.isPaused == false)
		{
			wunderlist.timer.total_seconds--;
			if(wunderlist.timer.total_seconds === 0)
			{
				if(wunderlist.account.isLoggedIn() && Titanium.Network.online == true)
					$('#sync').click();

				clearInterval(wunderlist.timer.interval);
			}
		}
	}, 1000);
	return this;
};

/**
 * Stops the timer
 *
 * @author Dennis Schneider
 */
wunderlist.timer.stop = function()
{
	clearInterval(this.interval);
	return this;
};

/**
 * Pauses both timers
 *
 * @author Dennis Schneider
 */
wunderlist.timer.pause = function()
{
	this.isPaused = true;
	return this;
};

/**
 * Resumes both timers
 *
 * @author Dennis Schneider
 */
wunderlist.timer.resume = function()
{
	this.isPaused = false;
	return this;
};

/**
 * Return the timezone offset of the current user; is needed for login and register (Stats)
 *
 * @author Daniel Marschner
 */
wunderlist.timer.getTimezoneOffset = function() {
	var date = new Date();  
	return (date.getTimezoneOffset() / 60) * (-1);
};