var assert = require('assert');
var expect = require('chai').expect;
var halson = require('./index');
var nodePkg = require('./package.json');
var bowerPkg = require('./bower.json');

var example = {
    _links: {
        self: {
            href: "/hajovsky",
        },
        avatar: {
            href: "https://avatars0.githubusercontent.com/u/113901?s=460",
            type: "image/jpeg"
        },
        related: [{
            href: "http://hajovsky.sk",
            name: "homepage"
        }, {
            href: "https://twitter.com/hajovsky",
            name: "twitter"
        }]
    },
    title: "Juraj Hájovský",
    username: "hajovsky",
    emails: [
        "juraj.hajovsky@example.com",
        "hajovsky@example.com"
    ],
    stats: {
        starred: 3,
        followers: 0,
        following: 0

    },
    joined: "2009-08-10T00:00:00.000Z",
    _embedded: {
        starred: [
            {
                _links: {
                    self: {
                        href: "/joyent/node"
                    },
                    related: {
                        href: "http://nodejs.org/",
                        title: "nodejs.org",
                        name: "website"
                    },
                    author: {
                        href: "/joyent",
                        title: "Joyent"
                    }
                },
                title: "joyent / node",
                description: "evented I/O for v8 javascript",
                stats: {
                    watched: 2092,
                    starred: 28426,
                    forked: 5962
                }
            },
            {
                _links: {
                    self: {
                        href: "/koajs/koa"
                    },
                    related: {
                        href: "http://koajs.com",
                        title: "koajs.com",
                        name: "website"
                    },
                    author: {
                        href: "/koajs",
                        title: "koajs"
                    }
                },
                title: "koajs / koa",
                description: "Expressive middleware for node.js using generators",
                stats: {
                    watched: 238,
                    starred: 3193,
                    forked: 180
                }
            },
            {
                _links: {
                    self: {
                        href: "/pgte/nock"
                    },
                    author: {
                        href: "/pgte",
                        title: "Pedro Teixeira"
                    }
                },
                title: "pgte / nock",
                description: "HTTP mocking and expectations library",
                stats: {
                    watched: 22,
                    starred: 803,
                    forked: 77
                }
            }
        ]
    }
};

function clone(data) {
    return JSON.parse(JSON.stringify(data));
}

function dump(obj) {
    console.log(JSON.stringify(obj, null, "  "));
}

