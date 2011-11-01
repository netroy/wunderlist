/**
 * wunderlist.js
 *
 * Main Wunderlist core containing some helper functions
 * and the initialization of the program
 * 
 * @author Christian Reber, Dennis Schneider, Daniel Marschner
 */
var wunderlist = wunderlist || {};

/**
 * Init the wunderlist framework and all necessary parts
 *
 * @author Daniel Marschner
 */
wunderlist.init = function() {
	// Set the app title
	wunderlist.setTitle('Wunderlist' + (wunderlist.account.isLoggedIn() && wunderlist.account.email != '' ? ' - ' + wunderlist.account.email : ''));
	
	// Set the os version
	wunderlist.os = Titanium.Platform.name.toLowerCase();
	wunderlist.version = Titanium.App.version.toString();
	
	wunderlist.language.init();
	
	// Create the database structure
	wunderlist.database.init();
	
	settings.init();
		
	wunderlist.sync.init();
		
	// Init some other necessary stuff
	// TODO: add the wunderlist prefix
	wunderlist.account.init();
	wunderlist.timer.init();
	menu.initializeTrayIcon();
	wunderlist.sharing.init();
	wunderlist.notifications.init();
	share.init();
	
	// Check for a new version
	wunderlist.updater.checkVersion();	
	
	// Add the wunderlist object to the current window
	Titanium.UI.getCurrentWindow().wunderlist = wunderlist;
	
	// Enable shutdown fix
	Titanium.API.addEventListener(Titanium.EXIT, function() {
		Titanium.Platform.canShutdown();
	});
};

/**
 * Set the app title
 *
 * @author Daniel Marschner 
 */
wunderlist.setTitle = function(title) {
	document.title = title;
};

/**
 * Converted from PHP in_array()
 *
 * @author Daniel Marschner
 */
wunderlist.in_array = function(needle, array){
    for (var ix = 0; ix < array.length; ix++)
    {
        if (needle.toString() == array[ix])
            return true
    }
    
    return false;
};

/**
 * Check if the given value is an array
 *
 * @author Daniel Marschner
 */
wunderlist.is_array = function(value) {
	if (typeof value === 'object' && value && value instanceof Array)
		return true;

	return false;
};

/**
 * Calculates the difference between the current and the given date
 *
 * @author Dennis Schneider
 */
wunderlist.calculateDayDifference = function(done) {
	var today         = new Date();
	var one_day       = 86400; // One day in seconds
	var unceiled_days = ((today.getTime() / 1000) - done) / (one_day);

	if (unceiled_days > 1)
		// Calculate difference btw the two dates, and convert to days
		return Math.floor(unceiled_days);
	else
		return 0;
};

/**
 * Removes HTML Tags
 *
 * @author Dennis Schneider
 */
wunderlist.strip_tags = function(input, allowed) {
	allowed = (((allowed || "") + "")
		.toLowerCase()
		.match(/<[a-z][a-z0-9]*>/g) || [])
		.join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
	var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
	commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
	return input.replace(commentsAndPhpTags, '').replace(tags, function($0, $1)
	{
		return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
	});
};

/**
 * Replace a link in a given text with a clickable link
 *
 * @author Dennis Schneider, Marvin Labod
 */
