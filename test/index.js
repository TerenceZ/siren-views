"use strict";

var request = require("supertest");
var views = require("..");
var should = require("should");
var koa = require("koa");
var path = require("path");


describe("siren-views", function () {

  it("have a render method", function (done) {

    var app = koa();
    app.use(views())
    .use(function *() {

      this.render.should.ok;
      this.render.should.Function;
      this.status = 204;
    })

    request(app.listen())
    .get("/")
    .expect(204, done);
  });

  it("default to html", function (done) {

    var app = koa();
    app.use(views())
    .use(function *() {

      yield this.render("./fixtures/basic");
    });

    request(app.listen())
    .get("/")
    .expect("Content-Type", /html/)
    .expect(/basic:html/)
    .expect(200, done);
  });

  it("should return and yield next if `ctx.render` exists", function (done) {

    var app = koa();
    app.use(function *(next) {

      this.render = true;
      yield *next;
    })
    .use(views())
    .use(function *() {

      this.render.should.be.true;
      this.status = 204;
    });

    request(app.listen())
    .get("/")
    .expect(204, done);
  });

  it("can pass path with .html when default to html", function (done) {

    var app = koa();
    app.use(views("./fixtures"))
    .use(function *() {

      yield this.render("./basic.html");
    });

    request(app.listen())
    .get("/")
    .expect("Content-Type", /html/)
    .expect(/basic:html/)
    .expect(200, done);
  });

  it("can render html when default to non-html", function (done) {

    var app = koa();
    app.use(views({ default: "jade" }))
    .use(function *() {

      yield this.render("./fixtures/basic.html");
    });

    request(app.listen())
    .get("/")
    .expect("Content-Type", /html/)
    .expect(/basic:html/)
    .expect(200, done);
  });

  it("default to [ext] if a default engine is set", function (done) {

    var app = koa();
    app.use(views({ default: "jade" }))
    .use(function *() {

      yield this.render("./fixtures/basic");
    });

    request(app.listen())
    .get("/")
    .expect("Content-Type", /html/)
    .expect(/basic:jade/)
    .expect(200, done);
  });

  it("can pass path with .[ext] when default to [ext]", function (done) {

    var app = koa();
    app.use(views({ default: "jade" }))
    .use(function *() {

      yield this.render("./fixtures/basic.jade");
    });

    request(app.listen())
    .get("/")
    .expect("Content-Type", /html/)
    .expect(/basic:jade/)
    .expect(200, done);
  });

  it("set and render state", function (done) {

    var app = koa();
    app.use(views({ default: "jade" }))
    .use(function *() {

      this.state.engine = "jade";
      yield this.render("./fixtures/global-state");
    });

    request(app.listen()).get("/")
      .expect("Content-Type", /html/)
      .expect(/basic:jade/)
      .expect(200, done);
  });

  it("works with circular references in state", function (done) {

    var app = koa();
    app.use(views({ default: "jade" }))
    .use(function *() {

      this.state.a = {};
      this.state.app = this.app;
      this.state.a.a = this.state.a;

      yield this.render("./fixtures/global-state", {
        app: app,
        b: this.state,
        engine: "jade"
      });
    });

    request(app.listen())
    .get("/")
    .expect("Content-Type", /html/)
    .expect(/basic:jade/)
    .expect(200, done);
  });

  it("`map` given `engine` to given file `ext`", function (done) {

    var app = koa();
    app.use(views({ map: {html: "underscore"} }))
    .use(function *() {

      this.state.engine = "underscore";
      yield this.render("./fixtures/underscore");
    });

    request(app.listen())
    .get("/")
    .expect("Content-Type", /html/)
    .expect(/basic:underscore/)
    .expect(200, done);
  });

  it("merge global and local state ", function (done) {

    var app = koa();
    app.use(views({ default: "jade" }))
    .use(function *() {

      this.state.engine = "jade";
      yield this.render("./fixtures/state", {
        type: "basic"
      });
    });

    request(app.listen())
    .get("/")
    .expect("Content-Type", /html/)
    .expect(/basic:jade/)
    .expect(200, done);
  });

  it("default to ./index.[ext] when slash trailing", function (done) {

    var app = koa();
    app.use(views({ default: "jade" }))
    .use(function *() {

      yield this.render("./fixtures/");
    });

    request(app.listen())
    .get("/")
    .expect("Content-Type", /html/)
    .expect(/index:jade/)
    .expect(200, done);
  });
});