describe('halson', function() {
    describe('metadata', function() {
        it('bower.json vs. package.json', function() {
            assert.equal(nodePkg.name, bowerPkg.name);
            assert.equal(nodePkg.version, bowerPkg.version);
            assert.equal(nodePkg.description, bowerPkg.description);
            assert.equal(nodePkg.license, bowerPkg.license);
            assert.equal(nodePkg.main, bowerPkg.main);
        });
    });

    describe('factory', function() {
        it('create without data', function() {
            var res = halson();
            var expected = {};
            expect(res.className).to.be.a('string');
            expect(res.className).to.be.equal(halson.Resource.prototype.className);
            assert.deepEqual(res, expected);
        });

        it('create with object', function() {
            var res = halson(clone(example));
            var expected = clone(example);
            assert.deepEqual(res, expected);
        });

        it('ignore prototype of data', function() {
            function X() {
                this.dolor = 'sit';
            }
            X.prototype.lorem = 'ipsum';
            var data = new X();
            var res = halson(data);
            expect(res.lorem).to.be.an('undefined');
            expect(res.dolor).to.be.equal('sit');
        });

        it('create with serialized object', function() {
            var res = halson(JSON.stringify(clone(example)));
            var expected = clone(example);
            assert.deepEqual(res, expected);
        });

        it('prevent double conversion', function() {
            var data = { title: "Untitled"};
            var res1 = halson(data);
            var res2 = halson(res1);
            expect(res1).to.be.equal(res2);
        });
    });

    describe('listLinkRels()', function() {
        it('return empty list', function() {
            var res = halson().listLinkRels();
            var expected = [];
            assert.deepEqual(res, expected);
        });

        it('return existing rels', function() {
            var res = halson(clone(example)).listLinkRels();
            var expected = ['self', 'avatar', 'related'];
            assert.deepEqual(res, expected);
        });
    });

    describe('listEmbedRels()', function() {
        it('return empty list', function() {
            var res = halson().listEmbedRels();
            var expected = [];
            assert.deepEqual(res, expected);
        });

        it('return existing rels', function() {
            var res = halson(clone(example)).listEmbedRels();
            var expected = ['starred'];
            assert.deepEqual(res, expected);
        });
    });

    describe('getLinks()', function() {
        it('return empty list', function() {
            var expected = [];

            var res = halson().getLinks('self');
            assert.deepEqual(res, expected);

            res = halson(clone(example)).getLinks('selfX');
            assert.deepEqual(res, expected);
        });

        it('return links by rel', function() {
            var res = halson(clone(example)).getLinks('avatar');
            assert.deepEqual(res, [example._links.avatar]);

            res = halson(clone(example)).getLinks('related');
            assert.deepEqual(res, example._links.related);
        });

        it('use filterCallback', function() {
            var expected = [{
                href: 'https://twitter.com/hajovsky',
                name: 'twitter'
            }];

            var res = halson(clone(example));
            var links = res.getLinks('related', function(item) {
                return item.name === 'twitter';
            });
            assert.deepEqual(links, expected);

            links = res.getLinks('related', function(item) {
                return Boolean(item.href);
            });
            assert.deepEqual(links, example._links.related);
        });

        it('use begin/end', function() {
            var res = halson(clone(example));
            var links = res.getLinks('related', null, 0);
            assert.deepEqual(links, example._links.related);

            links = res.getLinks('related', null, 1);
            assert.deepEqual(links, example._links.related.slice(1));

            links = res.getLinks('related', null, 0, 1);
            assert.deepEqual(links, example._links.related.slice(0, 1));
        });
    });

    describe('getLink()', function() {
        it('return undefined', function() {
            var res = halson().getLink('selfX');
            expect(res).to.be.an('undefined');

            res = halson(clone(example)).getLink('selfX');
            expect(res).to.be.an('undefined');
        });

        it('return default value', function(){
            var def = {title: "Untitled"};
            var res = halson().getLink('selfX', def);
            assert.deepEqual(res, def);
        });

        it('return link by rel', function() {
            var res = halson(clone(example));

            assert.deepEqual(res.getLink('avatar'), example._links.avatar);
            assert.deepEqual(res.getLink('related'), example._links.related[0]);
        });

        it('use filterCallback', function() {
            var res = halson(clone(example));

            assert.deepEqual(res.getLink('avatar', function(item) {
                return true;
            }), example._links.avatar);

            assert.deepEqual(res.getLink('related', function(item) {
                return item.name === 'twitter';
            }), example._links.related[1]);

            assert.deepEqual(res.getLink('related', function(item) {
                return true;
            }), example._links.related[0]);
        });

        it('use filterCallback w/ default value', function(){
            var res = halson(clone(example));
            var def = {title: "Untitled"};
            assert.deepEqual(res.getLink('related', function(item) {
                return item.name === 'not exists';
            }, def), def);
        });
    });

    describe('getEmbeds()', function() {
        it('return empty list', function() {
            var res = halson();
            assert.deepEqual(res.getEmbeds('asdf'), []);

            res = halson(clone(example));
            assert.deepEqual(res.getEmbeds('asdf'), []);
        });

        it('return embedded as HALSON Resources', function() {
            var res = halson(clone(example));
            var expected = example._embedded.starred.map(function(item) {
                return halson(item);
            });

            var ret = res.getEmbeds('starred');
            assert.deepEqual(ret, expected);
            expect(ret[0].className).to.be.equal(halson.Resource.prototype.className);
        });

        it('user filterCallback', function() {
            var res = halson(clone(example));
            var expected = [halson(example._embedded.starred[1])];
            var embeds = res.getEmbeds('starred', function(item) {
                return item._links.self.href === '/koajs/koa';
            });
            assert.deepEqual(embeds, expected);

            expected = example._embedded.starred.map(function(item) {
                return halson(item);
            });
            embeds = res.getEmbeds('starred', function(item) {
                return true;
            });
            assert.deepEqual(embeds, expected);

            embeds = res.getEmbeds('starred', function(item) {
                return false;
            });
            assert.deepEqual(embeds, []);
        });

        it('use begin/end', function() {
            var res = halson(clone(example));
            var expected = example._embedded.starred.map(function(item) {
                return halson(item);
            });

            var embeds = res.getEmbeds('starred', null, 0);
            assert.deepEqual(embeds, expected);

            embeds = res.getEmbeds('starred', null, 1);
            assert.deepEqual(embeds, expected.slice(1));

            embeds = res.getEmbeds('starred', null, 0, 1);
            assert.deepEqual(embeds, expected.slice(0, 1));
        });
    });

    describe('getEmbed()', function() {
        it('return undefined', function() {
            var res = halson();
            assert.strictEqual(res.getEmbed('item'), undefined);
        });

        it('return default value', function() {
            var res = halson();
            var def = {title: "Untitled"};
            assert.deepEqual(res.getEmbed('item', def), def);
        });

        it('return embed by rel', function() {
            var res = halson(clone(example));
            var expected = halson(example._embedded.starred[0]);
            assert.deepEqual(res.getEmbed('starred'), expected);
        });

        it('use filterCallback', function() {
            var res = halson(clone(example));
            var expected = halson(example._embedded.starred[1]);
            assert.deepEqual(res.getEmbed('starred', function(item) {
                return item.title === 'koajs / koa';
            }), expected);
        });

        it('use filterCallback w/ default value', function() {
            var res = halson(clone(example));
            var def = {title: "Untitled"};
            assert.deepEqual(res.getEmbed('starred', function(item) {
                return item.title === 'not exists';
            }, def), def);
        });
    });

    describe('addLink()', function() {
        it('return this', function() {
            var res = halson();
            var ret = res.addLink('self', '/hajovsky');
            expect(ret).to.be.equal(res);
        });

        it('add first link (Object)', function() {
            var res = halson();
            var link = {href: "/hajovsky"};

            res.addLink('self', link);
            assert.deepEqual(res.getLink('self'), link);
        });

        it('add first link (string)', function() {
            var res = halson();
            var link = {href: "/hajovsky"};

            res.addLink('self', link.href);
            assert.deepEqual(res.getLink('self'), link);
        });

        it('add second link', function() {
            var res = halson()
                .addLink('related', example._links.related[0])
                .addLink('related', example._links.related[1]);

            assert.deepEqual(res.getLinks('related'), example._links.related);
        });
    });

    describe('addEmbed()', function() {
        it('return this', function(){
            var res = halson();
            expect(res).to.be.equal(res.addEmbed('starred', {title: 'Untitled'}));
        });

        it('add first embed', function() {
            var res = halson();
            var embed = {title: "Untitled"};
            var expected = {
                _embedded: {
                    item: {
                        title: "Untitled"
                    }
                }
            };

            res.addEmbed('item', embed);
            assert.deepEqual(res, expected);
        });

        it('add first embed array', function() {
            var res = halson();
            var embed = [{title: "Untitled"}];
            var expected = {
                _embedded: {
                    item: [{
                        title: "Untitled"
                    }]
                }
            };

            res.addEmbed('item', embed);
            assert.deepEqual(res, expected);
        });

        it('add second embed', function() {
            var res = halson();
            var embed1 = {title: "Untitled1"};
            var embed2 = [{title: "Untitled2"}];
            var expected = {
                _embedded: {
                    item: [{
                        title: "Untitled1"
                    }, {
                        title: "Untitled2"
                    }]
                }
            };

            res.addEmbed('item', embed1);
            res.addEmbed('item', embed2);
            assert.deepEqual(res, expected);
        });

        it('add first embed array', function() {
            var res = halson();
            var embed = [{title: "Untitled1"}, {title: "Untitled2"}];
            var expected = {
                _embedded: {
                    item: [
                        {
                            title: "Untitled1"
                        },
                        {
                            title: "Untitled2"
                        }
                    ]
                }
            };

            res.addEmbed('item', embed);
            assert.deepEqual(res, expected);
        });

        it('add second embed array', function() {
            var res = halson();
            var embed1 = [{title: "Untitled1"}, {title: "Untitled2"}];
            var embed2 = [{title: "Untitled3"}, {title: "Untitled4"}];
            var expected = {
                _embedded: {
                    item: [
                        {
                            title: "Untitled1"
                        },
                        {
                            title: "Untitled2"
                        },
                        {
                            title: "Untitled3"
                        },
                        {
                            title: "Untitled4"
                        }
                    ]
                }
            };

            res.addEmbed('item', embed1);
            res.addEmbed('item', embed2);
            assert.deepEqual(res, expected);
        });

        it('add first embed as array second as object', function() {
            var res = halson();
            var embed1 = [{title: "Untitled1"}, {title: "Untitled2"}];
            var embed2 = {title: "Untitled3"};
            var expected = {
                _embedded: {
                    item: [
                        {
                            title: "Untitled1"
                        },
                        {
                            title: "Untitled2"
                        },
                        {
                            title: "Untitled3"
                        }
                    ]
                }
            };

            res.addEmbed('item', embed1);
            res.addEmbed('item', embed2);
            assert.deepEqual(res, expected);
        });

    });

    describe('insertEmbed()', function() {
        it('return this', function(){
            var res = halson();
            expect(res).to.be.equal(res.addEmbed('starred', {title: 'Untitled'}));
        });

        it('add first embed', function() {
            var res = halson();
            var embed = {title: "Untitled"};
            var expected = {
                _embedded: {
                    item: {
                        title: "Untitled"
                    }
                }
            };

            res.insertEmbed('item', -1, embed);
            assert.deepEqual(res, expected);
        });

        it('add second embed before first embed', function() {
            var res = halson();
            var embed1 = {title: "Untitled1"};
            var embed2 = {title: "Untitled2"};
            var expected = {
                _embedded: {
                    item: [{
                        title: "Untitled2"
                    }, {
                        title: "Untitled1"
                    }]
                }
            };

            res.insertEmbed('item', -1, embed1);
            res.insertEmbed('item', 0, embed2);
            assert.deepEqual(res, expected);
        });

        it('add third embed before second', function() {
            var res = halson();
            var embed1 = {title: "Untitled1"};
            var embed2 = {title: "Untitled2"};
            var embed3 = {title: "Untitled3"};
            var expected = {
                _embedded: {
                    item: [{
                        title: "Untitled1"
                    },{
                        title: "Untitled3"
                    },{
                        title: "Untitled2"
                    }]
                }
            };

            res.insertEmbed('item', -1, embed1);
            res.insertEmbed('item', -1, embed2);
            res.insertEmbed('item', 1, embed3);
            assert.deepEqual(res, expected);
        });

        it('add third embed (as an array) before second', function() {
            var res = halson();
            var embed1 = {title: "Untitled1"};
            var embed2 = {title: "Untitled2"};
            var embed3 = [
                {title: "Untitled3a"},
                {title: "Untitled3b"},
            ];
            var expected = {
                _embedded: {
                    item: [{
                        title: "Untitled1"
                    },{
                        title: "Untitled3a"
                    },{
                        title: "Untitled3b"
                    },{
                        title: "Untitled2"
                    }]
                }
            };

            res.insertEmbed('item', -1, embed1);
            res.insertEmbed('item', -1, embed2);
            res.insertEmbed('item', 1, embed3);
            assert.deepEqual(res, expected);
        });
    });

    describe('removeLinks()', function() {
        it('remove all links by rel', function() {
            var res = halson(clone(example));
            var expected = clone(example._links);
            delete(expected.related);
            res.removeLinks('related');
            assert.deepEqual(res._links, expected);
        });

        it('ignore missing links', function() {
            var res = halson(clone(example));
            var expected = clone(example._links);
            res.removeLinks('relatedX');
            assert.deepEqual(res._links, expected);
        });

        it('use filterCallback', function() {
            var res = halson(clone(example));
            res.removeLinks('related', function(item) {
                return item.name === 'twitter';
            });
            var expected = clone(example._links);
            expected.related = [expected.related[0]];
            assert.deepEqual(res._links, expected);
        });
    });

    describe('removeEmbeds()', function() {
        it('remove all embeds by rel', function() {
            var res = halson(clone(example));
            res.removeEmbeds('starred');
            assert.deepEqual(res._embedded, {});
            expect(res._embedded.starred).to.be.an('undefined');
        });

        it('ignore missing embeds', function() {
            var expected = clone(example)._embedded;
            var res = halson(clone(example));
            res.removeEmbeds('starredX');
            assert.deepEqual(res._embedded, expected);
        });

        it('use filterCallback', function() {
            var res = halson(clone(example));
            res.removeEmbeds('starred', function(item){
                return item.title === 'koajs / koa';
            });
            var embeds = res.getEmbeds('starred');

            var expected = halson(clone(example)).getEmbeds('starred');
            expected = [expected[0], expected[2]];

            assert.deepEqual(embeds, expected);
        });
    });
});
