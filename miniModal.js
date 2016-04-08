/* jshint node:true */
'use strict';
/**
 * Miniature modal dialog module, for simplicity.
 *
 * Usage:
 *
 * const modal = require('miniModal');
 * // Optional second argument can provide style overrides
 * var m = modal("<b>Html</b> content goes here", { style { font-weight: bold; }});
 * m.close();
 * // OR
 * modal.close();
 *
 * @author  Luke Hudson <git@speak.geek.nz>
 */

var id    = 'mini-modal';
var bgID  = 'mini-modal-bg';

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

    var div   = _document.querySelector('#' + id) || _document.createElement('div');
    var bgDiv = _document.querySelector('#' + bgID) || _document.createElement('div');

    div.id        = id;
    div.innerHTML = content;
    bgDiv.id      = bgID;

    var style     = {
        'position':         'fixed',
        'display':          'block',
        'background-color': 'gainsboro',
        'min-width':        '50%',
        'min-height':       '2em',
        'max-height':       '100%',
        'overflow':         'auto',
        'border':           '2px solid black',
        'top':              '50%',
        'left':             '50%',
        'transform':        'translate(-50%, -50%)',
        'padding':          '1em',
        'z-index':          '10000',
        'border-radius':    '3px',
        'display':          'inline-block'
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
    return {
        close: function() {
            div.hide();
            bgDiv.hide();
        },
        element: function() {
            return div;
        }
    };
};

module.exports.close = function() {
    var elt = document.querySelector('#' + bgID);
    if (elt) {
        elt.style.display = 'none';
    }
    elt = document.querySelector('#' + id);
    if (elt) {
        elt.style.display = 'none';
    }
};

module.exports.setDocument = function(doc) {
    _document = doc;
};
