#!/usr/bin/env node

var connect = require('connect'),
    app = connect.createServer(),
     fs = require('fs'),
    port = process.env.StaticPort || 8888;

var syncData = ['', fs.readFileSync(__dirname + "/step1.json"), fs.readFileSync(__dirname + "/step2.json")];

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
}));

app.listen(parseInt(port, 10));

console.log("Static HTTP server at => http://localhost:" + port + "/\nPress CTRL + C to stop");
