# odo-relay and odo-exe use an optional odo-hub for logging and statistics
hub = require 'odo-hub'

# Configure odoql with mixins
{ component, widget } = require 'odojs'
odoql = require 'odoql/odojs'
component.use odoql
widget.use odoql

# Setup client odoql execution providers
# TODO add more providers to give components more query options
exe = require 'odoql-exe'
exe = exe hub: hub

# Shared components register against injectinto
require './shared/'

# Setup odo relay against the root router component
# Discover queries, state and dom elements already built on the server
relay = require 'odo-relay'
router = require './shared/router'
root = document.querySelector '#root'
scene = relay root, router, exe,
  queries: window.__queries
  state: window.__state
  hub: hub

# Load routes into page.js for pushstate routing
route = require 'odo-route'
page = require 'page'
for route in route.routes()
  do (route) ->
    page route.pattern, (e) ->
      scene.update route.cb
        url: e.pathname
        params: e.params

# Log all events, with special logging for queries
hub.all (e, description, p, cb) ->
  if e is 'queries starting'
    console.log "? #{p.description}"
  else if e is 'queries completed'
    timings = Object.keys(p)
      .map (prop) ->
        "  #{prop} in #{p[prop]}ms"
      .join '\n'
    console.log "√ completed\n#{timings}"
  else
    console.log "+ #{description}"
  cb()

# TODO: Listen to custom events from components and call
# scene.update with param changes to re-query or call
# page() to change the url and move to a different route

# Detect the current url and run scene.update for the first time
page()

# Remove the loading element so the timeout detector knows we loaded successfully
body = document.querySelector 'body'
loading = document.querySelector '#loading'
body.removeChild loading