import React from "react";
import { MeetApiResponse } from "../types";
import { mean, take } from "lodash";

type Status = "DISCONNECTED" | "CONNECTED" | "CONNECTING" | "RECONNECTING";

// Need a more global way to communicate this data since the event listeners for the websocket are often looking at stale function defs.
let disableReconnect: boolean = false;
let backOffTimeMs: number = 2000;

export const useMeetData = ({
  meetId,
  password,
  apiKey,
  apiBaseUrl,
}: {
  meetId: string;
  password: string;
  apiKey: string;
  apiBaseUrl: string;
}) => {
  const [lastPing, setLastPing] = React.useState<number | null>(null);
  const [lastPong, setLastPong] = React.useState<number | null>(null);
  const [latency, setLatency] = React.useState<number[]>([]);
  const [status, setStatus] = React.useState<Status>("DISCONNECTED");
  const [wait, setWait] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<MeetApiResponse | null>(null);

  const websocket = React.useRef<null | WebSocket>(null);

  React.useEffect(() => {
    if (lastPing && lastPong && lastPong > lastPing) {
      const latency = lastPong - lastPing;
      setLatency((prev) => {
        const newLat = [...prev, latency];
        return take(newLat, 10);
      });
    }
  }, [lastPing, lastPong]);

  const onUpdate = (data: MeetApiResponse) => {
    // Some top level data properties won't be there if the data in them hasn't changed.
    // So be sure to keep any previous values.
    setData((prevData) => {
      if (prevData) {
        return { ...prevData, ...data };
      } else return data;
    });
  };

  const onError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const onClose = React.useCallback(() => {
    setStatus("DISCONNECTED");

    // Don't try to reconnect if the connection closed due to another connection opening somewhere else.
    if (!disableReconnect) {
      setStatus("RECONNECTING");
      setWait(backOffTimeMs);
      setTimeout(() => {
        const ws = connectWebsocket({
          meetId,
          password,
          onUpdate,
          onClose,
          onError,
          onOpen,
          onPing: setLastPing,
          onPong: setLastPong,
          apiKey,
          apiBaseUrl,
        });
        if (ws) {
          websocket.current = ws;
        }
        backOffTimeMs = backOffTimeMs * 2;
      }, backOffTimeMs);
    }
  }, [apiBaseUrl, apiKey, meetId, password]);

  const onOpen = () => {
    setStatus("CONNECTED");
    setError(null);
    backOffTimeMs = 2000;
  };

  // Establish initial websocket connection on startup.
  React.useEffect(() => {
    if (!websocket.current) {
      setStatus("CONNECTING");
      const ws = connectWebsocket({
        meetId,
        password,
        onUpdate,
        onClose,
        onError,
        onOpen,
        onPing: setLastPing,
        onPong: setLastPong,
        apiKey,
        apiBaseUrl,
      });
      if (ws) {
        websocket.current = ws;
      }
    }
  }, [apiBaseUrl, apiKey, meetId, onClose, password]);

  return {
    data,
    status,
    error,
    wait,
    latency: latency.length ? mean(latency) : 0,
  };
};

const connectWebsocket = ({
  meetId,
  password,
  onClose,
  onUpdate,
  onOpen,
  onError,
  onPing,
  onPong,
  apiKey,
  apiBaseUrl,
}: {
  meetId: string;
  password: string;
  onClose: () => void;
  onError: (errorMessage: string) => void;
  onUpdate: (data: MeetApiResponse) => void;
  onOpen: () => void;
  onPing: (time: number) => void;
  onPong: (time: number) => void;
  apiKey: string;
  apiBaseUrl: string;
}) => {
  let heartbeatTimeout: NodeJS.Timeout | null = null;

  const pingInterval = setInterval(() => {
    // If you send a "ping" message server will respond with a "pong" message.
    // This is different that the build in ping/pong protocol messages built into the ws protocol.
    ws.send("ping");
    onPing(Date.now());
  }, 30000);

  const heartbeat = () => {
    if (heartbeatTimeout) {
      clearTimeout(heartbeatTimeout);
    }

    // If we don't get a ping or other message after a min assume something is wrong and close the connection.
    heartbeatTimeout = setTimeout(() => {
      onError("Connection to server timed out.");
      ws.close();
    }, 60000);
  };

  const ws = new WebSocket(
    `${apiBaseUrl}?meetId=${encodeURI(meetId)}&auth=${encodeURI(
      btoa(`${meetId}:${password}`)
    )}&apiKey=${encodeURI(apiKey)}`
  );

  ws.addEventListener("message", (message) => {
    try {
      heartbeat();
      // just a heartbeat message, don't process further
      if (message.data === "pong") {
        onPong(Date.now());
        return;
      }
      const meetState = JSON.parse(message.data) as MeetApiResponse;
      console.log(meetState);
      onUpdate(meetState);
    } catch (e) {
      console.log("Error message from server ", message.data);
      // The server sent us a message before disconnecting us, don't try to reconnect in this case.
      disableReconnect = true;
      onError(message.data);
      ws.close();
    }
  });

  ws.addEventListener("open", () => {
    heartbeat();
    onOpen();
  });

  ws.addEventListener("close", () => {
    console.log("Connection closing.");
    if (pingInterval) {
      clearInterval(pingInterval);
    }
    if (heartbeatTimeout) {
      clearTimeout(heartbeatTimeout);
    }
    onClose();
  });

  ws.addEventListener("error", (error: Event) => {
    onError("Error connecting to server.");
    console.log(error);
  });

  return ws;
};
