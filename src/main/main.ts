const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const JsonlDatabaseModule = require(path.join(__dirname, '..', 'shared', 'database', 'JsonlDatabase'));
const { JsonlDatabase } = JsonlDatabaseModule;

let mainWindow: any;
let db: any;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js'),
    },
  });

  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist-renderer/index.html'));
  }
};

app.whenReady().then(() => {
  // Initialize JSONL database
  db = new JsonlDatabase();
  
  createWindow();
  
  // Send DB status to renderer once window is ready
  mainWindow.webContents.once('did-finish-load', () => {
    const status = db.getDbStatus();
    mainWindow.webContents.send('db-status', {
      initialized: true,
      ...status
    });
  });
});

// Database IPC handlers
ipcMain.handle('update-search-criteria', async () => {
  try {
    await db.updateSearchCriteria();
    return { success: true, message: 'Search criteria updated successfully' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('get-db-status', () => {
  return db.getDbStatus();
});

// Audio file operations
ipcMain.handle('insert-audio-file', async (_: any, record: any) => {
  try {
    const id = await db.insertAudioFile(record);
    return { success: true, id };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('get-all-audio-files', async () => {
  try {
    const files = await db.getAllAudioFiles();
    return { success: true, data: files };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
