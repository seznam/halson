(function(exports, win) {
    function ParsedResource(data) {
        this.data = data;
        this._links = this._parse("_links");
        this._embedded = this._parse("_embedded");
    };

    ParsedResource.prototype.className = "HALSONParsedResource";

    ParsedResource.prototype._parse = function(list) {
        var data = this.data[list] || {};
        var ret = {};

        for (var rel in data) {
            var items = [].concat(data[rel]);
            if (list == "_embedded") {
                items = items.map(function(item) {
                    return new ParsedResource(item);
                });
            }
            ret[rel] = items;
        }

        return ret;
    };

    ParsedResource.prototype.get = function(key) {
        return this.data[key];
    };

    ParsedResource.prototype.self = function(attribute) {
        var self = this.link('self') || {};
        if (!attribute) {
            return self;
        }
        return self[attribute];
    };

    ParsedResource.prototype.links = function(rel) {
        return this._links[rel] || [];
    };

    ParsedResource.prototype.link = function(rel) {
        var links = this.links(rel);
        return links[0];
    };

    ParsedResource.prototype.linkByName = function(rel, name) {
        var links = this.links(rel);
        for (var i in links) {
            var link = links[i];
            if (name === link.name) {
                return link;
            }
        }
    };

    ParsedResource.prototype.embeds = function(rel) {
        return this._embedded[rel] || [];
    };

    ParsedResource.prototype.embed = function(rel) {
        var embeds = this.embeds(rel);
        return embeds[0];
    };

    ParsedResource.prototype.embedByURI = function(rel, uri) {
        var embeds = this.embeds(rel);
        for (var i in embeds) {
            var embed = embeds[i];
            var self = embed.link("self");
            if (self && (uri == self.href)) {
                return embed;
            }
        }
    };

    function parse(data) {
        if (typeof data == "string") {
            data = JSON.parse(data);
        }

        return new ParsedResource(data);
    };

    if (exports) {
        exports.parse = parse;
        exports.ParsedResource = ParsedResource;
    } else if (win) {
        win.hal.parse = parse;
        win.hal.ParsedResource = ParsedResource;
    }
})(typeof(exports) == "undefined" ? null : exports, typeof(window) == "undefined" ? null : window);