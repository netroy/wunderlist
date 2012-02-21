/* global wunderlist */
wunderlist.helpers.utils = (function(window, document, wunderlist, undefined){
  "use strict";

  /**
   * Converted from PHP in_array()
   * @author Daniel Marschner
   */
  function in_array(needle, array){
    for (var index = 0, length = array.length; index < length; index++) {
      if (needle.toString() === array[index]) {
        return true;
      }
    }
    return false;
  }


  /**
   * Check if the given value is an array
   * @author Daniel Marschner
   */
  function is_array(value) {
    if (typeof value === 'object' && value && value instanceof Array){
      return true;
    }
    return false;
  }


  /**
   * Set the app title
   * @author Daniel Marschner
   */
  function setTitle(title) {
    document.title = title;
  }


  /**
   * Replace the search string with the given string
   * @author Daniel Marschner
   */
  function str_replace(search, replace, subject) {
    return subject.split(search).join(replace);
  }


  /**
   * Validates an integer
   * @author Christian Reber
   */
  function is_integer(s) {
    return (s.toString().search(/^-?[0-9]+$/) === 0);
  }


  /**
   * Validate the email
   * @author Dennis Schneider
   */
  var emailReg = /^([A-Za-z0-9\+_\-\.\+])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
  function is_email(email) {
    return emailReg.test(email);
  }


  /**
   * Put the first char of the string into upper case
   * @author Daniel Marschner
   */
  function ucfirst(str) {
     return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Find the next occurance of the day-month combo passed as a date object
   */
  function setToFuture(date) {
    var vDate = new Date();
    if (vDate > date) {
      date.setFullYear(date.getFullYear() + 1);
      return setToFuture(date);
    }
    return date;
  }

  /**
   * Removes HTML tags and escapes single quotes
   * @author Daniel Marschner
   */
  function convertString(string, length) {
    var escape = window.escape;
    string = string.split('<').join(escape('<'));
    string = string.split('>').join(escape('>'));
    string = string.split("'").join(escape("'"));
    
    if (length !== undefined && length > 0){
      string = string.substr(0, length);
    }
    return string;
  }


  /**
   * Replace a link in a given text with a clickable link
   * @author Dennis Schneider
   */
  var replaceHttpLinkRegExp = /((http|https|ftp):\/\/[\w?=&.\-\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g;
  function replaceHttpLink(text) {
    return text.replace(replaceHttpLinkRegExp,"<a href='$1'>$1</a>");
  }


  /**
   * Is needed for the function xss_clean
   * Ported by: slamidtfyn
   * More info at: www.soerenlarsen.dk/development-projects/xss-clean
   */
  function htmlEntityDecode(str) {
    var ta = document.createElement("textarea");
    var result;
    ta.innerHTML = str.replace(/</g,"&lt;").replace(/>/g,"&gt;");
    result = ta.value;
    result = result.replace(/&#x([0-9a-f]{2,5})/g, String.fromCharCode("$1"));
    result = result.replace(/&#([0-9]{2,4})/g, String.fromCharCode("$1"));
    return result;
  }


  /**
   * Clean the string -> HTML or script
   * Ported by: slamidtfyn
   * More info at: www.soerenlarsen.dk/development-projects/xss-clean
   * TODO: cache the regexp objects & reuse them
   */
  function xssClean(str) {
    var i, len, index, results, words, temp;
    str = wunderlist.helpers.utils.convertString(str);
    str = str.replace(/\\0/gi, '');
    str = str.replace(/\\\\0/gi, '');
    str = str.replace(/#(&\#*\w+)[\x00-\x20]+;#u/g,"$1;");
    str = str.replace(/#(&\#x*)([0-9A-F]+);*#iu/g,"$1$2;");
    str = str.replace(/%u0([a-z0-9]{3})/gi, "&#x$1;");
    str = str.replace(/%([a-z0-9]{2})/gi, "&#x$1;");
    
    results = str.match(/<.*?>/g, str);
    
    if(results) {
      for(i = 0, len = results.length; i < len; i++) {
        str = str.replace(results[i], htmlEntityDecode(results[i]));
      }
    }
            
    str = str.replace(/\\t+/g, " ");
    str = str.replace(/<\?php/g,'&lt;?php');
    str = str.replace(/<\?PHP/g,'&lt;?PHP');
    str = str.replace(/<\?/g,'&lt;?');
    str = str.replace(/\?>/g,'?&gt;');
    words = new Array('javascript', 'vbscript', 'script', 'applet', 'alert', 'document', 'write', 'cookie', 'window');
    
    for(index in words) {
      temp = '';
      for (i = 0, len = words[index].length; i < len; i++) {
        temp += words[index].substr( i, 1)+"\\s*";
      }
      
      temp = temp.substr( 0,temp.length-3);
      myRegExp = new RegExp(temp, "gi");
      str = str.replace(myRegExp, words[index]);
    }
    
    str = str.replace(/\/<a.+?href=.*?(alert\(|alert&\#40;|javascript\:|window\.|document\.|\.cookie|<script|<xss).*?\>.*?<\/a>/gi,"");
    str = str.replace(/<img.+?src=.*?(alert\(|alert&\#40;|javascript\:|window\.|document\.|\.cookie|<script|<xss).*?\>/gi,"");
    str = str.replace(/<(script|xss).*?\>/gi,"");
    str = str.replace(/(<[^>]+.*?)(onblur|onchange|onclick|onfocus|onload|onmouseover|onmouseup|onmousedown|onselect|onsubmit|onunload|onkeypress|onkeydown|onkeyup|onresize)[^>]*>/gi,"$1");
    str = str.replace(/<(\/*\s*)(alert|applet|basefont|base|behavior|bgsound|blink|body|embed|expression|form|frameset|frame|head|html|ilayer|iframe|input|layer|link|meta|object|plaintext|style|script|textarea|title|xml|xss)([^>]*)>/ig, "&lt;$1$2$3&gt;");
    str = str.replace(/(alert|cmd|passthru|eval|exec|system|fopen|fsockopen|file|file_get_contents|readfile|unlink)(\s*)\((.*?)\)/gi, "$1$2&#40;$3&#41;");
    var bad = new Array('document.cookie', 'document.write', 'window.location', "javascript\\s*:", "Redirect\\s+302");
    var myRegExp;
    for (var val in bad) {
      myRegExp = new RegExp(bad[val], "gi");
      str = str.replace(myRegExp, bad[val]);
    }
    
    str = str.replace(/<!--/g,"&lt;!--");
    str = str.replace(/-->/g,"--&gt;");
    
    return str;
  }


  /**
   * Removes HTML Tags
   * @author Dennis Schneider
   */
  function stripTags (input, allowed) {
    allowed = (((allowed || "") + "")
      .toLowerCase()
      .match(/<[a-z][a-z0-9]*>/g) || [])
      .join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
    commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, '').replace(tags, function($0, $1) {
      return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
  }


  /**
   * Replace a link in a given text with a clickable link
   * @author Dennis Schneider, Marvin Labod
   */
  function replaceLinks(text) {
    // HTTP/HTTPS/FTP Links
    text = text.replace(
      /((http|https|ftp):\/\/[\w?=&.\-\/-;#~%-\ü\( \)]+(?![\w\s?&.\/;#~%"=-]*>))/g,
      "<a href='$1'>$1</a>"
    );
    
    // FILE Links (Windows)
    text = text.replace(
      /(file:\/\/\/[a-zA-Z]:\/)(\w.+)\.([a-zA-Z0-9]{1,5})/g,
      "<span class='openApp'>$1$2.$3</span>"
    );
    
    // Local File System Links (Mac)
    text = text.replace(
      /(^|\s)(\/\w.+)\.([a-zA-Z0-9]{1,5})/g,
      "<span class='openApp'>$1$2.$3</span>"
    );
    
    // Email addresses
    text = text.replace(
      /(([a-z0-9*._+]){1,}\@(([a-z0-9]+[-]?){1,}[a-z0-9]+\.){1,}([a-z]{2,4}|museum)(?![\w\s?&.\/;#~%"=-]*>))/g,
      '<a href="mailto:$1">$1</a>'
    );
    
    return text;
  }


  /**
   * Replace the normal line break after enter it into a textarea to the HTML line break tag
   * @author Marvin Labod
   */
  function replaceBreaks(text) {
    return text.replace(/\n/g, '<br/>');
  }


  return {
    "in_array": in_array,
    "is_array": is_array,
    "setTitle": setTitle,
    "str_replace": str_replace,
    "is_integer": is_integer,
    "is_email": is_email,
    "ucfirst": ucfirst,
    "setToFuture": setToFuture,
    "convertString": convertString,
    "replaceHttpLink": replaceHttpLink,
    "xssClean": xssClean,
    "stripTags": stripTags,
    "replaceLinks": replaceLinks,
    "replaceBreaks": replaceBreaks
  };

})(window, document, wunderlist);