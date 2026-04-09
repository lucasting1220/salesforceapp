const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('fabricAPI', {
  onLoadClient:  (cb) => ipcRenderer.on('load-client',  (_, data) => cb(data)),
  onSetExpanded: (cb) => ipcRenderer.on('set-expanded', (_, val)  => cb(val)),
  close:         ()   => ipcRenderer.send('close-fabric'),
});
