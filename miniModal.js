/* jshint node:true */
'use strict';

function keymap(obj, fn) {
    if (typeof(obj) === 'function') {
        fn  = obj;
        obj = this;
    }
    return Object.keys(obj).map(function(key) {
        return fn(key, obj[key], obj);
    });
}

var _document   = null;

module.exports = function miniModal(content, options) {
    if (!_document) {
        _document = document;
    }
    if (!_document) {
        throw new Error("Failed to locate browser's: >document< var");
    }
    var defOptions = {
        style: true
    };
    if (typeof(options) !== 'undefined') {
        Object.keys(options).forEach(function(k) {
            defOptions[k] = options[k];
        });
    }


    var div   = _document.createElement('div');
    var bgDiv = _document.createElement('div');

    div.id        = 'mini-modal';
    div.innerHTML = content;
    bgDiv.id      = 'mini-modal-bg';

    var style     = {
        'position':         'fixed',
        'display':          'block',
        'background-color': 'gainsboro',
        'min-width':        '50%',
        'min-height':       '50%',
        'max-height':       '100%',
        'overflow':         'auto',
        'border':           '2px solid black',
        'top':              '50%',
        'left':             '50%',
        'transform':        'translate(-50%, -50%)',
        'padding':          '1em',
        'z-index':          '10000',
        'border-radius':    '3px'
    };
    if (defOptions.style) {
        div.style.cssText = keymap.call(style, function(k,v) { return k + ':' + v; }).join(';');
        style = {
            'position':   'fixed',
            'top':        0,
            'left':       0,
            'right':      0,
            'bottom':     0,
            'background': 'rgba(0,0,0,0.2)',
            'z-index':    '9999'
        };
        bgDiv.style.cssText = keymap.call(style, function(k,v) { return k + ':' + v; }).join(';');
    }
    bgDiv.onclick = function(/*e*/) {
        _document.body.removeChild(bgDiv);
        _document.body.removeChild(div);
    };
    _document.body.appendChild(bgDiv);
    _document.body.appendChild(div);
};

module.exports.setDocument = function(doc) {
    _document = doc;
};
