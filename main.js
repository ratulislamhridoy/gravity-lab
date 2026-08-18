const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const logPath = path.join(__dirname, 'main_err.log');

// Catch any unhandled exceptions and dump them to a file in resources/app
process.on('uncaughtException', (err) => {
  try {
    fs.appendFileSync(logPath, `[uncaughtException ${new Date().toISOString()}] ${err.stack || err}\n`, 'utf8');
  } catch (_) {}
});

process.on('unhandledRejection', (reason, promise) => {
  try {
    fs.appendFileSync(logPath, `[unhandledRejection ${new Date().toISOString()}] ${reason.stack || reason}\n`, 'utf8');
  } catch (_) {}
});

try {
  fs.writeFileSync(logPath, 'main.js launched successfully at ' + new Date().toISOString() + '\n', 'utf8');
} catch (err) {
  // If even writing here fails, try to fallback to any path
}

// Ensure that we start the node server backend immediately
try {
  require('./server.js');
} catch (err) {
  try {
    fs.appendFileSync(logPath, '[server-require-error] ' + err.stack + '\n', 'utf8');
  } catch (_) {}
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1500,
    height: 950,
    title: "Gravity AI Studio",
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.setMenuBarVisibility(false);

  // Load the web app served by server.js
  win.loadURL('http://localhost:8080/');

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
     try {
       fs.appendFileSync(logPath, `[window-load-fail] URL: ${validatedURL}, Error: ${errorCode} (${errorDescription})\n`, 'utf8');
     } catch (_) {}
  });
}

app.whenReady().then(() => {
  try {
    fs.appendFileSync(logPath, 'app is ready, creating window...\n', 'utf8');
  } catch (_) {}
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
