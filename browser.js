/* jshint node:true */
'use strict';
// const fs           = require('fs');
// const _            = require('lodash');
const $               = require('jquery');
const keycode         = require('keycode');
// const fullCalendar = require('fullcalendar');
const moment          = require('moment');
const ipcRenderer     = require('electron').ipcRenderer;
const BPromise        = require('bluebird');
// const hilite       = require('highlight').Highlight;
// const iconUtils    = require('./icons');
// const spawn        = require('child_process').spawn;
const fork            = require('child_process').fork;
const spawnToOutput   = require('./spawnToOutput');

const shortcuts       = require('./shortcuts');

const MAX_LINE_HEIGHT = 32;

var appData = {
	lineHeight:   16,
	commitData:   [],
	symbols:      {},
	searchMode:   null,
	currentMatch: null,
	matches:      []
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


function buildSymbols($sourceElt) {
	$sourceElt.find('.hljs-title').each((idx, elt) => {
		var name              = $(elt).text();
		appData.symbols[name] = appData.symbols[name] || [];
		appData.symbols[name].push($(elt));
	});
}

function findMatches(input) {
	if (!input || input === '') {
		return [];
	}
	var rx = input.split('').join('.*');
	rx     = new RegExp(rx, (input.match(/[A-Z]/) ? '' : 'i'));
	return Object.keys(appData.symbols).filter(k => k.match(rx));
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
				let cls = '';
				if (data.commitData[i-1].hash === "0000000000000000000000000000000000000000") {
					cls = 'class="uncommitted"';
				}
				html += `<li ${cls}>${i}</li>`;
			}
			$('.lines').html(html);

			var worker         = fork(`${__dirname}/hlworker.js`);

			worker.on('message', (msg) => {
				$sourceElt.html(msg.result);
				calcLineHeight($sourceElt);
				buildSymbols($sourceElt);
			});

			worker.send({
				source: source
			});
		});
}

function gitLog(commit) {
	return spawnToOutput('git', ['log', '-n1', commit]);
}

function showSearch(type) {
	appData.searchMode = type;
	$('.search')
		.removeClass('hidden')
		.find('input')
		.val('')
		.attr('placeholder', type)
		.focus();
}

function hideSearch() {
	$('.search')
		.addClass('hidden')
		.find('.matches')
		.addClass('hidden');
}

function showMatches(matches, formatMatch) {
	appData.currentMatch = 0;
	appData.matches      = matches;
	var $search          = $('.search');
	var $matches         = $search.find('.matches');
	$matches.empty();
	var html = '';
	matches.forEach((m) => {
		var txt = '';
		if (typeof(formatMatch) === 'function') {
			txt = `<li>${formatMatch(m)}</li>`;
		} else {
			txt = `<li>${m}</li>`;
		}
		html += txt;
	});
	$matches.html(html);
	$matches.find('li:first').addClass('current');
	$matches.removeClass('hidden');
}

function gotoLine(n) {
	$(window).scrollTop(n * appData.lineHeight - $('.source pre code').offset().top);
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
        	gitLog(note.hash)
        		.then(function(message) {
			        console.log(note);
			        alert(message);
        		});
        }
    });

    $('.search').on('keyup', 'input', (e) => {
    	var $this = $(e.target);
    	var input = $this.val();
		switch (keycode(e)) {
			case 'enter':
				if (appData.searchMode === '@' && appData.matches.length) {
					var match = appData.matches[appData.currentMatch];
					var elt   = appData.symbols[match][0];
					$(window).scrollTop(elt.offset().top);
					hideSearch();
				} else {
					hideSearch();
				}
				break;
			case 'esc':
				hideSearch();
				break;
			default:
				if (appData.searchMode === '@' && keycode(e) && keycode(e).match(/^([a-z$_.-])$/)) {
					showMatches(findMatches(input));
					$this.focus();
				} else if(appData.searchMode === ':') {
					gotoLine(input);
				} else {
					return true;
				}
		}
		e.preventDefault();
		return false;
	});

	shortcuts.listen(document);
	shortcuts.register('ctrl+g', (e) => {
		showSearch(':');
	});
	shortcuts.register('ctrl+r', (e) => {
		showSearch('@');
	});

	var matchesNav = function(e) {
		if ($('.search').hasClass('hidden')) {
			return true;
		}
		var delta = (keycode(e) === 'down') ? 1 : -1;
		var $matches = $('.matches');
		$matches.find('li').removeClass('current');
		appData.currentMatch += delta;
		if (appData.currentMatch < 0) {
			appData.currentMatch = appData.matches.length - 1;
		}
		if (appData.currentMatch >= appData.matches.length) {
			appData.currentMatch = 0;
		}
		$($matches.find('li').get(appData.currentMatch)).addClass('current');
	};

	shortcuts.register('up', matchesNav);
	shortcuts.register('down', matchesNav);

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
