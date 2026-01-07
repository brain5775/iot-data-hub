import { useState, useEffect, useCallback, useRef } from "react";
import mqtt, { MqttClient, IClientOptions } from "mqtt";

export interface MqttMessage {
  topic: string;
  payload: unknown;
  timestamp: Date;
}

export interface MqttConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

interface UseMqttOptions {
  host: string;
  port: number;
  username: string;
  password: string;
  topics: string[];
  onMessage?: (message: MqttMessage) => void;
}

export function useMqtt(options: UseMqttOptions | null) {
  const [connectionState, setConnectionState] = useState<MqttConnectionState>({
    isConnected: false,
    isConnecting: false,
    error: null,
  });
  const [messages, setMessages] = useState<MqttMessage[]>([]);
  const [lastMessage, setLastMessage] = useState<MqttMessage | null>(null);
  const clientRef = useRef<MqttClient | null>(null);

  const connect = useCallback(() => {
    if (!options || clientRef.current) return;

    setConnectionState({ isConnected: false, isConnecting: true, error: null });

    const { host, port, username, password, topics } = options;
    
    // WebSocket URL for EMQX
    const url = `wss://${host}:${port}/mqtt`;
    
    console.log("Connecting to MQTT broker:", url);

    const clientOptions: IClientOptions = {
      username,
      password,
      clientId: `lovable_${Math.random().toString(16).substring(2, 10)}`,
      clean: true,
      reconnectPeriod: 5000,
      connectTimeout: 30000,
      protocol: "wss",
    };

    try {
      const client = mqtt.connect(url, clientOptions);
      clientRef.current = client;

      client.on("connect", () => {
        console.log("MQTT connected successfully");
        setConnectionState({ isConnected: true, isConnecting: false, error: null });
        
        // Subscribe to topics
        topics.forEach((topic) => {
          client.subscribe(topic, { qos: 1 }, (err) => {
            if (err) {
              console.error(`Failed to subscribe to ${topic}:`, err);
            } else {
              console.log(`Subscribed to topic: ${topic}`);
            }
          });
        });
      });

      client.on("message", (topic, payload) => {
        console.log("MQTT message received:", topic, payload.toString());
        
        let parsedPayload: unknown;
        try {
          parsedPayload = JSON.parse(payload.toString());
        } catch {
          parsedPayload = payload.toString();
        }

        const message: MqttMessage = {
          topic,
          payload: parsedPayload,
          timestamp: new Date(),
        };

        setLastMessage(message);
        setMessages((prev) => [...prev.slice(-99), message]); // Keep last 100 messages
        
        options.onMessage?.(message);
      });

      client.on("error", (err) => {
        console.error("MQTT error:", err);
        setConnectionState((prev) => ({
          ...prev,
          isConnecting: false,
          error: err.message,
        }));
      });

      client.on("close", () => {
        console.log("MQTT connection closed");
        setConnectionState((prev) => ({
          ...prev,
          isConnected: false,
        }));
      });

      client.on("reconnect", () => {
        console.log("MQTT reconnecting...");
        setConnectionState((prev) => ({
          ...prev,
          isConnecting: true,
        }));
      });

      client.on("offline", () => {
        console.log("MQTT client offline");
        setConnectionState((prev) => ({
          ...prev,
          isConnected: false,
        }));
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect";
      console.error("MQTT connection error:", errorMessage);
      setConnectionState({
        isConnected: false,
        isConnecting: false,
        error: errorMessage,
      });
    }
  }, [options]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.end(true);
      clientRef.current = null;
      setConnectionState({ isConnected: false, isConnecting: false, error: null });
    }
  }, []);

  const publish = useCallback((topic: string, message: string | object) => {
    if (clientRef.current?.connected) {
      const payload = typeof message === "string" ? message : JSON.stringify(message);
      clientRef.current.publish(topic, payload, { qos: 1 });
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.end(true);
        clientRef.current = null;
      }
    };
  }, []);

  return {
    ...connectionState,
    messages,
    lastMessage,
    connect,
    disconnect,
    publish,
  };
}
