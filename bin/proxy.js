#!/usr/bin/env node

var connect = require('connect'),
        app = module.exports = connect.createServer(),
         fs = require('fs'),
       http = require('http');

var versionData = fs.readFileSync(__dirname + "/data/version.txt");

var postOptions = {
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

app.use(connect.static(__dirname + "/../"));
app.use(connect.router(function(router){
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

  router.get("/version.txt", function(req, resp){
    resp.writeHead(200, "Content-type: text/json");
    resp.write(versionData);
    resp.end();
  });
}));

if (!module.parent) {
  app.listen(process.env.app_port || 12587);
}
