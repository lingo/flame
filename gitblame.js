/* jshint node:true */
'use strict';

const fork          = require('child_process').fork;
const spawnToOutput = require('./spawnToOutput');

function dashToCamelCase(s) {
	return String(s).replace(/-([a-z])/g, function(match, group1) {
		return group1.toUpperCase();
	});
}

function readGitBlameOutput(output) {
	var sourceLines = [];
	var commitData  = [];
	var record      = {};
	var lines       = output.split(/\r?\n/);

	for (let i in lines) {
		var line = lines[i];

		if (line[0] === '\t') {
			sourceLines.push(line.slice(1));
			commitData.push(record);
			record = {};
			continue;
		}

		var key, value;
		line  = line.split(' ');
		key   = line.splice(0, 1)[0];
		value = line.join(' ');

		if (key.length === 40 && key.match(/^[0-9a-f]+$/i)) {
			value = key;
			key = 'hash';
		}
		// camelCase from dash-case
		key = dashToCamelCase(key);
		if (key.match(/Time$/)) {
			value = new Date(value * 1000);
		}
		record[key] = value;
	}
	return {
		sourceLines: sourceLines,
		commitData:  commitData
	};
}

module.exports = function(fileName) {
	var gitBlame = spawnToOutput('git', ['blame', '--line-porcelain', fileName]);

	return gitBlame.then(function(data) {
		data = readGitBlameOutput(data);
		return data;
	});
};
