siren-views
==========

[![Build Status](https://secure.travis-ci.org/TerenceZ/siren-views.png)](http://travis-ci.org/TerenceZ/siren-views)

Template rendering middleware for koa, modified from [koa-views](https://github.com/queckezz/koa-views):
* instead of `ctx.locals`, we use `ctx.state` to store template context.
* `return yield *next` if `ctx.render` exists (no matter what the type is).

## Example

```js
var koa = require('koa');
var views = require('siren-views');

var app = koa();

app.use(views('views', {
  default: 'jade',
  map: {
    html: underscore
  }
}));

app.use(function* (next) {
  this.state.session = this.session;
  this.state.title = 'app';

  yield this.render('user', {
    user: 'John'
  });
});
```

## API

Please refer to [koa-views](https://github.com/queckezz/koa-views).

## Tests

Tests use [mocha](https://github.com/visionmedia/mocha) and can be run
with [npm](https://npmjs.org):

```
npm test
```

## License

[MIT](./license)