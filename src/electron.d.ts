// Type definitions for Electron context bridge APIs

interface ElectronAPI {
  sendClientDetected: (clientId: string, activeApp: string) => void;
  sendClientCleared: () => void;
  onFabricClosed: (callback: () => void) => void;
}

interface FabricAPI {
  onLoadClient:  (callback: (data: { clientId: string; activeApp: string }) => void) => void;
  onSetExpanded: (callback: (expanded: boolean) => void) => void;
  close:         () => void;
  toggleExpand:  () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    fabricAPI?: FabricAPI;
  }
}

export {};
