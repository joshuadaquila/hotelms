const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const initializeDatabase = require('./dbInitial');
const express = require('express');
const cors = require('cors');


const startServer = () => {
  const serverApp = express();
  const dbPath = path.join(__dirname, 'database.sqlite');
  const db = new sqlite3.Database(dbPath);

  console.log(dbPath)

  serverApp.use(cors());

  serverApp.get('/api/rooms', (req, res) => {
      db.all('SELECT count(roomid) as total FROM rooms', [], (err, rows) => {
          if (err) {
              return res.status(500).json({ error: err.message });
          }
          res.json(rows);
      });
  });

  const port = 3001;
  serverApp.listen(port, () => {
      console.log(`API server running at http://localhost:${port}`);
  });
};

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const mainWindow = new BrowserWindow({
        width: width,
        height: height,
        webPreferences: {
            contextIsolation: false, // Set to false for simplicity (not recommended for production)
            nodeIntegration: true, // Allow Node.js integration
            allowRunningInsecureContent: true,
            webSecurity: false
        },
    });

    console.log('Main window created'); // Debug log


    mainWindow.loadURL('http://localhost:3000');

    mainWindow.webContents.on('did-finish-load', () => {
        console.log('React app loaded'); 
    });
}

app.on('ready', () => {
    createWindow();
    initializeDatabase();
    startServer();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        console.log('App is ready'); // Debug log
        createWindow();
    }
});
