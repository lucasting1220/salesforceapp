const { app, BrowserWindow, ipcMain, globalShortcut, screen } = require('electron');
const path = require('path');
const { WebSocketServer } = require('ws');

const isDev = process.env.NODE_ENV === 'development';

const WS_PORT = 9001;
const PANEL_MARGIN = 16;
const REPOSITION_DELAY_MS = 50;

const COMPACT  = { width: 380, height: 720 };
const EXPANDED = { width: 700, height: 780 };

let fabricWindow = null;
let fabricReady = false;
let wss = null;
let isExpanded = false;

// ── WebSocket server ──────────────────────────────────────────────────────────

function startWebSocketServer() {
  wss = new WebSocketServer({ port: WS_PORT });
  wss.on('connection', (ws) => {
    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'client-detected') showFabricPanel(msg.clientId, msg.activeApp);
        if (msg.type === 'client-cleared')  hideFabricPanel();
      } catch (e) {
        console.error('[Robin] WebSocket message parse error:', e);
      }
    });
  });
  console.log(`[Robin] WebSocket server listening on ws://localhost:${WS_PORT}`);
}

// ── Fabric panel window ───────────────────────────────────────────────────────

function createFabricWindow() {
  fabricWindow = new BrowserWindow({
    ...COMPACT,
    show: false,
    frame: false,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload-fabric.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  fabricWindow.setAlwaysOnTop(true, 'screen-saver');
  fabricWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  fabricWindow.setBackgroundColor('#ffffff');

  fabricWindow.once('ready-to-show', () => {
    fabricReady = true;
  });

  if (isDev) {
    fabricWindow.loadURL('http://localhost:5173?view=fabric');
  } else {
    fabricWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
      query: { view: 'fabric' },
    });
  }

  fabricWindow.on('close', (e) => {
    e.preventDefault();
    hideFabricPanel();
  });
}

function positionPanel() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const [w, h] = fabricWindow.getSize();
  fabricWindow.setPosition(width - w - PANEL_MARGIN, height - h - PANEL_MARGIN);
}

function showFabricPanel(clientId, activeApp) {
  if (!fabricWindow) return;
  isExpanded = false;
  fabricWindow.setSize(COMPACT.width, COMPACT.height, true);
  positionPanel();
  fabricWindow.setAlwaysOnTop(true, 'screen-saver');
  fabricWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  const doShow = () => {
    fabricWindow.webContents.send('load-client', { clientId, activeApp });
    fabricWindow.webContents.send('set-expanded', false);
    fabricWindow.showInactive();
  };

  if (fabricReady) {
    doShow();
  } else {
    fabricWindow.once('ready-to-show', doShow);
  }
}

function hideFabricPanel() {
  if (!fabricWindow) return;
  isExpanded = false;
  fabricWindow.hide();
  broadcast({ type: 'fabric-closed' });
}

function toggleExpand() {
  if (!fabricWindow || !fabricWindow.isVisible()) return;
  isExpanded = !isExpanded;
  const target = isExpanded ? EXPANDED : COMPACT;
  fabricWindow.setSize(target.width, target.height, true);
  setTimeout(positionPanel, REPOSITION_DELAY_MS);
  fabricWindow.webContents.send('set-expanded', isExpanded);
}

function broadcast(msg) {
  if (!wss) return;
  const data = JSON.stringify(msg);
  wss.clients.forEach((c) => { if (c.readyState === 1) c.send(data); });
}

// ── IPC ───────────────────────────────────────────────────────────────────────

ipcMain.on('close-fabric',  () => hideFabricPanel());
ipcMain.on('toggle-expand', () => toggleExpand());

// ── App lifecycle ─────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  startWebSocketServer();
  createFabricWindow();

  const registered = globalShortcut.register('CommandOrControl+E', toggleExpand);
  if (!registered) console.error('[Robin] Failed to register Cmd+E shortcut');
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', (e) => {
  e.preventDefault();
});
