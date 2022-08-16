// 引入模块
const path = require('path');
const { BrowserWindow, app } = require('electron');

require('./pouchdb.js');

const dicomWebServer = require('dicomweb-server');

// 开发环境
const isDev = require('electron-is-dev')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1150,
    height: 750,
    webPreferences: {
      // 使用 preload 预加载模块, 可以把 nodeIntegration 禁用掉, 在 preload 阶段是可以访问 node 的,
      // 这样做是因为即使启用了 node, webpack 在进行打包的时候也不会识别 node 模块和 electron 模块,
      nodeIntegration: true,
    },
    setIcon: `file://${__dirname}/../front-end/assets/favicon.ico`
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/../front-end/index.html#/`);

  // Open the DevTools.
  isDev && mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
  mainWindow.setMenu(null);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
