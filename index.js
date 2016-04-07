'use strict';
const path                  = require('path');
const electron              = require('electron');
const electronLocalshortcut = require('electron-localshortcut');
const Menu                  = electron.Menu;
const Tray                  = electron.Tray;
const app                   = electron.app; // Module to control application life.
const BrowserWindow         = electron.BrowserWindow; // Module to create native browser window.
const ipcMain               = electron.ipcMain;
const nativeImage           = electron.nativeImage;
const _                     = require('lodash');
const $                     = require('jquery');
const BPromise              = require('bluebird');

const myPath = path.join.bind(null, process.argv[1]);

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
    const screen = electron.screen;

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width:           500,
        height:          350,
        show:            true,
        titleBarStyle:   'hidden',
        autoHideMenuBar: true,
        // frame:           false
    });

    electronLocalshortcut.register(mainWindow, 'F12', () => {
        mainWindow.webContents.openDevTools();
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



    // ipcMain.on('count-hours', function(event, projectID) {
    //     console.log('count-hours event initiated');
    // });

    // var appIcon = null;

    // Menu.setApplicationMenu(null);
    // appIcon = new Tray(myPath('icon.png'));
    // appIcon.setToolTip('Freshbooks helper.');


    // function updateMenuIcon(data) {
    //     appIcon.setImage(nativeImage.createFromDataURL(data));
    // }

    // function updateMenu() {
	   //  var template = [];

    //     template.unshift({
    //         type: 'separator'
    //     });
    //     template.unshift({
    //         label: 'Settings...',
    //         enabled: false
    //     });
    //     template.push({
    //         type: 'separator'
    //     });
    //     template.push({
    //         label:       'Quit',
    //         role:        'quit',
    //         accelerator: 'Alt+F4',
    //         click:       function(e) {
    //             console.log('menu event', e);
    //             app.quit();
    //         }
    //     });
    //     var contextMenu = Menu.buildFromTemplate(template);
    //     appIcon.setContextMenu(contextMenu);
    //     // mainWindow.webContents.send('debug', appIcon);
    // }

    // updateMenu();

    // ipcMain.on('tooltip-data', function(event, data) {
    //     appIcon.setToolTip(data);
    // });
    // ipcMain.on('icon-rendered', function(event, data) {
    //     updateMenuIcon(data);
    // });
    // ipcMain.on('tray-adjust-menu', function(event, projects) {
    // 	console.log('tray-adjust-menu event initiated');
    // 	updateMenu(projects);
    // });

    mainWindow.webContents.on('did-finish-load', function() {
        mainWindow.webContents.send('flame-command-line', process.argv);
    });
    // appIcon.on('click', function(e) {
    //     if (mainWindow.isVisible()) {
    //         mainWindow.hide();
    //     } else {
    //         mainWindow.show();
    //         mainWindow.focus();
    //     }
    // });
});
