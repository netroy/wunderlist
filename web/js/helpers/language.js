define('helpers/language',
      ['helpers/settings', 'helpers/titanium', 'libs/jquery', 'libs/async'],
      function(settings, Titanium, $, async, undefined) {

  "use strict";

  var code, englishStrings, translations = {},
  availableLang = { // Available languages
    'ar':    { file : 'arabic',         translation : 'عربي' },
    'ca':    { file : 'catalan',        translation : 'Català' },
    'cs':    { file : 'czech',          translation : 'České' },
    'da':    { file : 'danish',         translation : 'Dansk' },
    'de':    { file : 'german',         translation : 'Deutsch' },
    'en':    { file : 'english',        translation : 'English' },
    'es':    { file : 'spanish',        translation : 'Español' },
    'es-lt': { file : 'spanishlatin',   translation : 'Español latino' },
    'fi':    { file : 'finnish',        translation : 'Suomi' },
    'fr':    { file : 'french',         translation : 'Français' },
    'fr-ca': { file : 'frenchcanadian', translation : 'Canadienne-Française' },
    'gl':    { file : 'galician',       translation : 'Galego' },
    'gr':    { file : 'greek',          translation : 'Ελληνικά' },
    'hi':    { file : 'hindi',          translation : 'हिंदी'},
    'hu':    { file : 'hungarian',      translation : 'Magyar' },
    'hr':    { file : 'croatian',       translation : 'Hrvatski' },
    'is':    { file : 'icelandic',      translation : 'Íslenska' },
    'it':    { file : 'italian',        translation : 'Italiano' },
    'ja':    { file : 'japanese',       translation : '日本語' },
    'ko':    { file : 'korean',         translation : '한국어' },
    'nl':    { file : 'dutch',          translation : 'Nederlands' },
    'ns':    { file : 'northernsami',   translation : 'Sami' },
    'no':    { file : 'norwegian',      translation : 'Norsk' },
    'pl':    { file : 'polish',         translation : 'Polski' },
    'pt':    { file : 'portugese',      translation : 'Português' },
    'pt-br': { file : 'portugesebrazil',translation : 'Português (Brazilian)' },
    'ro':    { file : 'romanian',       translation : 'Română' },
    'ru':    { file : 'russian',        translation : 'Pусский' },
    'se':    { file : 'swedish',        translation : 'Svenska' },
    'sk':    { file : 'slovak',         translation : 'Slovensky' },
    'sr':    { file : 'serbian',        translation : 'Српски' },
    'tr':    { file : 'turkish',        translation : 'Türkçe' },
    'uk':    { file : 'ukrainian',      translation : 'Українське' },
    'zh':    { file : 'chinese',        translation : '中文' }
  };


  function fetchLanguageData(languageCode) {
    var path, file = availableLang[languageCode].file,
        error = "language file not found for " + languageCode;

    return function(callback) {
      if(Titanium && Titanium.Filesystem) {
        var FS = Titanium.Filesystem;
        try {
          path = FS.getResourcesDirectory() + "/language";
          file = FS.getFile(path, file + '.json');
          callback(null, JSON.parse(file.read()));
        } catch (e) {
          callback(new Error(error));
        }
      } else {
        // No Titanium here; must be a web-app, use Ajax instead
        $.ajax({
          'url': '/language/' + file + '.json',
          'success': function(response) {
            callback(null, response);
          },
          'error': function() {
            callback(new Error(error));
          },
          'dataType': 'json'
        });
      }
    };
  }


  function init() {
    // Load language code from settings
    code = settings.getString('language', code);

    // If code is invalid or undefined, get it from the navigator object
    if(!(code in availableLang)) {
      // TODO: this won't work on 5-letter codes
      code = window.navigator.language.substr(0, 2).toLowerCase();

      // If still invalid, then set it to english
      if(!(code in availableLang)) {
        code = "en";
      }

      // Store the language in the settings
      settings.setString('language', code);
    }
  }


  function mergeTranslations(err, langData) {
    englishStrings = langData[0];
    var key, languageStrings = langData[1] || {};
    for (key in englishStrings) {
      translations[key] = languageStrings[key] || englishStrings[key];
    }

    // Once new language is loaded, trigger an event so that views re-render
    $(document).trigger('language_changed', code);
  }


  function setLanguage(langCode) {
    if(langCode in availableLang) {

      // Set the local reference to the new language code
      code = langCode;
      settings.setString('language', code);

      // Load the language file(s)
      var requestQueue = [];
      requestQueue.push(fetchLanguageData('en'));
      if(langCode !== 'en') {
        requestQueue.push(fetchLanguageData(langCode));
      }

      // fire the ajax requests to fetch the language translations & then merge them
      async.parallel.call(async, requestQueue, mergeTranslations);
    }
  }


  init();
  setLanguage(code);


  return {
    "data": translations,
    "availableLang": availableLang,
    "setLanguage": setLanguage
  };

});
