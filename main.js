const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const os = require('os');

// Define application data paths
const appDataPath = path.join(app.getPath('appData'), 'MedSync');
const configPath = path.join(appDataPath, 'config');
const logsPath = path.join(appDataPath, 'logs');
const dataPath = path.join(appDataPath, 'data');

// Ensure directories exist
ensureDirectoriesExist();

// Initialize settings store with custom location
const store = new Store({
  cwd: configPath,
  name: 'settings'
});

// Initialize system capabilities
let systemCapabilities = {
  hasWebcam: false,
  hasMicrophone: false
};

// Load system info if available
const systemInfoPath = path.join(configPath, 'system-info.json');
if (fs.existsSync(systemInfoPath)) {
  try {
    const systemInfo = JSON.parse(fs.readFileSync(systemInfoPath, 'utf8'));
    systemCapabilities.hasWebcam = systemInfo.hasWebcam;
    systemCapabilities.hasMicrophone = systemInfo.hasMicrophone;
    console.log('Loaded system capabilities:', systemCapabilities);
  } catch (error) {
    console.error('Error loading system info:', error);
  }
}

// Load AI configuration if available
const aiConfigPath = path.join(configPath, 'ai-config.json');
let aiConfig = {
  enableVoiceAssistant: systemCapabilities.hasMicrophone,
  enableVisionMonitoring: systemCapabilities.hasWebcam,
  enablePredictiveAnalytics: true,
  enablePillDetection: systemCapabilities.hasWebcam,
  enableRealTimeGpt: true,
  models: {
    useLightweightModels: false,
    recommendedBrowser: 'chrome'
  }
};

if (fs.existsSync(aiConfigPath)) {
  try {
    aiConfig = JSON.parse(fs.readFileSync(aiConfigPath, 'utf8'));
    console.log('Loaded AI configuration:', aiConfig);
    
    // Update store with loaded values
    store.set('enableVoiceAssistant', aiConfig.enableVoiceAssistant);
    store.set('enableVisionMonitoring', aiConfig.enableVisionMonitoring);
    store.set('enablePredictiveAnalytics', aiConfig.enablePredictiveAnalytics);
    store.set('enablePillDetection', aiConfig.enablePillDetection);
    store.set('enableRealTimeGpt', aiConfig.enableRealTimeGpt);
  } catch (error) {
    console.error('Error loading AI config:', error);
  }
}

// Enable experimental web platform features for advanced AI capabilities
app.commandLine.appendSwitch('enable-features', 'ExperimentalWebPlatformFeatures');
app.commandLine.appendSwitch('enable-speech-dispatcher'); // For voice recognition
app.commandLine.appendSwitch('enable-web-speech'); // For speech synthesis

// Register AI modules path
global.aiModulesPath = path.join(__dirname, 'ai-models');

// Share system capabilities and settings with the renderer process
global.systemCapabilities = systemCapabilities;
global.aiConfig = aiConfig;
global.appDataPath = appDataPath;

// Keep a global reference of the window object
let mainWindow;

// Create the main application window
function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false, // For security reasons
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      // Enable experimental features for advanced AI
      experimentalFeatures: true
    },
    icon: path.join(__dirname, 'assets/icons/icon.png'),
    show: false // Hide until ready to show
  });

  // Load the index.html file
  mainWindow.loadFile('index.html');

  // Show window when it's ready and maximize
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.maximize();
    
    // Check first run and show welcome message if needed
    if (store.get('firstRun', true)) {
      showWelcomeDialog();
      store.set('firstRun', false);
    }
    
    // Log startup in the logs directory
    logStartup();
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    // Dereference the window object
    mainWindow = null;
  });

  // Build application menu
  createMenu();
}

