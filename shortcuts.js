/* jshint node:true */
'use strict';
/**
 * Easier shortcut handling for browser/node
 *
 * Usage:
 *
 * const shortcuts = require('shortcuts');
 *
 * // The callback function can return true, to say that event wasn't consumed and
 * // allow it to bubble up.  By default event is marked as consumed.
 * shortcuts.register('ctrl+shift+s', function(event) {...});
 * shortcuts.register('ctrl+a', function(event) {...});
 *
 * // start listening for shortcuts
 * shortcuts.listen(document);
 *
 * // stop listening for shortcuts
 * shortcuts.ignore(document)
 *
 * @author Luke Hudson <git@speak.geek.nz>
 */
const keycode = require('keycode');
const $       = require('jquery');

var shortcuts = {
};

function normalize(s) {
	return s
		.replace(/\s+/,                                  '')
		.replace(/\s*\+\s*/,                             '+')
		.replace(/^\s+|\s+$/,                            '')
		.replace(/co?n?tro?l/gi,                         'ctrl')
		.replace(/shift/gi,                              'shift')
		.replace(/alt/gi,                                'alt')
		.replace(/meta|command|cmd|win|windows|apple/gi, 'meta')
		.toLowerCase();
}

function parse(shortcut) {
	shortcut = normalize(shortcut);
	var keys = shortcut.split('+');
	var out = {
		ctrl:    false,
		shift:   false,
		alt:     false,
		meta:    false,
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
		// If keys are set the same, match should be 0.
		// Match is 1 only if some key differed between s and e
		var match =
			(s.ctrl 	^ e.ctrlKey)
			| (s.shift 	^ e.shiftKey)
			| (s.meta 	^ e.metaKey)
			| (s.alt 	^ e.altKey);
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
	ignore: function(rootElt) {
		$(rootElt).off('keydown', handle);
	},
	register: function(shortcut, callback, thisObj) {
		var shortcut             = parse(shortcut);
		shortcut.handler         = callback;
		shortcut.context         = thisObj;
		shortcuts[shortcut.name] = shortcut;
	}
};