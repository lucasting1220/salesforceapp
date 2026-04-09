const { contextBridge, ipcRenderer } = require('electron');

// Exposed to the main window (Gmail / FinanceOS)
contextBridge.exposeInMainWorld('electronAPI', {
  sendClientDetected: (clientId, activeApp) =>
    ipcRenderer.send('client-detected', { clientId, activeApp }),
  sendClientCleared: () =>
    ipcRenderer.send('client-cleared'),
  onFabricClosed: (callback) =>
    ipcRenderer.on('fabric-closed', callback),
});
