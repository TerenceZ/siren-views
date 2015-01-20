"use strict";

/**
 * Module dependencies.
 */

var debug = require("debuglog")("siren-views");
var path = require("path");
var assign = require("object-assign");
var cons = require("co-views");
var send = require("koa-send");
var caller = require("caller");

/**
 * Add `render` method
 *
 * @param {String} dir (optional)
 * @param {Object} opts (optional)
 * @api public
 */

module.exports = function (dir, opts) {

  var render;

  if (!dir || typeof dir === "object") {
    opts = dir;
    dir = "";
  }

  opts = opts || {};
  opts.map = opts.map || {};
  opts.default = opts.default || "html";
  dir = path.resolve(path.dirname(caller()), dir);

  debug("mount at %s with options %s", dir, opts);

  return function *views (next) {

    if (this.render) {
      return yield *next;
    }

    /**
     * Render `view` with `state`.
     *
     * @param {String} view
     * @param {Object} state
     * @return {GeneratorFunction}
     * @api public
     */

    this.render = function *renderView(view, state) {

      var ext, file;

      if(view.slice(-1) === "/"){
        view += "index";
      }

      file = view;
      ext = path.extname(view);
      if (!ext) {
        ext = opts.default;
        file = view + "." + ext;
      } else {
        ext = ext.slice(1);
      }

      state = assign(state || {}, this.state);

      debug("render `%s` with %s", file, state);

      if (ext === "html" && !opts.map["html"]) {
        return yield send(this, path.join(dir, file));
      }

      if (!render) {
        render = cons(dir, opts);
      }

      this.body = yield render(view, state);
      this.type = "text/html";
    };

    yield *next;
  }
}
