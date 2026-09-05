import { useEffect } from 'react';
import { realtimeSync, RealtimeSyncPayload, RealtimeEventType } from '@/lib/realtimeSync';

export function useRealtimeSync(
  onSync: (payload: RealtimeSyncPayload) => void,
  filterTypes?: RealtimeEventType[]
) {
  useEffect(() => {
    const unsubscribe = realtimeSync.subscribe((payload) => {
      if (!filterTypes || filterTypes.length === 0 || filterTypes.includes(payload.type)) {
        onSync(payload);
      }
    });

    // Window focus re-validation trigger
    const handleWindowFocus = () => {
      onSync({
        type: 'DATA_REFRESH_REQUESTED',
        timestamp: Date.now(),
        metadata: { reason: 'window_focus' },
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleWindowFocus);
    }

    return () => {
      unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleWindowFocus);
      }
    };
  }, [onSync, filterTypes]);
}

export function broadcastDataChange(
  type: RealtimeEventType,
  entityId?: string,
  metadata?: Record<string, any>
) {
  realtimeSync.broadcast(type, entityId, metadata);
}
