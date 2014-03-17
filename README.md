# HALSON
Fault-tolerant [hal+json](http://stateless.co/hal_specification.html) parser and writer.

## Install

### node.js

```sh
npm install halson --save
```

## Examples

### Writing the HAL
```js
var hal = require('halson');

var resource = new hal.Resource({name: "Harry"}, '/harry');

resource.link('next', '/johnnie');

resource.link('avatar', {
    type: 'image/png',
    href: '/avatars/harry.png'
});

var company = new hal.Resource({name: "Acme co."}, {
    href: '/acme',
    profile: 'http://microformats.org/wiki/microformats2',
    type: 'text/html'
});

resource.curie('ex', '/doc/rels/{rel}');
resource.embed('ex:company', company);

console.log(resource.toJSON('\t'));
```

### Reading the HAL
```js
var hal = require('halson');
var data = '{"title":"Lorem Ipsum","_links":{"self":{"href":"/lorem"}}}';
var resource = hal.parse(data);

console.log(resource.get('title'));
// Lorem Ipsum

console.log(resource.link('self'));
// { href: '/lorem' }
```
