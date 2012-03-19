#!/usr/bin/env node
/*global require:false, module:false, process:false, __dirname:false, console:false */
(function() {

  "use strict";

  var connect = require('connect'),
      stylus = require('stylus'),
      app = module.exports = connect.createServer(),
      devMode = (process.env.NODE_ENV || '').toLowerCase() !== 'production',
      baseDir = __dirname + "/..",
      port = parseInt(process.env.app_port, 10) || 12587;

  // Query Parser is needed for cache-busting in asset-manager
  app.use(connect.query());

  // BodyParser is needed for fake sync calls
  app.use(connect.bodyParser());

  // This module minifies & concats CSS, JS & templates
  app.use(require('./lib/asset-manager'));

  // Add mimetypes for template files & groups
  var staticProvider = connect['static'];
  staticProvider.mime.types['tmpl'] = 'text/plain';
  staticProvider.mime.types['templates'] = 'application/json';
  app.use(staticProvider(baseDir,  {
    maxAge: 10 //86400*365
  }));

  // Router handles ajax requests which server dummy content in dev mode
  // But acts as a proxy to wunderlist sync servers in production mode
  app.use(connect.router(require('./lib/routes')(devMode)));

  if (!module.parent) {
    app.listen(port);
    console.log("Static HTTP server in "+(devMode?'development':'production')+" mode");
    console.log("http://localhost:" + port + "/v2/");
    console.log("Press CTRL + C to stop");
  }

})();