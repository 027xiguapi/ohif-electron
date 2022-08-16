const fs = require('fs');
const path = require('path');
var net = require('net');
const express = require('express');
const morgan = require('morgan');
const PouchDB = require('pouchdb');
const port = 5984;
 
// 检测端口是否被占用
function portIsOccupied (port, callBack) {
  // 创建服务并监听该端口
  var server = net.createServer().listen(port)
 
  server.on('listening', function () { // 执行这块代码说明端口未被占用
    server.close(); // 关闭服务
    console.log(`The port[${port}] is available.`); // 控制台输出信息
    callBack();
  })
 
  server.on('error', function (err) {
    if (err.code === 'EADDRINUSE') { // 端口已经被使用
      console.log(`The port[${port}] is occupied, please change other port.`);
    }
  })
}

// https://stackoverflow.com/questions/60881343/electron-problem-creating-file-error-erofs-read-only-file-system
function getAppDataPath(appName) {
  switch (process.platform) {
    case 'darwin': {
      return path.join(
        process.env.HOME,
        'Library',
        'Application Support',
        appName
      );
    }
    case 'win32': {
      return path.join(process.env.APPDATA, appName);
    }
    case 'linux': {
      return path.join(process.env.HOME, `.${appName}`);
    }
    default: {
      console.log('Unsupported platform!');
      process.exit(1);
    }
  }
}

// todo if dev use appDataDirPath=${__dirname}/../
const appDataDirPath = getAppDataPath('OHIFViewer');
const pouchDBFolder = `${appDataDirPath}/__ohif-pouchdb-storage/`;

// TODO: mkdir -p instead
if (!fs.existsSync(appDataDirPath)) {
  fs.mkdirSync(appDataDirPath);
}

if (!fs.existsSync(pouchDBFolder)) {
  fs.mkdirSync(pouchDBFolder);
}

const CustomPouchDB = PouchDB.defaults({
  prefix: pouchDBFolder,
});

const app = express();

// Create a write stream (in append mode)
const logStream = fs.createWriteStream(path.join(appDataDirPath, 'data.log'), {
  flags: 'a',
});
const pouchdbLog = path.join(appDataDirPath, 'pouchdb.log');
const options = { logPath: pouchdbLog };

// Setup the logger
app.use(morgan('dev', { stream: logStream }));
app.use('/', require('express-pouchdb')(CustomPouchDB, options));

const chronicle = new PouchDB('chronicle');

portIsOccupied(port, ()=>{
  app.listen(port, () => console.log(`PouchDB server listening on port ${port}`));
});

module.exports = app;
