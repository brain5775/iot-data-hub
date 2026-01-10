import { useState, useEffect, useCallback, useRef } from "react";
import mqtt, { MqttClient } from "mqtt";
import { supabase } from "@/integrations/supabase/client";

export interface DeviceMetrics {
  current: number;
  voltage: number;
  frequency: number;
  power: number;
  energy: number;
  powerFactor: number;
}

export interface MqttMessage {
  deviceId: string;
  metrics: DeviceMetrics;
  timestamp: string;
  topic: string;
}

export interface MqttHistoryEntry extends MqttMessage {
  id: string;
}

interface UseMqttOptions {
  topics: string[];
  enabled?: boolean;
  historyLimit?: number;
}

export function useMqtt({ topics, enabled = true, historyLimit = 50 }: UseMqttOptions) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, MqttMessage>>({});
  const [history, setHistory] = useState<MqttHistoryEntry[]>([]);
  const clientRef = useRef<MqttClient | null>(null);

  const connect = useCallback(async () => {
    if (!enabled || clientRef.current?.connected) return;

    try {
      // Get MQTT config from edge function
      const { data, error: fnError } = await supabase.functions.invoke("mqtt-subscribe", {
        body: { action: "connect" },
      });

      if (fnError || !data?.success) {
        throw new Error(fnError?.message || data?.error || "Failed to get MQTT config");
      }

      const { broker, username, password } = data.config;

      // Connect via WebSocket
      const client = mqtt.connect(broker, {
        username,
        password,
        clientId: `lovable_${Math.random().toString(16).slice(2, 10)}`,
        protocol: "wss",
        reconnectPeriod: 5000,
        connectTimeout: 30000,
      });

      client.on("connect", () => {
        console.log("MQTT connected");
        setConnected(true);
        setError(null);

        // Subscribe to topics
        topics.forEach((topic) => {
          client.subscribe(topic, (err) => {
            if (err) {
              console.error(`Failed to subscribe to ${topic}:`, err);
            } else {
              console.log(`Subscribed to ${topic}`);
            }
          });
        });
      });

      client.on("message", (topic, payload) => {
        try {
          const message = JSON.parse(payload.toString());
          const deviceId = topic.split("/")[1] || topic;
          const timestamp = new Date().toISOString();
          
          const mqttMessage: MqttMessage = {
            deviceId,
            topic,
            metrics: {
              current: message.current ?? message.I ?? 0,
              voltage: message.voltage ?? message.V ?? 0,
              frequency: message.frequency ?? message.F ?? 50,
              power: message.power ?? message.P ?? 0,
              energy: message.energy ?? message.E ?? 0,
              powerFactor: message.powerFactor ?? message.PF ?? 0,
            },
            timestamp,
          };

          // Update latest message
          setMessages((prev) => ({
            ...prev,
            [deviceId]: mqttMessage,
          }));

          // Add to history
          const historyEntry: MqttHistoryEntry = {
            ...mqttMessage,
            id: `${deviceId}-${timestamp}-${Math.random().toString(36).slice(2, 9)}`,
          };

          setHistory((prev) => {
            const updated = [historyEntry, ...prev];
            return updated.slice(0, historyLimit);
          });
        } catch (e) {
          console.error("Failed to parse MQTT message:", e);
        }
      });

      client.on("error", (err) => {
        console.error("MQTT error:", err);
        setError(err.message);
        setConnected(false);
      });

      client.on("close", () => {
        console.log("MQTT disconnected");
        setConnected(false);
      });

      clientRef.current = client;
    } catch (err) {
      console.error("MQTT connection error:", err);
      setError(err instanceof Error ? err.message : "Connection failed");
    }
  }, [enabled, topics, historyLimit]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.end();
      clientRef.current = null;
      setConnected(false);
    }
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const getDeviceHistory = useCallback((deviceId: string) => {
    return history.filter((entry) => entry.deviceId === deviceId);
  }, [history]);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    connected,
    error,
    messages,
    history,
    getDeviceHistory,
    clearHistory,
    reconnect: connect,
  };
}
