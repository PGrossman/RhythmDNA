import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { DatabaseManager } from '../shared/database/DatabaseManager';

let mainWindow: BrowserWindow;
let dbManager: DatabaseManager;

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

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile('dist-renderer/index.html');
  }
};

app.whenReady().then(() => {
  // Initialize database
  dbManager = new DatabaseManager();
  
  createWindow();
  
  // Send DB status to renderer once window is ready
  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.webContents.send('db-status', {
      initialized: true,
      path: '/Users/grossph/Documents/RhythmDNA'
    });
  });
});

// Database IPC handlers
ipcMain.handle('update-search-criteria', () => {
  try {
    dbManager.updateSearchCriteria();
    return { success: true, message: 'Search criteria updated successfully' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('get-db-status', () => {
  return {
    path: '/Users/grossph/Documents/RhythmDNA',
    mainDbConnected: !!dbManager.getMainDb(),
    searchDbConnected: !!dbManager.getSearchDb()
  };
});

app.on('window-all-closed', () => {
  if (dbManager) {
    dbManager.close();
  }
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