// Show welcome dialog for first-time users
function showWelcomeDialog() {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Welcome to MedSync',
    message: 'Welcome to MedSync Healthcare Monitoring System',
    detail: 'This appears to be your first time running MedSync. The application has been configured based on your system capabilities.\n\n' +
            `Webcam detected: ${systemCapabilities.hasWebcam ? 'Yes' : 'No'}\n` +
            `Microphone detected: ${systemCapabilities.hasMicrophone ? 'Yes' : 'No'}\n\n` +
            'You can adjust AI feature settings in the AI Modules menu or the Settings page.',
    buttons: ['Get Started'],
    icon: path.join(__dirname, 'assets/icons/icon.png')
  });
}

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Settings',
          click: () => {
            // Open settings window
            createSettingsWindow();
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Pages',
      submenu: [
        {
          label: 'Home',
          click: () => {
            mainWindow.loadFile('index.html');
          }
        },
        {
          label: 'Medical Dashboard',
          click: () => {
            mainWindow.loadFile('medical dashboard.html');
          }
        },
        {
          label: 'Family Dashboard',
          click: () => {
            mainWindow.loadFile('family dashboard.html');
          }
        },
        {
          label: 'Live Feed',
          click: () => {
            mainWindow.loadFile('live feed.html');
          }
        },
        {
          label: 'Reports',
          click: () => {
            mainWindow.loadFile('dailyReports.html');
          }
        },
        {
          label: 'Nutrients AI',
          click: () => {
            mainWindow.loadFile('nutrients-ai.html');
          }
        },
        {
          label: 'Charts',
          click: () => {
            mainWindow.loadFile('allcharts.html');
          }
        }
      ]
    },
    {
      label: 'AI Modules',
      submenu: [
        {
          label: 'Enable Voice Assistant',
          type: 'checkbox',
          checked: store.get('enableVoiceAssistant', systemCapabilities.hasMicrophone),
          enabled: systemCapabilities.hasMicrophone,
          click: (menuItem) => {
            store.set('enableVoiceAssistant', menuItem.checked);
            mainWindow.webContents.send('toggle-voice-assistant', menuItem.checked);
          }
        },
        {
          label: 'Enable Vision Monitoring',
          type: 'checkbox',
          checked: store.get('enableVisionMonitoring', systemCapabilities.hasWebcam),
          enabled: systemCapabilities.hasWebcam,
          click: (menuItem) => {
            store.set('enableVisionMonitoring', menuItem.checked);
            mainWindow.webContents.send('toggle-vision-monitoring', menuItem.checked);
          }
        },
        {
          label: 'Enable Pill Detection',
          type: 'checkbox',
          checked: store.get('enablePillDetection', systemCapabilities.hasWebcam),
          enabled: systemCapabilities.hasWebcam,
          click: (menuItem) => {
            store.set('enablePillDetection', menuItem.checked);
            mainWindow.webContents.send('toggle-pill-detection', menuItem.checked);
          }
        },
        {
          label: 'Enable Predictive Analytics',
          type: 'checkbox',
          checked: store.get('enablePredictiveAnalytics', true),
          click: (menuItem) => {
            store.set('enablePredictiveAnalytics', menuItem.checked);
            mainWindow.webContents.send('toggle-predictive-analytics', menuItem.checked);
          }
        },
        { type: 'separator' },
        {
          label: 'Configure AI Settings',
          click: () => {
            createAIConfigWindow();
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: () => {
            shell.openExternal('https://medsync.com/docs');
          }
        },
        {
          label: 'Check for Updates',
          click: () => {
            dialog.showMessageBox({
              type: 'info',
              title: 'Updates',
              message: 'MedSync is up to date!',
              detail: 'You are running the latest version of MedSync.'
            });
          }
        },
        {
          label: 'Run Hardware Detection',
          click: () => {
            runHardwareDetection();
          }
        },
        { type: 'separator' },
        {
          label: 'About MedSync',
          click: () => {
            dialog.showMessageBox({
              type: 'info',
              title: 'About MedSync',
              message: 'MedSync v1.1.0',
              detail: 'AI-powered healthcare monitoring system\n© 2025 MedSync Team'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Create the settings window
function createSettingsWindow() {
  const settingsWindow = new BrowserWindow({
    width: 800,
    height: 600,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load settings.html
  settingsWindow.loadFile('settings.html');
}

// Create AI configuration window
function createAIConfigWindow() {
  const aiConfigWindow = new BrowserWindow({
    width: 900,
    height: 700,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load ai-config.html
  if (fs.existsSync(path.join(__dirname, 'ai-config.html'))) {
    aiConfigWindow.loadFile('ai-config.html');
  } else {
    aiConfigWindow.loadFile('settings.html');
  }
}

// Run platform-config.js script to detect hardware capabilities
function runHardwareDetection() {
  const { spawn } = require('child_process');
  const platformConfigPath = path.join(__dirname, 'platform-config.js');
  
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Hardware Detection',
    message: 'Running hardware detection...',
    detail: 'MedSync will now scan your system for hardware capabilities like webcam and microphone.\nThe application will restart after detection completes.'
  });
  
  const child = spawn('node', [platformConfigPath]);
  
  child.stdout.on('data', (data) => {
    console.log(`platform-config.js: ${data}`);
  });
  
  child.stderr.on('data', (data) => {
    console.error(`platform-config.js error: ${data}`);
  });
  
  child.on('close', (code) => {
    console.log(`platform-config.js process exited with code ${code}`);
    
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Hardware Detection Complete',
      message: 'Hardware detection completed',
      detail: 'MedSync will now restart to apply the detected hardware capabilities.',
      buttons: ['Restart Now']
    }).then(() => {
      app.relaunch();
      app.exit();
    });
  });
}

// Ensure all required directories exist
function ensureDirectoriesExist() {
  const directories = [appDataPath, configPath, logsPath, dataPath];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
}

// Log application startup
function logStartup() {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} - Application started - ${os.userInfo().username}@${os.hostname()} - ${os.platform()} ${os.release()}\n`;
  fs.appendFileSync(path.join(logsPath, 'startup-log.txt'), logEntry);
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();
  
  // Setup required directories
  setupDatabaseDirectory();
  setupAIModelsDirectory();
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Setup database directory
function setupDatabaseDirectory() {
  const dbDir = path.join(dataPath, 'db');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('Created database directory');
  }
}

// Setup AI models directory
function setupAIModelsDirectory() {
  const aiModelsDir = path.join(__dirname, 'ai-models');
  if (!fs.existsSync(aiModelsDir)) {
    fs.mkdirSync(aiModelsDir, { recursive: true });
    console.log('Created AI models directory');
  }
}

// Make app store and system capabilities available to preload script
global.store = store; 