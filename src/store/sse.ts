import { connectServerSideEvent } from "@/apis/example";
import { defineStore } from "pinia";
import { v4 } from "uuid";

/**
 * Server-Side Event
 */
enum SSEEvent {
  Rebuild = 0,
}

/**
 * Server-Side Event message
 */
type SSEMessage = {
  type: SSEEvent;
  [key: string]: unknown;
};

/**
 * Rebuild event listener;
 */
export type RebuildListener = () => void;

/**
 * Parse message and dispatch to listeners
 * @param e Message event
 * @param rebuildListeners Rebuild message listeners
 */
const dispatchMessage = (
  e: MessageEvent<string>,
  rebuildListeners: Map<string, RebuildListener>
) => {
  const data = JSON.parse(e.data) as SSEMessage;

  switch (data.type) {
    case SSEEvent.Rebuild:
      rebuildListeners.forEach((listener) => listener());
      break;
    default:
      return;
  }
};

export const useSSEStore = defineStore("sse", () => {
  let sse: EventSource | null = null;
  let sseConnecting = false;

  const rebuildListeners = new Map<string, RebuildListener>();
  const init = async () => {
    // only connect to sse when enabled
    if (!sseConnecting && !sse && import.meta.env.VITE_ENABLE_SSE === "true") {
      sseConnecting = true;
      sse = await connectServerSideEvent();
      sse.addEventListener("message", (e) => {
        dispatchMessage(e, rebuildListeners);
      });
      sseConnecting = false;
    }
  };
  return {
    sse,
    init,
    onRebuild(listener: RebuildListener) {
      const id = v4();
      rebuildListeners.set(id, listener);
      return id;
    },
    offRebuild(id: string) {
      rebuildListeners.delete(id);
    },
  };
});
