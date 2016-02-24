/*
 * PopupWindow module
 *
 * usage:
 *     popupWindow({
 *         content: '<div className="test"><button>Test</button></div>',
 *         show:    true,
 *         css:     'body { background: red }',
 *         url:     'http://google.com'
 *     })
 */
'use strict';
const electron              = require('electron');
const BrowserWindow         = electron.BrowserWindow; // Module to create native browser window.

function popupWindow(options) {
    var defaults = {
        frame:     false,
        width:     480,
        height:    320,
        resizable: false,
        show:      false,
        url:       'file://' + __dirname + '/popup.html'
    };
    if (typeof(options) === 'undefined') {
        options = {};
    }
    Object.keys(options).forEach(function(key) { defaults[key] = options[key]; });
    options = defaults;

    var win = new BrowserWindow(options);

    win.on('closed', function() {
        win = null;
    });

    win.webContents.on('did-finish-load', function() {
        if (options.css) {
            win.webContents.send('add-css', options.css);
        }
        if (options.content) {
            win.webContents.send('set-content', options.content);
        }
    });

    if (options.pos) {
        win.setPosition(options.pos.x, options.pos.y);
    }
    win.loadURL(options.url);
    if (options.debug) {
        win.webContents.openDevTools();
    }
    return win;
}


module.exports = popupWindow;