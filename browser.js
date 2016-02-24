/* jshint node:true */
'use strict';
const _            = require('lodash');
const $            = require('jquery');
const fullCalendar = require('fullcalendar');
const moment       = require('moment');
const ipcRenderer  = require('electron').ipcRenderer;
const BPromise     = require('bluebird');

BPromise.config({
    // Enable warnings.
    warnings: true,
    // Enable long stack traces.
    longStackTraces: true,
    // Enable cancellation.
    cancellation: false
});

var settings          = { };

function appMessage(text, goodBadUgly) {
    goodBadUgly = goodBadUgly || 'good';
    var message = $('#app-message');
    message.removeClass('bad good').addClass(goodBadUgly);
    message.text(text).removeClass('hidden').show();
    setTimeout(function() {
        message.animate({opacity: 0}, { complete: function() { message.hide().css('opacity', 1); }});
    }, 1000);
}

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
	ipcRenderer.send('tooltip-data', getHoursText(hours, settings.lastProject, settings.lastOptions));
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


$(function() {
    if (localStorage.settings) {
        try {
            var loadedSettings = JSON.parse(localStorage.settings);
            settings           = loadedSettings;
        } catch(ex) {
            console.error('Failed to parse stored settings', localStorage.settings);
        }
    }

    // In renderer process (web page).
    ipcRenderer.on('render-icon', function(event, text) {
        updateIconAndTooltip(text);
    });

    // ipcRenderer.on('debug', function(event, arg) {
    //     debugArg = arg;
    // });

    $(document.body).on('click', 'a.external.link',function(e) {
        e.preventDefault();
        var href            = this.href;
        // const BrowserWindow = require('electron').remote.BrowserWindow;
        // var win             = new BrowserWindow();
        // win.loadURL(href);
        // win.show();
        const shell = require('electron').shell;
        shell.openExternal(href);
    });

//     globalCalendarElt = $('.info-details');
//     window.Calendar   = globalCalendarElt.fullCalendar({
//         editable: false,
//         header:   {
//             left: 'prev,next today',
//             center: 'title',
//             right: 'month,basicWeek,basicDay'
//         },
//         defaultDate: '2016-01-12',
//         eventLimit:  true, // allow "more" link when too many events
//         events:      function(start, end, timezone, cb) {
//             var events = $('.info-hours').data().timeEntries;
//             if (!events) {
//                 cb([]);
//                 return;
//             }
//             var out = [];
//             events.forEach(function(item) {
//                 var itemDate = moment(item.date);
//                 if (itemDate >= start && itemDate < end) {
//                     out.push({
//                         id:          item.time_entry_id,
//                         title:       itemTitle(item),
//                         allDay:      true,
//                         start:       item.date,
//                         description: itemDescription(item),
//                         entry:       item,
//                     });
//                 }
//             });
//             cb(out);
//         },
//         dayClick: function(date, jsEvent, view) {
//             // alert('Clicked on: ' + date.format());
//             // alert('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);
//             // alert('Current view: ' + view.name);
//             // change the day's background color just for fun
//             // $(this).css('background-color', 'red');
//         },
//         eventClick: function( event, jsEvent, view ) {
//             require('./miniModal')(event.description, {style: false});
//         },
//     });
//     globalCalendarElt.fullCalendar( 'gotoDate', moment());
});
