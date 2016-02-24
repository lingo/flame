const $           = require('jquery');
const ipcRenderer = require('electron').ipcRenderer;

ipcRenderer.on('add-css', function(event, arg) {
	var css = $(`<style>${arg}</style>`);
	css.appendTo(document.head);
});

ipcRenderer.on('set-content', function(event, arg) {
	console.log('set-content received', arguments);
    $('.content').html(arg);
});
