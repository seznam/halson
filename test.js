var assert = require('assert');
var hal = require('./index');

describe('Resource', function() {
    describe('constructor', function(){
        it('should construct an empty Resource', function() {
            var res = new hal.Resource();
            assert.deepEqual(res.toObject(), {});
        });

        it('should use provided data', function() {
            var data = {a: 1, b: 2};
            var res = new hal.Resource(data);
            assert.deepEqual(res.toObject(), data);
        });

        it('should link a self-relation (plain)', function() {
            var data = {a: 1, b: 2};
            var res = new hal.Resource(data, '/me');
            data._links = {
                self: {href: '/me'}
            }
            assert.deepEqual(res.toObject(), data);
        });

        it('should link a self–relation (object)', function() {
            var data = {a: 1, b: 2};
            var self = {href: '/me', profile: 'x:prof', name: 'lorem-ipsum'};
            var res = new hal.Resource(data, self);
            data._links = {
                self: self
            }
            assert.deepEqual(res.toObject(), data);
        });
    });

    describe('links', function() {
        it('should set a link (plain)', function() {
            var res = new hal.Resource();
            res.link('self', '/me');
            assert.deepEqual(res.toObject(), {
                _links: {
                    self: {href: '/me'}
                }
            });
        });

        it('should set a link (object)', function() {
            var res = new hal.Resource();
            res.link('self', {href:'/me', profile:'/profile'});
            assert.deepEqual(res.toObject(), {
                _links: {
                    self: {href:'/me', profile:'/profile'}
                }
            });
        });

        it('should set multiple links', function() {
            var res = new hal.Resource();
            res.link('next', '/next-resource');
            res.link('related', '/related-resources/1');
            res.link('related', {
                href: '/related-resources/2',
                title: 'Second Related Resource'
            });
            assert.deepEqual(res.toObject(), {
                _links: {
                    next: {
                        href: '/next-resource'
                    },
                    related: [
                        {href:'/related-resources/1'},
                        {
                            href: '/related-resources/2',
                            title: 'Second Related Resource'
                        }
                    ]
                }
            });
        });
    });

    describe('curies', function() {
        it('should create a curie', function(){
            var res = new hal.Resource();
            res.curie('ex', '/rels/{rel}');
            assert.deepEqual(res.toObject(), {
                _links: {
                    curies: [{
                        name: 'ex',
                        href: '/rels/{rel}',
                        templated: true
                    }]
                }
            });

            var res = new hal.Resource();
            res.link('curies', {href: '/rels/{rel}', name: 'ex'});
            assert.deepEqual(res.toObject(), {
                _links: {
                    curies: [{
                        name: 'ex',
                        href: '/rels/{rel}',
                        templated: true
                    }]
                }
            });
        });

        it('should reject an invalid curie', function() {
            var res = new hal.Resource();
            assert.throws(function() {
                    res.link('curies', '/invalid/curie');
                }, Error
            );

            var res = new hal.Resource();
            assert.throws(function() {
                    res.link('curies', {href: '/invalid/curie', name: 'ex', templated: true});
                }, Error
            );

            var res = new hal.Resource();
            assert.throws(function() {
                    res.link('curies', {href: '/invalid/curie/{rel}', templated: true});
                }, Error
            );
        });
    });

    describe('embedded', function() {
        it('should embed a nested resource', function() {
            var nested = new hal.Resource({name: "Acme co."}, '/company/acme');
            var res = new hal.Resource({name: "Harry"}, '/harry');
            res.embed("up", nested);
            assert.deepEqual(res.toObject(), {
                _links: {
                    self: {href:'/harry'}
                },
                name: "Harry",
                _embedded: {
                    up: {
                        _links: {
                            self: {href: '/company/acme'}
                        },
                        name: "Acme co."
                    }
                }
            });

        });

        it('should embed a nested resources', function() {
            var nested1 = new hal.Resource({name: "Acme co."}, '/company/acme');
            var nested2 = new hal.Resource({name: "Acme2 co."}, '/company/acme2');
            var res = new hal.Resource({name: "Harry"}, '/harry');
            res.embed("up", nested1);
            res.embed("up", nested2);
            assert.deepEqual(res.toObject(), {
                _links: {
                    self: {href:'/harry'}
                },
                name: "Harry",
                _embedded: {
                    up: [{
                        _links: {
                            self: {href: '/company/acme'}
                        },
                        name: "Acme co."
                    },
                    {
                        _links: {
                            self: {href: '/company/acme2'}
                        },
                        name: "Acme2 co."
                    }]
                }
            });
        });

        it('should embed a nested object', function() {
            var nested = new hal.Resource({name: "Acme co."}, '/company/acme');
            var nested = nested.toObject();
            var res = new hal.Resource({name: "Harry"}, '/harry');
            res.embed("up", nested);
            assert.deepEqual(res.toObject(), {
                _links: {
                    self: {href:'/harry'}
                },
                name: "Harry",
                _embedded: {
                    up: {
                        _links: {
                            self: {href: '/company/acme'}
                        },
                        name: "Acme co."
                    }
                }
            });
        });
    });

    describe('properties', function() {
        it('should set a property', function() {
            var res = new hal.Resource();
            res.set('name', 'Harry');
            res.set('job', 'CEO');
            var address = {
                street: '1 Infinite Loop',
                city: 'Cupertino',
                state: 'CA',
                code: 95014
            }
            res.set('address', address);
            assert.deepEqual(res.toObject(), {
                name: 'Harry',
                job: 'CEO',
                address: address
            });
        });

        it('should reject _links', function() {
            var res = new hal.Resource();
            assert.throws(function() {
                    res.set('_links', {});
                }, Error
            );
        });

        it('should reject _embedded', function() {
            var res = new hal.Resource();
            assert.throws(function() {
                    res.set('_embedded', {});
                }, Error
            );
        });
    });

    describe('export', function() {
        it('should export as Object', function() {
            var res = new hal.Resource({a: 1, b: 2});
            assert.deepEqual(res.toObject(), {a: 1, b: 2});
        });

        it('should export as JSON', function() {
            var res = new hal.Resource({a: 1, b: 2});
            assert.equal(res.toJSON(), '{"a":1,"b":2}');
        });
    });
});

