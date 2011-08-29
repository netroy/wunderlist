/**
 * wunderlist.language.js
 *
 * Class for handling the different languages
 * 
 * @author Dennis Schneider, Daniel Marschner
 */

wunderlist.language = wunderlist.language || {};

/**
 * Contains the loaded langauge from the settings 
 */
wunderlist.language.loaded = {};

/**
 * Available languages
 *
 * @author Dennis Schneider, Daniel Marschner
 */
wunderlist.language.availableLang = [
	{ code : 'de',    file : 'german', 			   translation : 'Deutsch' },
	{ code : 'en',    file : 'english', 		   translation : 'English' },
	{ code : 'es',    file : 'spanish', 		   translation : 'Español' },
	{ code : 'en-lt', file : 'spanishlatin', 	   translation : 'Español latino' },
	{ code : 'fr',    file : 'french',  		   translation : 'Français' },
	{ code : 'fr-ca', file : 'frenchcanadian',     translation : 'Canadienne-Française' },
	{ code : 'pl',    file : 'polish', 			   translation : 'Polski' },
	{ code : 'pt',    file : 'portugese', 		   translation : 'Português' },
	{ code : 'pt-br', file : 'portugesebrazil',    translation : 'Português (Brazilian)' },
	{ code : 'it',    file : 'italian', 		   translation : 'Italiano' },
	{ code : 'sk',    file : 'slovak', 			   translation : 'Slovensky' },
	{ code : 'ca',    file : 'catalan', 		   translation : 'Català' },
	{ code : 'nl',    file : 'dutch', 			   translation : 'Nederlands' },
	{ code : 'da',    file : 'danish', 			   translation : 'Dansk' },
	{ code : 'uk',    file : 'ukrainian', 		   translation : 'Українське' },
	{ code : 'ru',    file : 'russian', 		   translation : 'Pусский' },
	{ code : 'cs',    file : 'czech', 			   translation : 'České' },
	{ code : 'zh',    file : 'chinese', 		   translation : '中文' },
	{ code : 'tr',    file : 'turkish', 		   translation : 'Türkçe' },
	{ code : 'gr',    file : 'greek', 		       translation : 'Ελληνικά' },
	{ code : 'ar',    file : 'arabic', 			   translation : 'عربي' },
	{ code : 'se',    file : 'swedish', 		   translation : 'Svenska' },
	{ code : 'ja',    file : 'japanese', 		   translation : '日本語' },
	{ code : 'hu',    file : 'hungarian', 		   translation : 'Magyar' },
	{ code : 'ko',    file : 'korean', 			   translation : '한국어' },
	{ code : 'no',    file : 'norwegian', 		   translation : 'Norsk' },
	{ code : 'hr',    file : 'croatian', 		   translation : 'Hrvatski' },
	{ code : 'sr',    file : 'serbian',            translation : 'Српски' },
	{ code : 'gl',    file : 'galician', 		   translation : 'Galego' },
	{ code : 'ro',    file : 'romanian', 		   translation : 'Română' },
	{ code : 'ns',	  file : 'northernsami',	   translation : 'Sami' },
	{ code : 'is',	  file : 'icelandic',		   translation : 'Íslenska' },
	{ code : 'fi',	  file : 'finnish',		   	   translation : 'Suomi' }
];

/**
 * Initiates language functionalities
 *
 * @author Christian Reber
 */
wunderlist.language.init = function() {
	wunderlist.language.load();
	wunderlist.language.replaceBasics();
};

/**
 * Load language
 *
 * @author Dennis Schneider
 */
wunderlist.language.load = function() {
	// Load the language code
	code = navigator.language.toLowerCase();
	code = code[0] + code[1]; // e.g. de or en
	wunderlist.language.code = Titanium.App.Properties.getString('language', code);

	// Check if the saved language exists
	languageFound = false;
	for (var ix in wunderlist.language.availableLang)
	{
		if (wunderlist.language.availableLang[ix].code == wunderlist.language.code)
		{
			wunderlist.language.loaded = wunderlist.language.availableLang[ix];
			languageFound = true;
			break;
		}
	}
	
	// If saved lanuguage not exists, load english as default
	if (languageFound == false)
	{
		wunderlist.language.code = 'en';
		Titanium.App.Properties.setString('language', 'en');
	}

	// Load the language file
	path                        = Titanium.Filesystem.getResourcesDirectory() + "/language";
	file                        = Titanium.Filesystem.getFile(path, 'english.json');
	wunderlist.language.data    = Titanium.JSON.parse(file.read());
	wunderlist.language.english = Titanium.JSON.parse(file.read());
	
	if (wunderlist.language.code != 'en')
	{
		path                            = Titanium.Filesystem.getResourcesDirectory() + "/language";
		file                            = Titanium.Filesystem.getFile(path, wunderlist.language.loaded.file + '.json');
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