/*global require:false, module:false, __dirname:false */
module.exports = (function(undefined) {

  "use strict";

  var fs = require('fs'),
      syncData, http, postOptions, devMode,
      dataDir = __dirname + '/../data',
      versionData = fs.readFileSync(dataDir + "/version.txt");

  function proxyCallback(req, resp) {
    var body = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk) {
      body += chunk;
    });
    req.on('end', function() {
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
  }

  function dummyJSONCallback(dummyReply) {
    return function(req, resp){
      resp.writeHead(200, "Content-type: text/json");
      resp.write(dummyReply);
      resp.end();
    };
  }


  function router(app) {
    app.get("/version.txt", dummyJSONCallback(versionData));
    if(devMode) {
      app.post("/login", dummyJSONCallback('{"code": 200,"user_id": "1140994"}'));
      app.post("/1.2.0", function(req, resp) {
        dummyJSONCallback(syncData[req.body.step || 0])(req, resp);
      });
    } else {
      app.post(/^\/(register|login|password|invite|(edit|delete)-account|1\.2\.0)\/?$/, proxyCallback);
    }
  }

  return function(mode) {
    devMode = mode;
    if(devMode) {
      syncData = ['',
        fs.readFileSync(dataDir + "/step1.json"),
        fs.readFileSync(dataDir + "/step2.json")
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

    return router;
  };

})();