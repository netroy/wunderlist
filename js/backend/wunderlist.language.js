/**
 * wunderlist.language.js
 *
 * Class for handling the different languages
 * 
 * @author Dennis Schneider, Daniel Marschner
 */

wunderlist.language = wunderlist.language || {};

/**
 * Available languages
 *
 * @author Dennis Schneider, Daniel Marschner
 */
wunderlist.language.availableLang = [
	'de', 'en', 'es', 'fr',
	'pl', 'pt', 'it', 'sk',
	'ca', 'nl', 'da', 'uk',
	'ru', 'cs', 'zh', 'tr',
	'ar', 'se', 'ja', 'hu',
	'ko', 'no', 'hr', 'sr',
	'gl', 'ro', 'pt-br'
];

/**
 * Initiates language functionalities
 *
 * @author Christian Reber
 */
wunderlist.language.init = function()
{
	wunderlist.language.load();
	wunderlist.language.replaceBasics();
};

/**
 * Load language
 *
 * @author Dennis Schneider
 */
wunderlist.language.load = function()
{
	// Load the language code
	code = navigator.language.toLowerCase();
	code = code[0] + code[1]; // e.g. de or en
	wunderlist.language.code = Titanium.App.Properties.getString('language', code);

	if (wunderlist.language.availableLang.join(' ').indexOf(wunderlist.language.code) == -1)
	{
		wunderlist.language.code = 'en';
		Titanium.App.Properties.setString('language', 'en');
	}

	// Load the language file
	path                        = Titanium.Filesystem.getResourcesDirectory() + "/language";
	file                        = Titanium.Filesystem.getFile(path, 'en.json');
	wunderlist.language.data    = Titanium.JSON.parse(file.read());
	wunderlist.language.english = Titanium.JSON.parse(file.read());
	
	if (wunderlist.language.code != 'en')
	{
		path                            = Titanium.Filesystem.getResourcesDirectory() + "/language";
		file                            = Titanium.Filesystem.getFile(path, wunderlist.language.code + '.json');
		wunderlist.language.translation = Titanium.JSON.parse(file.read());

		for (langstring in wunderlist.language.data)
		{
			var translation = wunderlist.language.translation[langstring];
			if(translation != undefined)
			{
				wunderlist.language.data[langstring] = translation;
			}
		}
	}
};

/**
 * Replace basics
 *
 * @author Christian Reber
 */

wunderlist.language.replaceBasics = function() {
	$("a.history").text(wunderlist.language.data.history);
	$("a.addtask").text(wunderlist.language.data.add_task);
	$("a.button-add").text(wunderlist.language.data.add_task);
	$("input#search").attr('placeholder',wunderlist.language.data.search);

	$('a#today').text(wunderlist.language.data.today);
	$('a#tomorrow').text(wunderlist.language.data.tomorrow);
	$('a#thisweek').text(wunderlist.language.data.thisweek);
	$('a#someday').text(wunderlist.language.data.someday);
	$('a#withoutdate').text(wunderlist.language.data.withoutdate);

	$('a.addlist').text(wunderlist.language.data.add_list);
	$('.editp').attr('title', wunderlist.language.data.edit_list);
	$('.savep').attr('title', wunderlist.language.data.save_list);
	$('.deletep').attr('title', wunderlist.language.data.delete_list);

	$(".togglesidebar").attr('title', wunderlist.language.data.sidebar_toggle);

	$("a#all").attr('rel', wunderlist.language.data.all);
	$("a#starred").attr('rel', wunderlist.language.data.starred);
	$("a#done").attr('rel', wunderlist.language.data.done);

	$("span#sync").attr('rel', wunderlist.language.data.tooltip_sync);
};