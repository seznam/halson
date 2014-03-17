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

## API

### `Resource(object, selfLink)`
Creates new resource object.
 * `object` (optional): attributes of resource
 * `selfLink` (optional): self-link as a string or a link object

### `Resource#link(rel, link)`
Adds a link.
* `rel`: relation name
* `link`: link (object or string)

### `Resource#curie(name, template)`
Adds a named CURIE template.
 * `name`: CURIE's name
 * `template`: CURIE's template

### `Resource#embed(rel, embed)`
Adds an embedded resource.
 * `rel`: relation name
 * `embed`: resource to be embedded (object or Resource)

### `Resource#set(key, value)`
Sets resource attribute.

### `Resource#toObject()`
Converts resource to a Javascript Object.

### `Resource#toJSON(space)`
Converts resource to a serialized JSON string.

### `parse(data)`
Parse data (serialized JSON string or an Object) and returns instance of `ParsedResource`.

### `ParsedResource#get(key)`
Reads resource attribute.

### `ParsedResource#self(attribute)`
Reads attribute of self-relation link.

### `ParsedResource#links(rel)`
Returns all links with relation `rel`.

### `ParsedResource#link(rel)`
Returns first link with relation `rel`.

### `ParsedResource#linkByName(rel, name)`
Returns first link with relation `rel` and name `name`.

### `ParsedResource#embeds(rel)`
Returns all embedded resources with relation `rel`.

### `ParsedResource#embed(rel)`
Returns first embedded resource with relation `rel`.

### `ParsedResource#embedByURI(rel, uri)`
Returns embedded resource with relation `rel` and self-link URI `uri`.
