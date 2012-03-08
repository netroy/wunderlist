/**
 * wunderlist.language.js
 * Class for handling the different languages
 * @author Dennis Schneider, Daniel Marschner
 */

wunderlist.language = (function(window, $, wunderlist, Titanium, undefined){
  "use strict";

  /**
   * Contains the loaded langauge from the settings
   */
  var loaded = {},
      code = "en",
      data,
      english,
      self;

  /**
   * Available languages
   * @author Dennis Schneider, Daniel Marschner
   */
  var availableLang = [
    { code : 'de',    file : 'german',         translation : 'Deutsch' },
    { code : 'en',    file : 'english',        translation : 'English' },
    { code : 'es',    file : 'spanish',        translation : 'Español' },
    { code : 'en-lt', file : 'spanishlatin',   translation : 'Español latino' },
    { code : 'fr',    file : 'french',         translation : 'Français' },
    { code : 'fr-ca', file : 'frenchcanadian', translation : 'Canadienne-Française' },
    { code : 'pl',    file : 'polish',         translation : 'Polski' },
    { code : 'pt',    file : 'portugese',      translation : 'Português' },
    { code : 'pt-br', file : 'portugesebrazil',translation : 'Português (Brazilian)' },
    { code : 'it',    file : 'italian',        translation : 'Italiano' },
    { code : 'sk',    file : 'slovak',         translation : 'Slovensky' },
    { code : 'ca',    file : 'catalan',        translation : 'Català' },
    { code : 'nl',    file : 'dutch',          translation : 'Nederlands' },
    { code : 'da',    file : 'danish',         translation : 'Dansk' },
    { code : 'uk',    file : 'ukrainian',      translation : 'Українське' },
    { code : 'ru',    file : 'russian',        translation : 'Pусский' },
    { code : 'cs',    file : 'czech',          translation : 'České' },
    { code : 'zh',    file : 'chinese',        translation : '中文' },
    { code : 'tr',    file : 'turkish',        translation : 'Türkçe' },
    { code : 'gr',    file : 'greek',          translation : 'Ελληνικά' },
    { code : 'ar',    file : 'arabic',         translation : 'عربي' },
    { code : 'se',    file : 'swedish',        translation : 'Svenska' },
    { code : 'ja',    file : 'japanese',       translation : '日本語' },
    { code : 'hu',    file : 'hungarian',      translation : 'Magyar' },
    { code : 'ko',    file : 'korean',         translation : '한국어' },
    { code : 'no',    file : 'norwegian',      translation : 'Norsk' },
    { code : 'hr',    file : 'croatian',       translation : 'Hrvatski' },
    { code : 'sr',    file : 'serbian',        translation : 'Српски' },
    { code : 'gl',    file : 'galician',       translation : 'Galego' },
    { code : 'ro',    file : 'romanian',       translation : 'Română' },
    { code : 'ns',    file : 'northernsami',   translation : 'Sami' },
    { code : 'is',    file : 'icelandic',      translation : 'Íslenska' },
    { code : 'fi',    file : 'finnish',        translation : 'Suomi' }
  ];
  
  // replace translations
  function replaceTranslatedStrings(translation) {
    var langstring;
    for (langstring in translation) {
      data[langstring] = translation[langstring] || english[langstring];
    }
  }

  // expose translations publicly
  function makeDataPublic(){
    self.code = code;
    self.data = data;
    self.english = english;
  }

  /**
   * Load language
   * @author Dennis Schneider
   */
  function load() {
    var path, file, languageFound, translation;

    // Load the language code
    code = window.navigator.language.toLowerCase();
    code = code[0] + code[1]; // e.g. de or en
    code = wunderlist.settings.getString('language', code);

    // Check if the saved language exists
    languageFound = false;
    for (var ix in availableLang) {
      if (availableLang[ix].code === code) {
        loaded = availableLang[ix];
        languageFound = true;
        break;
      }
    }
  
    // If saved lanuguage not exists, load english as default
    if (languageFound === false) {
      wunderlist.settings.setString('language', 'en');
    }

    // Load the language file(s)
    if(Titanium && Titanium.Filesystem) {
      path = Titanium.Filesystem.getResourcesDirectory() + "/language";
      file = Titanium.Filesystem.getFile(path, 'english.json');
      data = Titanium.JSON.parse(file.read());
      english = $.extend({}, data);
  
      if (code !== 'en') {
        path = Titanium.Filesystem.getResourcesDirectory() + "/language";
        file = Titanium.Filesystem.getFile(path, loaded.file + '.json');
        translation = Titanium.JSON.parse(file.read());
      }

    } else {
      // No Titanium here, use Ajax instead
      $.ajax({
        url: "/language/english.json",
        success: function(response){
          data = response;
          english = $.extend({}, data);
        },
        dataType: 'json',
        async:   false
      });

      if (code !== 'en') {
        $.ajax({
          url: "/language/" + loaded.file + ".json",
          success: function(response){
            translation = response;
          },
          dataType: 'json',
          async:   false
        });
      }
    }

    replaceTranslatedStrings(translation);
    makeDataPublic();
  }

  // TODO: move this to filters.js
  function replaceFilters(){
    $("#all").attr('rel', data.all);
    $("#starred").attr('rel', data.starred);
    $("#done").attr('rel', data.done);
    $('#today').text(data.today);
    $('#tomorrow').text(data.tomorrow);
    $('#thisweek').text(data.thisweek);
    $('#someday').text(data.someday);
    $('#withoutdate').text(data.withoutdate);
  }

  /**
   * Switch to another language
   */
  function switchLanguage(code) {
    wunderlist.settings.setString('language', code);
    history.go(0);
    // TODO: complete this stub, try doing it without reloading
  }

  /**
   * Replace basics
   // TODO: move this to layout files, better publish an event
   * @author Christian Reber
   */
  function replaceBasics() {
    // Filters
    replaceFilters();

    $("a.history").text(data.history);
    $("a.addtask").text(data.add_task);
    $("a.button-add").text(data.add_task);
    $("input#search").attr('placeholder',data.search);

    $('a.addlist').text(data.add_list);
    $('.editp').attr('title', data.edit_list);
    $('.savep').attr('title', data.save_list);
    $('.deletep').attr('title', data.delete_list);

    $(".togglesidebar").attr('title', data.sidebar_toggle);
    $("#sync").attr('rel', data.tooltip_sync);
  }

  /**
   * Initiates language functionalities
   * @author Christian Reber
   */
  function init() {
    load();
    replaceBasics();
  }

  self = {
    "init": init,
    "availableLang": availableLang,
    "replaceFilters": replaceFilters,
    "switchLanguage": switchLanguage,
    "code": code
  };
  
  return self;

})(window, jQuery, wunderlist, Titanium);