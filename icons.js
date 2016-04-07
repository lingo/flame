/* jshint node:true */
'use strict';
const $            = require('jquery');
const ipcRenderer  = require('electron').ipcRenderer;


function renderIcon(text, options) {
    var defaults = {
        fillStyle:    '#FFF',
        font:         '9px sans-serif',
        textAlign:    'center',
        textBaseline: 'middle',
    };
    if (typeof(options) !== 'object') {
        options = {};
    }
    Object.keys(options).forEach(function(key) {
        defaults[key] = options[key];
    });
    options = defaults;

    var $canvas = $('canvas.icon');
    if (!$canvas.length) {
        $canvas = $('<canvas width="24" height="24"></canvas>');
    }
    var ctx = $canvas.get(0).getContext('2d');
    ctx.clearRect(0, 0, $canvas.width(), $canvas.height());
    Object.keys(options).forEach(function(key) {
        ctx[key] = options[key];
    });
    // ctx.fillStyle    = '#FFF';
    // ctx.font         = '9px sans-serif';
    // ctx.textAlign    = 'center';
    // ctx.textBaseline = 'middle';
    ctx.fillText(text, 12, 12);
    var data = $canvas.get(0).toDataURL('image/png');
    return data;
}

function updateIconAndTooltip(hours) {
	hours        = Number(hours).toFixed(1);
	var data     = renderIcon(hours);
	ipcRenderer.send('icon-rendered', data);
	ipcRenderer.send('tooltip-data', hours); //getHoursText(hours, settings.lastProject, settings.lastOptions));
}

function flashIcon(text, color, delay) {
    if (typeof(delay) === 'undefined') {
        delay = 500;
    }
    var data = renderIcon(text, {fillStyle: color});
    ipcRenderer.send('icon-rendered', data);
    setTimeout(function() {
        data = renderIcon(text);
        ipcRenderer.send('icon-rendered', data);
    }, delay);
}

