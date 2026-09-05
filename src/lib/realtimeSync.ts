import { isSupabaseConfigured, supabase } from './supabase';

export type RealtimeEventType = 
  | 'SUBMISSION_CREATED'
  | 'PROPERTY_CREATED'
  | 'PROPERTY_UPDATED'
  | 'PROPERTY_DELETED'
  | 'STAFF_UPDATED'
  | 'BOOKING_CREATED'
  | 'LEAD_UPDATED'
  | 'DATA_REFRESH_REQUESTED';

export interface RealtimeSyncPayload {
  type: RealtimeEventType;
  timestamp: number;
  entityId?: string;
  metadata?: Record<string, any>;
}

const BROADCAST_CHANNEL_NAME = 'villaregia_realtime_channel';

class RealtimeSyncManager {
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Set<(payload: RealtimeSyncPayload) => void> = new Set();
  private supabaseChannel: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initBroadcastChannel();
      this.initSupabaseRealtime();
    }
  }

  private initBroadcastChannel() {
    try {
      if ('BroadcastChannel' in window) {
        this.broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.broadcastChannel.onmessage = (event: MessageEvent<RealtimeSyncPayload>) => {
          if (event.data && event.data.type) {
            this.notifyListeners(event.data);
          }
        };
      }
    } catch (e) {
      console.warn('RealtimeSync: BroadcastChannel unavailable', e);
    }
  }

  private initSupabaseRealtime() {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      this.supabaseChannel = supabase
        .channel('public-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public' }, (payload: any) => {
          const eventType: RealtimeEventType = 'DATA_REFRESH_REQUESTED';
          this.notifyListeners({
            type: eventType,
            timestamp: Date.now(),
            metadata: payload,
          });
        })
        .subscribe();
    } catch (e) {
      console.warn('RealtimeSync: Supabase subscription error', e);
    }
  }

  public notifyListeners(payload: RealtimeSyncPayload) {
    this.listeners.forEach((callback) => {
      try {
        callback(payload);
      } catch (err) {
        console.error('RealtimeSync listener error:', err);
      }
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('villaregia:realtime', { detail: payload })
      );
    }
  }

  public broadcast(type: RealtimeEventType, entityId?: string, metadata?: Record<string, any>) {
    const payload: RealtimeSyncPayload = {
      type,
      timestamp: Date.now(),
      entityId,
      metadata,
    };

    // Notify local tab
    this.notifyListeners(payload);

    // Broadcast to other open browser tabs
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(payload);
      } catch (e) {
        console.warn('RealtimeSync: Broadcast post error', e);
      }
    }
  }

  public subscribe(callback: (payload: RealtimeSyncPayload) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }
}

export const realtimeSync = new RealtimeSyncManager();
