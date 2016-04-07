/* jshint node:true */
'use strict';

const hilite          = require('highlight.js');

process.on('message', (msg) => {
    var result = hilite.highlightAuto(msg.source);
	// console.log('worker   got', msg, arguments);
	process.send({result: result.value});
});
// onmessage = function(event) {
//   // importScripts('/highlight.pack.js');
//   var result = event.data.hljs.highlightAuto(event.data.src);
//   postMessage(result.value);
// }
