#!/usr/bin/env node
/*global require:false, module:false, process:false, __dirname:false, console:false */
(function() {

  "use strict";

  var connect = require('connect'),
      stylus = require('stylus'),
      fs = require('fs'),
      app = module.exports = connect.createServer(),
      devMode = (process.env.NODE_ENV || '').toLowerCase() !== 'production',
      versionData = fs.readFileSync(__dirname + "/data/version.txt"),
      baseDir = __dirname + "/..",
      syncData, http, postOptions,
      port = parseInt(process.env.app_port, 10) || 12587;

  if(devMode) {
    syncData = ['',
      fs.readFileSync(__dirname + "/data/step1.json"),
      fs.readFileSync(__dirname + "/data/step2.json")
    ];
  } else {
    http = require('http');
    postOptions = {
      host: 'sync.wunderlist.net',
      port: '80',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Host': 'sync.wunderlist.net',
        'Origin': 'http://sync.wunderlist.net',
        'Referer': 'http://www.wunderlist.net/home'
      }
    };
  }


  app.use(stylus.middleware({
    'src': baseDir + '/src',
    'dest': baseDir + '/',
    'compile': function (str, path, fn) {
      return stylus(str).set('filename', path).set('compress', true);
    }
  }));

  app.use(connect.bodyParser());
  app.use(connect['static'](baseDir));
  app.use(connect.router(function(router) {
    if(devMode) {
      router.post("/login", function(req, resp){
        resp.writeHead(200, "Content-type: text/json");
        resp.write('{"code": 200,"user_id": "1140994"}');
        resp.end();
      });
      router.post("/1.2.0", function(req, resp){
        resp.writeHead(200, "Content-type: text/json");
        resp.write(syncData[req.body.step || 0]);
        resp.end();
      });
    } else {
      router.post(/^\/(register|login|password|invite|(edit|delete)-account|1\.2\.0)\/?$/, function(req, resp){
        var body = '';
        req.setEncoding('utf8');
        req.on('data', function(chunk) {
          body += chunk;
        });
        req.on('end', function(){
          postOptions.path = req.url;
          postOptions.headers['Content-Length'] = body.length;
          var postRequest = http.request(postOptions, function(response) {
            response.headers['Content-Type'] = 'application/json';
            resp.writeHead(response.statusCode, response.headers);
            response.setEncoding('utf8');
            response.on('data', function (chunk) {
              resp.write(chunk);
            });
            response.on('end', function () {
              resp.end();
            });
          });
          postRequest.write(body);
          postRequest.end();
        });
      });
    }
    router.get("/version.txt", function(req, resp){
      resp.writeHead(200, "Content-type: text/json");
      resp.write(versionData);
      resp.end();
    });
  }));

  //if (!module.parent) {
    app.listen(port);
    console.log("Static HTTP server in "+(devMode?'development':'production')+" mode");
    console.log("http://localhost:" + port + "/v2/");
    console.log("Press CTRL + C to stop");
  //}

})();