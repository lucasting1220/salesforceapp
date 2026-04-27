import { WS_URL } from "@/lib/constants";

type Handler = () => void;

const RECONNECT_DELAY_MS = 2000;

class FabricBridge {
  private ws: WebSocket | null = null;
  private onClosedHandlers: Handler[] = [];
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  connect() {
    if (this.ws && this.ws.readyState <= 1) return;

    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "fabric-closed") {
            this.onClosedHandlers.forEach((h) => h());
          }
        } catch {}
      };

      this.ws.onclose = () => {
        this.reconnectTimer = setTimeout(() => this.connect(), RECONNECT_DELAY_MS);
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch {
      this.reconnectTimer = setTimeout(() => this.connect(), RECONNECT_DELAY_MS);
    }
  }

  sendClientDetected(clientId: string, activeApp: string) {
    this.send({ type: "client-detected", clientId, activeApp });
  }

  sendClientCleared() {
    this.send({ type: "client-cleared" });
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

export const fabricBridge = new FabricBridge();
