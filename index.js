(function(exports, win) {
    if (exports) {
        var parse = require('./parse');

        exports.parse = parse.parse;
        exports.ParsedResource = parse.ParsedResource;
        exports.Resource = require('./resource');
    } else if (win) {
        win.hal = {};
    }
})(typeof(exports) == "undefined" ? null : exports, typeof(window) == "undefined" ? null : window);