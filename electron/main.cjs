const { app, BrowserWindow, ipcMain, globalShortcut, screen } = require('electron');
const path = require('path');
const { WebSocketServer } = require('ws');

const isDev = process.env.NODE_ENV === 'development';

const COMPACT  = { width: 380, height: 720 };
const EXPANDED = { width: 700, height: 780 };

let fabricWindow = null;
let wss = null;
let isExpanded = false;

// ── WebSocket server ──────────────────────────────────────────────────────────
function startWebSocketServer() {
  wss = new WebSocketServer({ port: 9001 });
  wss.on('connection', (ws) => {
    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'client-detected') showFabricPanel(msg.clientId, msg.activeApp);
        if (msg.type === 'client-cleared')  hideFabricPanel();
      } catch (e) { console.error('WS error:', e); }
    });
  });
  console.log('[Fabric] WebSocket server on ws://localhost:9001');
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
  const [w] = fabricWindow.getSize();
  const x = width - w - 16;
  const y = height - fabricWindow.getSize()[1] - 16;
  fabricWindow.setPosition(x, y);
}

function showFabricPanel(clientId, activeApp) {
  if (!fabricWindow) return;
  // Reset to compact whenever a new client triggers the panel
  isExpanded = false;
  fabricWindow.setSize(COMPACT.width, COMPACT.height, true);
  positionPanel();
  fabricWindow.setAlwaysOnTop(true, 'screen-saver');
  fabricWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  fabricWindow.showInactive();
  setTimeout(() => {
    fabricWindow.webContents.send('load-client', { clientId, activeApp });
    fabricWindow.webContents.send('set-expanded', false);
  }, 60);
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
  // Reposition after resize so it stays anchored to bottom-right
  setTimeout(positionPanel, 50);
  fabricWindow.webContents.send('set-expanded', isExpanded);
}

function broadcast(msg) {
  if (!wss) return;
  const data = JSON.stringify(msg);
  wss.clients.forEach((c) => { if (c.readyState === 1) c.send(data); });
}

// ── IPC ───────────────────────────────────────────────────────────────────────
ipcMain.on('close-fabric', () => hideFabricPanel());

// ── App lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  startWebSocketServer();
  createFabricWindow();

  // Cmd/Ctrl+Shift+E = global toggle expand/collapse
  const registered = globalShortcut.register('CommandOrControl+Shift+E', toggleExpand);
  if (!registered) console.error('[Robin] Failed to register expand shortcut');
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', (e) => {
  e.preventDefault();
});
