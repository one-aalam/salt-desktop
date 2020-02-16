const {
    app,
    BrowserWindow,
    dialog,
    ipcMain
} = require('electron');
const path = require('path');
const recursivelyReadDir = require("recursive-readdir");
process.env.ELECTRON_ENABLE_SECURITY_WARNINGS = false;
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    const mode = process.env.NODE_ENV;
    mainWindow = new BrowserWindow({
        width: 900,
        height: 680,
        webPreferences: {
            nodeIntegration: false, // is default value after Electron v5
            contextIsolation: true, // protect against prototype pollution
            enableRemoteModule: false, // turn off remote
            preload: path.join(__dirname,  'preload.js') // use a preload script
        }
    });
    mainWindow.loadURL(`file://${path.join(__dirname, '../public/index.html')}`);
    mainWindow.on('closed', () => {
        mainWindow = null;
        if (watcher) {
            watcher.close();
        }
    });
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
    let watcher;
    if (mode === 'development') {
        watcher = require('chokidar').watch(path.join(__dirname, '../public/build'), { ignoreInitial: true });
        watcher.on('change', () => {
            mainWindow.reload();
        });
    }
    // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

const getMediaDir = async() => {
    const files = await dialog.showOpenDialog(mainWindow, {
      title: 'Select a media folder',
      properties: ['openDirectory', 'multiSelections'],
      filters: [
        { name: 'Media Files', extensions: ['mp4', 'mkv', 'mov'] }
      ]
    });
    const allFiles = await Promise.all(files.filePaths.map((filePath) => recursivelyReadDir(filePath)));
    mainWindow.webContents.send("fromMain", {
        cmd: 'DIR_READ',
        data: {
            files: allFiles,
            selections: files.filePaths
        }
    });
};

ipcMain.on("toMain", (event, { cmd, data }) => {
    console.log(cmd, data);
    getMediaDir();
});