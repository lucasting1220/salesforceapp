# Robin — Electron Demo

## What this is
An interactive desktop demo of a "Salesforce Fabric" concept — a frameless Electron panel that floats over any app and surfaces Sales Cloud context (opportunities, contacts, forecasting, Einstein score, connected sources) when a client is detected in a simulated Gmail or FinanceOS view.

## How to run
```bash
npm run demo
```
This starts Vite dev server (port 5173) and Electron together via `concurrently`.

If ports are stuck:
```bash
pkill -f electron; pkill -f vite
npm run demo
```

## Architecture
```
Browser (localhost:5173)          Electron main process
    Index.tsx                         main.cjs
    SimulatedGmail  ──WebSocket──▶  WebSocketServer :9001
    fabricBridge.ts                   │
                                      ▼
                                  FabricWindow (frameless BrowserWindow)
                                  localhost:5173?view=fabric
```

- **Browser** sends `client-detected` / `client-cleared` messages over WebSocket
- **Electron** shows/hides the frameless panel window and forwards IPC to the renderer
- **F1** global shortcut toggles compact (380px) ↔ expanded (700px) view

## Key files
| File | Role |
|------|------|
| `electron/main.cjs` | Electron main: WebSocket server, BrowserWindow, IPC, F1 shortcut |
| `electron/preload-fabric.cjs` | Exposes `window.fabricAPI` to the Fabric renderer |
| `src/pages/FabricWindow.tsx` | Fabric panel entry: onboarding gate, settings routing |
| `src/pages/Onboarding.tsx` | 4-step onboarding: email → connect tools → syncing → done |
| `src/pages/Settings.tsx` | Settings view: user info, connected sources, logout |
| `src/components/FabricPanel.tsx` | Main panel UI: compact + F1-expanded Sales Cloud view |
| `src/components/TheBrief.tsx` | Typewriter AI summary component |
| `src/lib/generateBrief.ts` | Generates contextual briefs per client + source app |
| `src/lib/fabricBridge.ts` | WebSocket client singleton (browser side) |
| `src/data/mockData.ts` | Mock clients: acme, globex, initech with full Sales Cloud data |
| `src/pages/Index.tsx` | Browser view: SimulatedGmail + FinanceOS tabs |

## Theme
Light theme — CSS HSL variables in `src/index.css`. Primary: navy `221 70% 40%`. No dark mode.

## Onboarding state
Stored in `localStorage` key `fabric_onboarded` (value = user email).
Clear with: `localStorage.clear()` in browser console to reset.

## Data model
Each mock client has:
- `salesCloud`: opportunity, contacts, forecast, einsteinScore, pendingAutomation
- `connectedSources`: gmail (threads), slack (channels), zendesk (tickets)
- `invoices`: for FinanceOS view
- `auditTrail`: activity history
