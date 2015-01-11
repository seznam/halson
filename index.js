(function(module, win) {
    function HALSONResource(data) {
        data = data || {};

        if (typeof data === 'string') {
            data = JSON.parse(data);
        }

        for (var attr in data) {
            if (!(attr in this) && data.hasOwnProperty(attr)) {
                this[attr] = data[attr];
            }
        }

        if (this._embedded && (typeof this._embedded === 'object')) {
            var _embedded = {};
            var self = this;
            Object.keys(this._embedded).forEach(function(key) {
                if (self._embedded.hasOwnProperty(key)) {
                    _embedded[key] = [].concat(self._embedded[key]).map(function(embed) {
                        return createHALSONResource(embed);
                    });
                }
            });

            this._embedded = _embedded;
        }

        this._compact('_embedded');
        this._compact('_links');
    }

    HALSONResource.prototype._compact = function(name, key) {
        var target = this[name];

        if (typeof target !== 'object') {
            return;
        }

        var keys = key ? [key] : Object.keys(target);

        keys.forEach(function(k) {
            var items = target[k];
            if (!Array.isArray(items)) {
                return;
            }

            if (!items.length) {
                delete(target[k]);
            } else if (items.length === 1) {
                target[k] = items[0];
            }
        });

        if (!Object.keys(target).length) {
            return delete this[name];
        }

        this[name] = target;
    };

    HALSONResource.prototype.className = 'HALSONResource';

    HALSONResource.prototype._invert = function(filterCallback) {
        return function() {
            return !filterCallback.apply(null, arguments);
        };
    };

    HALSONResource.prototype.listLinkRels = function() {
        return this._links ? Object.keys(this._links) : [];
    };

    HALSONResource.prototype.listEmbedRels = function() {
        return this._embedded ? Object.keys(this._embedded) : [];
    };

    HALSONResource.prototype.getLinks = function(rel, filterCallback, begin, end) {
        if (!this._links || !(rel in this._links)) {
            return [];
        }

        var links = [].concat(this._links[rel]);

        if (filterCallback) {
            links = links.filter(filterCallback);
        }

        return links.slice(begin || 0, end || links.length);
    };

    HALSONResource.prototype.getLink = function(rel, filterCallback, def) {
        if (typeof filterCallback !== 'function') {
            def = filterCallback;
            filterCallback = null;
        }
        return this.getLinks(rel, filterCallback, 0, 1)[0] || def;
    };

    HALSONResource.prototype.getEmbeds = function(rel, filterCallback, begin, end) {
        if (!this._embedded || !(rel in this._embedded)) {
            return [];
        }

        var items = [].concat(this._embedded[rel]);

        if (filterCallback) {
            items = items.filter(filterCallback);
        }

        return items.slice(begin || 0, end || items.length);
    };

    HALSONResource.prototype.getEmbed = function(rel, filterCallback, def) {
        if (typeof filterCallback !== 'function') {
            def = filterCallback;
            filterCallback = null;
        }
        return this.getEmbeds(rel, filterCallback, 0, 1)[0] || def;
    };

    HALSONResource.prototype.addLink = function(rel, link) {
        if (typeof link === 'string') {
            link = {href: link};
        }

        if (!this._links) {
            this._links = {};
        }

        if (!(rel in this._links)) {
            // single link
            this._links[rel] = link;
        } else {
            // multiple links
            this._links[rel] = [].concat(this._links[rel]);
            this._links[rel].push(link);
        }

        return this;
    };

    HALSONResource.prototype.addEmbed = function(rel, embed) {

        var item;

        if (!Array.isArray(embed)) {
            item = createHALSONResource(embed);
        }
        else {
            item = embed.map(createHALSONResource);
        }

        if (!this._embedded) {
            this._embedded = {};
        }

        if (!(rel in this._embedded)) {
            // first embed
            this._embedded[rel] = item;
        } else {
            // later embeds
            this._embedded[rel] = [].concat(this._embedded[rel]);
            Array.prototype.push.apply(this._embedded[rel], item);
        }

        return this;
    };

    HALSONResource.prototype.insertEmbed = function(rel, index, embed) {
        if (index < 0) {
            // in case we get -1, it is appended to end of array
            return this.addEmbed(rel, embed);
        }

        var item = createHALSONResource(embed);

        if (!this._embedded) {
            this._embedded = {};
        }

        if (!(rel in this._embedded)) {
            // first embed
            this._embedded[rel] = item;
            // multiple embeds
        } else {
            this._embedded[rel] = [].concat(this._embedded[rel]);
            this._embedded[rel].splice(index, 0, item);
        }

        return this;
    };

    HALSONResource.prototype.removeLinks = function(rel, filterCallback) {
        if (!this._links || !(rel in this._links)) {
            return;
        }

        if (!filterCallback) {
            delete(this._links[rel]);
        } else {
            this._links[rel] = [].concat(this._links[rel]).filter(this._invert(filterCallback));
        }

        this._compact('_links', rel);
        return this;
    };

    HALSONResource.prototype.removeEmbeds = function(rel, filterCallback) {
        if (!this._embedded || !(rel in this._embedded)) {
            return;
        }

        if (!filterCallback) {
            return delete(this._embedded[rel]);
        }

        this._embedded[rel] = [].concat(this._embedded[rel]).filter(this._invert(filterCallback));
        this._compact('_embedded', rel);

        return this;
    };

    function createHALSONResource(data) {
        if (data && (data.className === HALSONResource.prototype.className)) {
            return data;
        }
        return new HALSONResource(data);
    }

    createHALSONResource.Resource = HALSONResource;

    if (module) {
        module.exports = createHALSONResource;
    } else if (win) {
        win.halson = createHALSONResource;
    }
})(typeof(module) === 'undefined' ? null : module, typeof(window) === 'undefined' ? null : window);
