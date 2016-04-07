/* jshint node:true */
'use strict';

const spawn    = require('child_process').spawn;
const BPromise = require('bluebird');

function spawnToOutput(command, args) {
	var child   = spawn(command, args);

	return new BPromise((resolve, reject) => {
		var text    = '';

		// Collect output of command
		child.stdout.on('data', (d) => { text += d; });

		child.on('error', (error) => {
			reject(error);
		});

		child.on('close', (code) => {
			if (code !== 0) {
				// console.warn(command, 'exited with code', code);
				reject(code);
			} else {
				resolve(text);
			}
		});
		// child.on('exit', (code) => {
		// 	if (code !== 0) {
		// 		reject(code);
		// 	} else {
		// 		resolve(text);
		// 	}
		// });
	});
}

module.exports = spawnToOutput;