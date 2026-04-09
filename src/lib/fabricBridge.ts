// Bridge between the browser (fake Gmail) and the Electron Fabric panel.
// Connects via WebSocket to the local Electron process.

type Handler = () => void;

class FabricBridge {
  private ws: WebSocket | null = null;
  private onClosedHandlers: Handler[] = [];
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  connect() {
    if (this.ws && this.ws.readyState <= 1) return; // already connecting/open

    try {
      this.ws = new WebSocket('ws://localhost:9001');

      this.ws.onopen = () => {
        console.log('[Fabric] Connected to Electron panel');
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'fabric-closed') {
            this.onClosedHandlers.forEach((h) => h());
          }
        } catch {}
      };

      this.ws.onclose = () => {
        // Retry connection every 2s — Electron may launch after the browser
        this.reconnectTimer = setTimeout(() => this.connect(), 2000);
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch {
      this.reconnectTimer = setTimeout(() => this.connect(), 2000);
    }
  }

  sendClientDetected(clientId: string, activeApp: string) {
    this.send({ type: 'client-detected', clientId, activeApp });
  }

  sendClientCleared() {
    this.send({ type: 'client-cleared' });
  }

  onFabricClosed(handler: Handler) {
    this.onClosedHandlers.push(handler);
  }

  get connected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private send(msg: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }
}

// Singleton — one bridge per page
export const fabricBridge = new FabricBridge();
