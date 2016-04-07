/* jshint node:true */
'use strict';
// const fs           = require('fs');
// const _            = require('lodash');
const $               = require('jquery');
// const fullCalendar = require('fullcalendar');
const moment          = require('moment');
const ipcRenderer     = require('electron').ipcRenderer;
const BPromise        = require('bluebird');
// const hilite       = require('highlight').Highlight;
// const iconUtils    = require('./icons');
const spawn           = require('child_process').spawn;
const fork            = require('child_process').fork;

const MAX_LINE_HEIGHT = 32;

var appData = {
	lineHeight: 16,
	commitData: [],
	symbols:    {},
};

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


function calcLineHeight($sourceElt) {
	$sourceElt.find('span').each((idx, elt) => {
		var $this = $(elt);
		if ($this.height() < MAX_LINE_HEIGHT) {
			appData.lineHeight = $this.height();
			return false;
		}
		return true;
	});
}

function openFile(fileName) {
	var gitBlame = require('./gitblame');
	gitBlame(fileName)
		.then(function(data) {
			appData.commitData = data.commitData;
			var source         = data.sourceLines.join("\n");
			var $sourceElt     = $('.source pre code');
			$sourceElt.text(source);

			var html = '';
			for (let i = 1; i <= data.sourceLines.length; i++) {
				html += `<li>${i}</li>`;
			}
			$('.lines').html(html);

			var worker         = fork(`${__dirname}/hlworker.js`);

			worker.on('message', (msg) => {
				$sourceElt.html(msg.result);
				calcLineHeight($sourceElt);
				// $('.source pre code .hljs')
			});

			worker.send({
				source: source
			});
		});
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

    ipcRenderer.on('flame-command-line', function(event, args) {
        args = args.slice(2); // Remove node, electron
        openFile(args[0]);
    });
    // In renderer process (web page).
    // ipcRenderer.on('render-icon', function(event, text) {
        // updateIconAndTooltip(text);
    // });

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


    function getSourceLine(clientY) {
        var line = clientY - $('.source').offset().top + $(window).scrollTop();
        line    /= appData.lineHeight;
        line     = Math.floor(line);
        return line;
    }

    $('.source').on('mousemove', function(e) {
        $('.lines li').css('color', '');
        var line = getSourceLine(e.clientY);
        var note = $('.lines li').get(line);
        if (note) {
            $(note).css('color', 'yellow');
        }
    });

    $('.source').on('click', function(e) {
        var line = getSourceLine(e.clientY);
        var note = appData.commitData[line];
        if (note) {
            console.log(note);
            var str = `
${note.hash}
${moment(note.committerTime).fromNow()}
${note.author}
`;
            alert(str);
        }
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
