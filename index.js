var __webpack_require__ = arguments[2];
var sources = __webpack_require__.m;

var webpackBootstrapFunc = function(modules) {
    var installedModules = {};
    function __webpack_require__(moduleId) {
      if(installedModules[moduleId])
        return installedModules[moduleId].exports;
      var module = installedModules[moduleId] = {
        exports: {},
        id: moduleId,
        loaded: false
      };
      modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
      module.loaded = true;
      return module.exports;
    }
    __webpack_require__.m = modules;
    __webpack_require__.c = installedModules;
    __webpack_require__.oe = function(err) { throw err; };
    __webpack_require__.p = "";
    var f = __webpack_require__(__webpack_require__.s = entryModule);
    return f.default || f; // try to call default if defined to also support babel esmodule exports
}

module.exports = function (fn) {
    var fnString = fn.toString()
      // FF adds a "use strict"; to the function body
      .replace(/"use strict";\n\n/, '')
      // Browsers also slightly reformat the minified function expression
      .replace(/^function\s?\((.*)\)(\s?)\{(\n"use strict";\n)?/, 'function($1)$2{')

    var sourcesKeys = Object.keys(sources); // when using the CommonChunks plugin, webpacl sometimes storing sources in object instead of array

    var key;
    for (var i = 0, l = sourcesKeys.length; i < l; i++) {
        var k = sourcesKeys[i];
        if (!sources[k]) {
            continue;
        }
        var wrapperFuncString = sources[k].toString();

        // Being the first to require a file can be dangerous if a module has
        // assumptions about when it is initialized. By looking to see if the
        // `fnString` is in the module first, we can avoid unnecessary requires.
        if (wrapperFuncString.indexOf(fnString) > -1) {
            key = i;
            var exp = __webpack_require__(i);

            // Using babel as a transpiler to use esmodule, the export will always
            // be an object with the default export as a property of it. To ensure
            // the existing api and babel esmodule exports are both supported we
            // check for both
            if (!(exp && (exp === fn || exp.default === fn))) {
              sources[k] = wrapperFuncString.substring(0, wrapperFuncString.length - 1) + '\n' + fnString.match(/function\s?(.+?)\s?\(.*/)[1] + '();\n}';
            }
            break;
        }
    }

    // window = {}; => https://github.com/borisirota/webworkify-webpack/issues/1
    var src = 'window = {};\n'
        + 'var fn = (' + webpackBootstrapFunc.toString().replace('entryModule', key) + ')(['
        + sourcesKeys.map(function (k) {
            return sources[k].toString();
        }).join(',')
        + ']);\n'
        + '(typeof fn === "function") && fn(self);'; // not a function when calling a function from the current scope

    var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

    return new Worker(URL.createObjectURL(
        new Blob([src], { type: 'text/javascript' })
    ));
};
