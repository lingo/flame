/* jshint node:true */
'use strict';

const keycode = require('keycode');
const $       = require('jquery');

var shortcuts = {
};

function normalize(s) {
	return s
		.replace(/\s+/, '')
		.replace(/\s*\+\s*/, '+')
		.replace(/^\s+|\s+$/, '')
		.replace(/co?n?tro?l/gi, 'ctrl')
		.replace(/shift/gi, 'shift')
		.replace(/meta/g, 'alt')
		.toLowerCase();
}

function parse(shortcut) {
	shortcut = normalize(shortcut);
	var keys = shortcut.split('+');
	var out = {
		ctrl:    false,
		shift:   false,
		alt:     false,
		key:     '',
		name:    '',
		handler: null,
		context: null
	};
	keys.forEach(k => {
		if (k in out) {
			out[k] = true;
		} else {
			out.key = k;
		}
	});
	out.name = shortcut;
	return out;
}

function handle(e) {
	for(let key in shortcuts) {
		var s = shortcuts[key];
		var match = (s.ctrl ^ e.ctrlKey)
			| (s.shift ^ e.shiftKey)
			| (s.alt ^ e.altKey);
		if (match !== 0) {
			continue;
		}
		if (keycode(e) === s.key) {
			if (s.handler) {
				var dontConsume = s.handler.call(s.thisObj, e);
				if (!dontConsume) {
					e.preventDefault();
				}
			}
		}
	}
	return true;
}

module.exports = {
	listen: function(rootElt) {
		$(rootElt).on('keydown', handle);
	},
	register: function(shortcut, callback, thisObj) {
		var shortcut             = parse(shortcut);
		shortcut.handler         = callback;
		shortcut.context         = thisObj;
		shortcuts[shortcut.name] = shortcut;
	}
};