describe('parse', function() {
    var self = {"href": "/harry", "profile": "/profile"};
    var rel1 = {"href": "/related/1", "name": "r1"};
    var rel2 = {"href": "/related/2", "name": "r2"};
    var curie = {name: 'ex', templated: true, href: "/rels/{rel}"};
    var data = JSON.stringify({
        _links: {
            self: self,
            related: [rel1, rel2],
            curies: [curie]
        },
        name: "Harry",
        job: "CEO",
        _embedded: {
            "next": {
                _links: {
                    self: {href: "/bobby"}
                },
                name: "Bobby",
                job: "Developer"
            },
            "related": [{
                _links: {
                    self: rel1
                },
                headline: "R 1"
            }, {
                _links: {
                    self: rel2
                },
                headline: "R 2"
            }]
        }
    });

    describe('_links', function(){
        it('link()', function(){
            var res = hal.parse(data);
            assert.deepEqual(res.link("self"), self);
            assert.deepEqual(res.link("related"), rel1);
        });

        it('links()', function(){
            var res = hal.parse(data);
            assert.deepEqual(res.links("related"), [rel1, rel2]);
            assert.deepEqual(res.links("not-related"), []);
        });

        it('linkByName()', function(){
            var res = hal.parse(data);
            assert.deepEqual(res.linkByName("related", "r2"), rel2);
        });
    });

    describe('_embedded', function(){
        it('embed()', function(){
            var res = hal.parse(data);
            var next = res.embed("next");
            assert.deepEqual(next.link("self").href, "/bobby");
        });

        it('embeds()', function(){
            var res = hal.parse(data);
            var next = res.embeds("next")[0];
            assert.deepEqual(next.link("self").href, "/bobby");
        });

        it('embedByURI', function(){
            var res = hal.parse(data);
            var embed = res.embedByURI('related', '/related/1');
            assert.equal(embed.link('self').href, '/related/1');
        });
    });

    describe('properties', function(){
        it('should get a property', function() {
            var res = hal.parse(data);
            assert.equal(res.get('name'), 'Harry');
            assert.equal(res.get('job'), 'CEO');
        });

        it('should get a self-relation', function() {
            var res = hal.parse(data);
            assert.deepEqual(res.self(), self);
        });

        it('should get a self-relation attribute', function() {
            var res = hal.parse(data);
            assert.equal(res.self('href'), '/harry');
            assert.equal(res.self('profile'), '/profile');
        });
    });
});