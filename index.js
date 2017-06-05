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
                  if (Array.isArray(self._embedded[key])) {
                    _embedded[key] = [].concat(self._embedded[key]).map(function(embed) {
                        return createHALSONResource(embed);
                    });
                  } else {
                    _embedded[key] = createHALSONResource(self._embedded[key]);
                  }
                }
            });

            this._embedded = _embedded;
        }

    }

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
        return this.insertEmbed(rel, -1, embed);
    };

    HALSONResource.prototype.insertEmbed = function(rel, index, embed) {
        if (!this._embedded) {
            this._embedded = {};
        }

        if (!(rel in this._embedded)) {
            this._embedded[rel] = Array.isArray(embed) ? embed.map(createHALSONResource) : createHALSONResource(embed);
            return this;
        }

        var items = [].concat(embed).map(createHALSONResource);

        this._embedded[rel] = [].concat(this._embedded[rel]);

        if (index < 0) {
            Array.prototype.push.apply(this._embedded[rel], items);
        } else {
            var params = [index, 0].concat(items);
            Array.prototype.splice.apply(this._embedded[rel], params);
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
