/* jshint node:true */
'use strict';
/**
 * Spawn a command and return its output (stdout), using promises interface.
 * Promise is resolved with the output, or rejected with error code if program
 * returned non-zero.
 *
 * spawn('ls', ['-lR', '/proc'])
 * 	.then(function(output) {
 * 		console.log(output);
 * 	})
 * 	.catch(function(err) {
 * 		console.error(err);
 * 	});
 *
 * Note that output is collected in memory so this isn't suitable for
 * commands with large output.
 *
 * @author Luke Hudson <git@speak.geek.nz>
 */
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
				reject(new Error(code));
			} else {
				resolve(text);
			}
		});
	});
}

module.exports = spawnToOutput;