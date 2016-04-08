/* jshint node:true */
'use strict';
/**
 * Run as a separate thread or process in order to prevent blocking of main UI
 * This does the syntax highlighting
 */

const hilite          = require('highlight.js');

process.on('message', (msg) => {
    var result = hilite.highlightAuto(msg.source);
	process.send({result: result.value});
});