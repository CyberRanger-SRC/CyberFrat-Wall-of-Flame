import { DiyaData } from '../types';

export type SyncEventType =
  | 'DIYA_ADDED'
  | 'DIYA_SELECTED'
  | 'FINALE_TRIGGERED'
  | 'FINALE_DISMISSED'
  | 'RESET_ALL'
  | 'WING_HIGHLIGHT';

export interface SyncMessage {
  type: SyncEventType;
  payload?: {
    diya?: DiyaData;
    diyaId?: string | null;
    wing?: 'none' | 'red' | 'blue' | 'both';
    diyas?: DiyaData[];
  };
  senderId: string;
  timestamp: number;
}

const CHANNEL_NAME = 'cyberfrat_diwali_cross_screen_sync';

class ScreenSyncService {
  private channel: BroadcastChannel | null = null;
  private clientId: string = Math.random().toString(36).substring(2, 9);
  private listeners: ((msg: SyncMessage) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event: MessageEvent<SyncMessage>) => {
          if (event.data && event.data.senderId !== this.clientId) {
            this.notify(event.data);
          }
        };
      } catch {
        // Fallback handled via storage
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'cyberfrat_diwali_sync_event' && e.newValue) {
          try {
            const data: SyncMessage = JSON.parse(e.newValue);
            if (data.senderId !== this.clientId) {
              this.notify(data);
            }
          } catch {
            // ignore
          }
        }
      });
    }
  }

  public subscribe(listener: (msg: SyncMessage) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(msg: SyncMessage) {
    this.listeners.forEach((listener) => {
      try {
        listener(msg);
      } catch (err) {
        console.error('Error in sync listener:', err);
      }
    });
  }

  public broadcast(type: SyncEventType, payload?: SyncMessage['payload']) {
    const msg: SyncMessage = {
      type,
      payload,
      senderId: this.clientId,
      timestamp: Date.now(),
    };

    // 1. Send via BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch (e) {
        console.warn('BroadcastChannel error', e);
      }
    }

    // 2. Send via localStorage for cross-tab event trigger
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cyberfrat_diwali_sync_event', JSON.stringify(msg));
      } catch {
        // ignore
      }
    }
  }
}

export const syncService = new ScreenSyncService();

