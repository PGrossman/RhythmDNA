import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { JsonlDatabase } from '../shared/database/JsonlDatabase';

let mainWindow: BrowserWindow;
let db: JsonlDatabase;

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
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
});

ipcMain.handle('get-db-status', () => {
  return db.getDbStatus();
});

// Audio file operations
ipcMain.handle('insert-audio-file', async (_, record) => {
  try {
    const id = await db.insertAudioFile(record);
    return { success: true, id };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
});

ipcMain.handle('get-all-audio-files', async () => {
  try {
    const files = await db.getAllAudioFiles();
    return { success: true, data: files };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
