#!/usr/bin/env node

var connect = require('connect'),
    app = module.exports = connect.createServer(),
    fs = require('fs'),
    port = 8888;

var syncData = ['', 
                fs.readFileSync(__dirname + "/data/step1.json"), 
                fs.readFileSync(__dirname + "/data/step2.json")
               ];
var versionData = fs.readFileSync(__dirname + "/data/version.txt");

app.use(connect.bodyParser());
app.use(connect.static(process.cwd()));
app.use(connect.router(function(router){
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
  router.get("/version.txt", function(req, resp){
    resp.writeHead(200, "Content-type: text/json");
    resp.write(versionData);
    resp.end();
  });
}));

if (!module.parent) {
  app.listen(parseInt(process.env.app_port, 10) || port);
  console.log("Static HTTP server at => http://localhost:" + port + "/\nPress CTRL + C to stop");
}
