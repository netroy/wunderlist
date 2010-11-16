var language = language || {};

language.availableLang = new Array(
	'de', 'en', 'es', 'fr',
	'pl', 'pt', 'it', 'sk'
);

/**
 * Initiates language functionalities
 *
 * @author Christian Reber
 */
language.init = function()
{
	language.load();
	language.replaceBasics();
}

/**
 * Load language
 *
 * @author Dennis Schneider
 */
language.load = function()
{
	// Load the language code
	code = navigator.language.toLowerCase();
	code = code[0] + code[1]; // e.g. de or en
	language.code = Titanium.App.Properties.getString('language', code);

	if(language.availableLang.join(' ').indexOf(language.code) == -1)
	{
		language.code = 'en';
		Titanium.App.Properties.setString('language', 'en');
	}

	// Load the language file
	path          = Titanium.Filesystem.getResourcesDirectory() + "/language";
	file          = Titanium.Filesystem.getFile(path, "en.json");
	language.data = Titanium.JSON.parse(file.read());

	if(language.code != 'en')
	{
		path                 = Titanium.Filesystem.getResourcesDirectory() + "/language";
		file                 = Titanium.Filesystem.getFile(path, language.code + ".json");
		language.translation = Titanium.JSON.parse(file.read());

		for(langstring in language.data)
		{
			var translation = language.translation[langstring];
			if(translation != undefined)
				language.data[langstring] = translation;
		}
	}
}

/**
 * Replace basics
 *
 * @author Christian Reber
 */
language.replaceBasics = function()
{
	$("a.history").text(language.data.history);
	$("a.addtask").text(language.data.add_task);
	$("a.button-add").text(language.data.add_task);
	$("input#search").attr('placeholder',language.data.search);

	$('a#today').text(language.data.today);
	$('a#tomorrow').text(language.data.tomorrow);
	$('a#thisweek').text(language.data.thisweek);
	$('a#someday').text(language.data.someday);
	$('a#withoutdate').text(language.data.withoutdate);

	$('h3 a.add').attr('title', language.data.add_list);
	$('.editp').attr('title', language.data.edit_list);
	$('.savep').attr('title', language.data.save_list);
	$('.deletep').attr('title', language.data.delete_list);

	$(".togglesidebar").attr('title', language.data.sidebar_toggle);

	$("a#all").attr('rel', language.data.all);
	$("a#starred").attr('rel', language.data.starred);
	$("a#done").attr('rel', language.data.done);

	$("span#sync").attr('rel', language.data.tooltip_sync);
}