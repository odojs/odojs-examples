// Generated by CoffeeScript 1.9.1
var body, component, exe, fn, hook, hub, i, len, loading, odoql, page, ref, ref1, relay, root, route, router, scene, widget;

hub = require('odo-hub');

ref = require('odojs'), component = ref.component, widget = ref.widget, hook = ref.hook;

odoql = require('odoql/odojs');

component.use(odoql);

widget.use(odoql);

hook.use(odoql);

exe = require('odoql-exe');

exe = exe({
  hub: hub
});

require('./shared/');

relay = require('odo-relay');

router = require('./shared/router');

root = document.querySelector('#root');

scene = relay(root, router, exe, {
  queries: window.__queries,
  state: window.__state,
  hub: hub
});

route = require('odo-route');

page = require('page');

ref1 = route.routes();
fn = function(route) {
  return page(route.pattern, function(e) {
    return scene.update(route.cb({
      url: e.pathname,
      params: e.params
    }));
  });
};
for (i = 0, len = ref1.length; i < len; i++) {
  route = ref1[i];
  fn(route);
}

hub.all(function(e, description, p, cb) {
  var timings;
  if (e === 'queries starting') {
    console.log("? " + p.description);
  } else if (e === 'queries completed') {
    timings = Object.keys(p).map(function(prop) {
      return "  " + prop + " in " + p[prop] + "ms";
    }).join('\n');
    console.log("√ completed\n" + timings);
  } else {
    console.log("+ " + description);
  }
  return cb();
});

page();

body = document.querySelector('body');

loading = document.querySelector('#loading');

body.removeChild(loading);