wunderlist.replace_links = function(text) {
	// HTTP/HTTPS/FTP Links
	var exp = /((http|https|ftp):\/\/[\w?=&.\-\/-;#~%-\ü\( \)]+(?![\w\s?&.\/;#~%"=-]*>))/g;
	text = text.replace(exp,"<a href='$1'>$1</a>");
	
	// FILE Links (Windows)
	var exp = /(file:\/\/\/[a-zA-Z]:\/)(\w.+)\.([a-zA-Z0-9]{1,5})/g;
	text = text.replace(exp,"<span class='openApp'>$1$2.$3</span>");
	
	// Local File System Links (Mac)
	var exp = /(^|\s)(\/\w.+)\.([a-zA-Z0-9]{1,5})/g;
	text = text.replace(exp,"<span class='openApp'>$1$2.$3</span>");
	
	// Email addresses
	var exp = /(([a-z0-9*._+]){1,}\@(([a-z0-9]+[-]?){1,}[a-z0-9]+\.){1,}([a-z]{2,4}|museum)(?![\w\s?&.\/;#~%"=-]*>))/g;
	text = text.replace(exp, '<a href="mailto:$1">$1</a>' );
	
	return text;
};

/**
 * Replace the normal line break after enter it into a textarea to the HTML line break tag
 *
 * @author Marvin Labod
 */
wunderlist.replace_breaks = function(text) {
	return text.replace(/\n/g, '<br>');
}; 

/**
 * Replace the search string with the given string
 *
 * @author Daniel Marschner
 */
wunderlist.str_replace = function(search, replace, subject) {
	return subject.split(search).join(replace);
};

/**
 * Validates an integer
 *
 * @author Christian Reber
 */
wunderlist.is_integer = function(s) {
	return (s.toString().search(/^-?[0-9]+$/) == 0);
};

/**
 * Validate the email
 *
 * @author Dennis Schneider
 */
wunderlist.is_email = function(email) {
	var reg = /^([A-Za-z0-9\+_\-\.\+])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
	
	if (reg.test(email) == false) 
	{
		$('.error').text(wunderlist.language.data.error_invalid_email);
		return false;
	}
	else 
		return true;
};

/**
 * Scans for a date in a task and returns a result object
 *
 * @author Dennis Schneider
 * @author Adam Renklint
 */
wunderlist.smartScanForDate = function(string, doNaturalRecognition) {
	
	if (Titanium.App.Properties.getInt('enable_natural_date_recognition', 0) === 1) {
		doNaturalRecognition = true;
	}
	
	function capitaliseFirstLetter(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	};
	
	function setToFuture(date) {
		var vDate = new Date();
		if (vDate > date) {
			date.setFullYear(date.getFullYear() + 1);
			return setToFuture(date);
		}
		return date;
	};
	
	var result 				= {},
		number				= 0,
		month				= '',
		date 				= new Date();

	if (doNaturalRecognition) {
		// Check for "today"
		if (string.search('today') != -1) {
			return {
				string: 		string.replace('today', ''),
				timestamp: 		html.getWorldWideDate(date)
			};
		}

		// Check for "tomorrow"
		if (string.search('tomorrow') != -1) {
			date.setDate(date.getDate() + 1);
			return {
				string: 		string.replace('tomorrow', ''),
				timestamp: 		html.getWorldWideDate(date)
			};
	    }

		// Check for "in 3 days, in 1 week, in 2 months, in 1 year"
	    var rgxpRelativeDates	= /\bin\s([0-9]+)\s\b(days?|weeks?|months?|years?)/;
		if (string.match(rgxpRelativeDates) !== null) {
			result				= string.match(rgxpRelativeDates);
			number 				= parseInt(result[1]);
			if (number < 1) {
	            return {};
			}
			switch (result[2]) {
				case 'day':
				case 'days':
					date.setDate(date.getDate() + number);
					break;
				case 'week':
				case 'weeks':
					date.setDate(date.getDate() + (7 * number));
					break;
				case 'month':
				case 'months':
					date.setMonth(date.getMonth() + number);
					break;
				case 'year':
				case 'years':
					date.setFullYear(date.getFullYear() + number);
					break;
				default:
					return {};
			}
			return {
				string: 		string.replace(result[0], ''),
				timestamp: 		html.getWorldWideDate(date)
			};
		}

		// Check for "on monday, on tuesday, on wednesday, on thursday, on friday, on saturday, on sunday"
		var rgxpOnWeekday		= /\bon\b\s(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i;
		if (string.match(rgxpOnWeekday) !== null) {
			var weekdays		= ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
			var today			= date.getDay();
			var difference		= 0;
			result				= string.match(rgxpOnWeekday);
			for (var i = 0, max = weekdays.length; i < max; i++) {
				if (weekdays[i] === result[1].toLowerCase()) {
					difference = i - today;
					if (difference < 0) {
						difference = difference + 7;
					} else if (difference === 0) {
						difference = 7;
					}
					string		= string.replace(result[0], 'in ' + difference + ' days');
					return wunderlist.smartScanForDate(string, doNaturalRecognition);
				}
			}
		}

		// Check for "on 21st of may, on 21 may"
		var rgxpOnStandard 		= /\bon\s([0-9]+)(st|nd|rd|th)?\s\b(of)?\s?\b(January|February|March|April|May|June|July|August|September|October|November|December)/i;
		if (string.match(rgxpOnStandard) !== null) {
			result				= string.match(rgxpOnStandard);
			number				= parseInt(result[1]);
			month				= capitaliseFirstLetter(result[4]);
			date				= setToFuture(new Date(month + ' ' + number + ', ' + date.getFullYear()));
			return {
				string: 		string.replace(result[0], ''),
				timestamp: 		html.getWorldWideDate(date)
			};
		}

		// Check for "on may 21st, on may 21"
		var rgxpOnAlternate 	= /\bon\s\b(January|February|March|April|May|June|July|August|September|October|November|December)\s\b([0-9]+)(st|nd|rd|th)?/i;
		if (string.match(rgxpOnAlternate) !== null) {
			result				= string.match(rgxpOnAlternate);
			number				= parseInt(result[2]);
			month				= capitaliseFirstLetter(result[1]);
			date				= setToFuture(new Date(month + ' ' + number + ', ' + date.getFullYear()));
			return {
				string: 		string.replace(result[0], ''),
				timestamp: 		html.getWorldWideDate(date)
			};
		}
	}

	// Check for "#monday, #tuesday, #wednesday, #thursday, #friday, #saturday, #sunday"
	var rgxpPUWeekdays		= /\#(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i;
	if (string.match(rgxpPUWeekdays) !== null) {
		result				= string.match(rgxpPUWeekdays);
		string				= string.replace(result[0], 'on ' + result[1]);
		return wunderlist.smartScanForDate(string, true);
	}
	
	// Check for "#21may"
	var rgxpPUExplicitDates	= /\#([0-9]+)(January|February|March|April|May|June|July|August|September|October|November|December)/i;
	if (string.match(rgxpPUExplicitDates) !== null) {
		result				= string.match(rgxpPUExplicitDates);
		string				= string.replace(result[0], 'on ' + result[1] + ' ' + result[2]);
		return wunderlist.smartScanForDate(string, true);
	}
	
	// Check for "#may21"
	var rgxpPUAlternateDates	= /\#(January|February|March|April|May|June|July|August|September|October|November|December)([0-9]+)/i;
	if (string.match(rgxpPUAlternateDates) !== null) {
		result				= string.match(rgxpPUAlternateDates);
		string				= string.replace(result[0], 'on ' + result[2] + ' ' + result[1]);
		return wunderlist.smartScanForDate(string, true);
	}
	
	// Check for "#3d, #2w, #2m, #1y"
	var rgxpPURelativeDates	= /\#([0-9]+)(d|w|m|y)/i;
	if (string.match(rgxpPURelativeDates) !== null) {
		result				= string.match(rgxpPURelativeDates);
		var fullParams = {
			'd': 	'days',
			'w': 	'weeks',
			'm': 	'months',
			'y': 	'years'
		};
		string				= string.replace(result[0], 'in ' + result[1] + ' ' + fullParams[result[2]]);
		return wunderlist.smartScanForDate(string, true);
	}
	
	// Check for "#td"
	if (string.match('#td')) {
		string				= string.replace('#td', 'today');
		return wunderlist.smartScanForDate(string, true);
	}
	
	// Check for "#tm"
	if (string.match('#tm')) {
		string				= string.replace('#tm', 'tomorrow');
		return wunderlist.smartScanForDate(string, true);
	}

	return {};
};


/**
 * Put the first char of the string into upper case
 *
 * @author Daniel Marschner
 */
wunderlist.ucfirst = function(str) {
    str += '';
    var f = str.charAt(0).toUpperCase();
    return f + str.substr(1);
};

/*************************************************************************************/
// Start the wunderlist framework
$(function() { wunderlist.init(); });