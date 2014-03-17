
function Resource(data, self) {
    this.data = (typeof data === "undefined") ? {} : data;
    this.links = {};
    this.embedded = {};
    if (typeof self !== "undefined") {
        this.link("self", self);
    }
    return this;
};

Resource.prototype._append = function(list, key, value) {
    var stack = list[key];
    if (typeof stack === "undefined") {
        list[key] = [value];
    } else {
        stack.push(value);
    }
};

Resource.prototype._expand = function(key, stack) {
    if (!Object.keys(stack).length) {
        return;
    }

    this.data[key] = {};

    for (var rel in stack) {
        var items = stack[rel];
        if ((items.length == 1) && (rel !== "curies")) {
            this.data[key][rel] = items[0];
        } else {
            this.data[key][rel] = items;
        }
    }
};

Resource.prototype.link = function(rel, link) {
    if (typeof link === "string") {
        link = {href: link};
    }

    if (!link.href) {
        throw new Error('Link MUST contain a href attribute');

    }

    if ('curies' == rel) {
        if (!link.name) {
            throw new Error('Curie must be named');
        }

        if (!link.templated) {
            link.templated = true;
        }

        if (-1 === link.href.search('{rel}')) {
            throw new Error('Curie must contain {rel} placeholder');
        }
    }

    this._append(this.links, rel, link);
    return this;
};

Resource.prototype.curie = function(name, template) {
    this.link("curies", {name: name, href: template, templated: true});
    return this;
};

Resource.prototype.embed = function(rel, embed) {
    var data = (embed instanceof Resource) ? embed.toObject() : embed;
    this._append(this.embedded, rel, data);
    return this;
};

Resource.prototype.set = function(key, value) {
    if ((key == '_links') || (key == '_embedded')) {
        throw new Error('Reserved attribute ' + key);
    }
    this.data[key] = value;
    return this;
};

Resource.prototype.toObject = function() {
    this._expand("_links", this.links);
    this._expand("_embedded", this.embedded);
    return this.data;
};

Resource.prototype.toJSON = function(spacer) {
    return JSON.stringify(this.toObject(), null, spacer);
};

module.exports = Resource;
