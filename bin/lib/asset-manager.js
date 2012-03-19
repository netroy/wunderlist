/*global require:false, module:false, __dirname:false, console:false */
(function() {

  "use strict";

  var uglify = require("uglify-js"),
      stylus = require('stylus'),
      fs = require('fs'),
      url = require('url'),
      async = require('async'),
      path = require('path'),
      dirname = path.dirname,
      join = path.join,
      baseDir = join(__dirname + '/../..');

  var assetMap = {
    'js': {
      'base': {
        'expires': 0,
        'files': ['libs/json2', 'libs/require', 'libs/jquery', 'libs/underscore', 'libs/async',
                  'helpers/settings', 'helpers/language', 'helpers/titanium', 'frontend/layout'],
        'compress': true
      },
      'appbase': {
        'expires': 100,
        'files': ['helpers/settings', 'helpers/language', 'helpers/titanium', 'frontend/layout'],
        'compress': true
      },
      'libs': {
        'expires': 0,
        'files': ['libs/jquery-ui', 'libs/backbone'],
        'compress': true
      },
      'app': {
        'expires': 100,
        'files': [
          'backend/account', 'backend/sync',
          'models/base', 'models/list', 'models/task',
          'views/base', 'views/list', 'views/task',
          'frontend/background', 'frontend/dialogs', 'frontend/filters',
          'frontend/menu','frontend/sharing', 'frontend/sidebar'
        ],
        'compress': true
      }
    },
    'css': {
      'base': {
        'expires': 0,
        'files': ['src/base', 'src/scrollbars'],
        'compress': true
      },
      'login': {
        'expires': 100,
        'files': ['src/login'],
        'compress': true
      },
      'app': {
        'expires': 100,
        'files': ['src/background', 'src/layout', 'src/sharing', 'src/menu', 'src/sidebar', 'src/list'],
        'compress': true
      }
    },
    'templates': {

    }
  };

  var stylusImportPath = join(baseDir + '/css/src');

  var compilerMap = {
    'js': function(asset, code, compress, callback) {
      code = '/** ' + asset + '**/\n' + (compress ? uglify(code) : code) + ';\n';
      callback(null, code);
    },
    'css': function(asset, code, compress, callback) {
      stylus(code, {
        'compress': compress,
        'paths': [stylusImportPath]
      }).render(callback);
    },
    'generic': function(asset, code, compress, callback) {
      callback(null, code);
    }
  };

  function error(next) {
    return function(err) {
      next('ENOENT' == err.code ? null : err);
    };
  }

  var validAssetRegExp = /(js|css|templates)\/(\w+)-min\.(js|css|templates)$/;
  module.exports = function AssetManager(req, res, next) {
    if ('GET' != req.method && 'HEAD' != req.method) return next();
    var path = url.parse(req.url).pathname, filePath, compress;
    var match = path.match(validAssetRegExp), name, type, toBuild;
    if (match !== null && match.length >= 4 && match[1] === match[3]) {
      filePath = join(baseDir , path);
      name = match[2];
      type = match[3];
      toBuild = assetMap[type][name];
      if(toBuild === undefined) {
        return next();
      }
      compress = ('nocompress' in req.query) ? false : toBuild.compress;

      fs.stat(filePath, function(err, stat) {
        if('nocache' in req.query || err) {
          // Create if doesn't exist or expired or explicitely asked for nocache in request query
          async.map(toBuild.files, function(asset, callback) {
            asset = asset + '.' + ((type === 'css')?'styl':type);
            var assetPath = join(baseDir , type, asset),
                assetCompiler = compilerMap[type] || compilerMap['generic'];
            fs.readFile(assetPath, function(err, buffer) {
              if(err){
                callback(err);
              } else {
                assetCompiler(asset, buffer.toString(), compress, callback);
              }
            });
          }, function(err, data) {
            if(err){
              throw err;
            } else {
              fs.writeFile(filePath, data.join('\n'), 'utf8', next);
            }
          });

        } else {
          if(toBuild.expires > (new Date() - stat.mtime)) {
            console.log("old file");
          }
          next();
        }
      });
    } else {
      next();
    }
  };
  
})();