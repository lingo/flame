/* jshint node:true */
'use strict';
// const path                  = require('path');
const electron              = require('electron');
// const Menu                  = electron.Menu;
// const Tray                  = electron.Tray;
const app                   = electron.app; // Module to control application life.
const BrowserWindow         = electron.BrowserWindow; // Module to create native browser window.
const ipcMain               = electron.ipcMain;
// const nativeImage           = electron.nativeImage;
// const $                     = require('jquery');
const BPromise              = require('bluebird');

// const myPath = path.join.bind(null, process.argv[1]);

BPromise.config({
    // Enable warnings.
    warnings: true,
    // Enable long stack traces.
    longStackTraces: true,
    // Enable cancellation.
    cancellation: false
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

if (app.makeSingleInstance(function(cli, cwd) {
    console.log('Second instance launch requested: ', cli, cwd);
    mainWindow.show();
    mainWindow.focus();
    return true;
})) {
    app.quit();
}

/// The following allow transparent windows
// app.commandLine.appendSwitch('--enable-transparent-visuals');
// app.commandLine.appendSwitch('--disable-gpu');


// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform != 'darwin') {
        app.quit();
    }
});


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
    // const screen = electron.screen;

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width:           500,
        height:          350,
        show:            true,
        titleBarStyle:   'hidden',
        autoHideMenuBar: true,
        // frame:           false
    });

    // and load the index.html of the app.
    mainWindow.loadURL('file://' + __dirname + '/index.html');

    mainWindow.on('minimize', function() {
        mainWindow.hide();
    });

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
        app.quit();
    });

    ipcMain.on('flame-show-dev-tools', function(event, data) {
        mainWindow.webContents.openDevTools();
    });

    mainWindow.webContents.on('did-finish-load', function() {
        mainWindow.webContents.send('flame-command-line', process.argv);
    });
});
