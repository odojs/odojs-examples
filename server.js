// Generated by CoffeeScript 1.9.2
var Exe, app, bodyParser, buildqueries, component, compression, exe, express, fs, hook, hub, odoql, oneDay, oneshot, path, port, queryexe, ref, route, router, store, stringify, widget;

hub = require('odo-hub');

ref = require('odojs'), component = ref.component, widget = ref.widget, hook = ref.hook;

odoql = require('odoql/odojs');

component.use(odoql);

widget.use(odoql);

hook.use(odoql);

stringify = require('odojs/stringify');

component.use(stringify);

fs = require('fs');

store = require('odoql-store');

store = store().use('users', function(params, cb) {
  return fs.readFile('./users.json', function(err, buf) {
    if (err != null) {
      return cb(err);
    }
    return cb(null, JSON.parse(buf.toString()));
  });
}).use('long', function(params, cb) {
  return setTimeout(function() {
    return cb(null, '5s Delayed Query');
  }, 5000);
});

Exe = require('odoql-exe');

exe = Exe({
  hub: hub
});

require('./shared/');

express = require('express');

app = express();

compression = require('compression');

app.use(compression());

bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

oneDay = 1000 * 60 * 60 * 24;

path = require('path');

app.use('/dist', express["static"](path.join(__dirname, 'dist'), {
  maxAge: oneDay
}));

app.get('/favicon.ico', function(req, res) {
  return res.status(404).end();
});

buildqueries = require('odoql-exe/buildqueries');

queryexe = Exe({
  hub: hub
}).use(require('odoql-json')).use(require('odoql-csv')).use(store);

app.post('/query', function(req, res, next) {
  var run;
  run = buildqueries(queryexe, req.body.q);
  return run(function(errors, results) {
    if (errors != null) {
      return next(errors);
    }
    return res.send(results);
  });
});

router = require('./shared/router');

route = require('odo-route');

oneshot = require('odo-relay/oneshot');

app.get('/*', function(req, res) {
  var params;
  params = route(req.url);
  if ((params != null ? params.status : void 0) != null) {
    res.status(params.status);
  }
  return oneshot(exe, router, params, function(err, result) {
    if (err != null) {
      return res.status(500).send(err);
    }
    return res.send("<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset=\"utf-8\">\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge, chrome=1\" />\n    <meta name=\"viewport\" content=\"width=700\">\n    <title>Odo.js Examples</title>\n    <link rel=\"stylesheet\" href=\"/dist/odojs-handbook-1.0.0.min.css\" />\n  </head>\n  <body>\n    <div id=\"loading\" class=\"wrapper\" style=\"display: none;\">\n      <p>Loading too slow, something is wrong</p>\n    </div>\n    <script src=\"/dist/loading.js\"></script>\n    <script>\n      window.__queries = " + (JSON.stringify(result.queries)) + ";\n      window.__state = " + (JSON.stringify(result.state)) + ";\n    </script>\n    " + result.html + "\n    <script src=\"/dist/odojs-handbook-1.0.0.min.js\"></script>\n  </body>\n</html>");
  });
});

port = 8085;

app.listen(port);

console.log("Odo.js examples are listening on port " + port + "...");
