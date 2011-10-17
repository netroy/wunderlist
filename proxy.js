#!/usr/bin/env node

var connect = require('connect'),
    app = connect.createServer(),
    port = process.env.StaticPort || 8888;

var syncData = require('fs').readFileSync(__dirname + "/sync.json");

app.use(connect.static(process.cwd()));
app.use(connect.router(function(router){
  router.post("/login", function(req, resp){
    resp.writeHead(200, "Content-type: text/json");
    resp.write('{"code": 200,"user_id": "1140994"}');
    resp.end();
  });
  router.post("/1.2.0", function(req, resp){
    resp.writeHead(200, "Content-type: text/json");
    resp.write(syncData);
    resp.end();
  });
}));

app.listen(parseInt(port, 10));

console.log("Static HTTP server at => http://localhost:" + port + "/\nPress CTRL + C to stop");
