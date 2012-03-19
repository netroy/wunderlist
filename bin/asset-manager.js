/*global require:false, module:false, __dirname:false, console:false */
(function() {

  "use strict";
  var uglify = require("uglify-js"),
      fs = require('fs'),
      url = require('url'),
      async = require('async'),
      path = require('path'),
      mkdirp = require('mkdirp'),
      dirname = path.dirname,
      join = path.join;

  function error(next){
    return function(err) {
      next('ENOENT' == err.code ? null : err);
    };
  }

  module.exports = function AssetManager(req, res, next) {
    if ('GET' != req.method && 'HEAD' != req.method) return next();
    var path = url.parse(req.url).pathname, filePath;
    if (/\-minz\.js$/.test(path)) {
      filePath = join(__dirname + '/../js/min' , path);
      console.log(filePath);
      fs.writeFile(filePath, "hello world", 'utf8', next);
    } else if(/\-template\.json$/.test(path)) {
      // TODO: Implement template concatenator
      next();
    } else {
      next();
    }
  };
  
})();