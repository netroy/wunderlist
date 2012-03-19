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

  // This module minifies & concats CSS, JS & templates
  app.use(require('./lib/asset-manager'));

  app.use(connect['static'](baseDir,  {
    maxAge: 86400*365
  }));

  app.use(connect.router(require('./lib/routes')(devMode)));

  if (!module.parent) {
    app.listen(port);
    console.log("Static HTTP server in "+(devMode?'development':'production')+" mode");
    console.log("http://localhost:" + port + "/v2/");
    console.log("Press CTRL + C to stop");
  }

})();