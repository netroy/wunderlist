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
	return this;
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
			console.log(timer.total_seconds);
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