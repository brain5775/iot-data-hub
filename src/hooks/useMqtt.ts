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

interface MqttMessage {
  deviceId: string;
  metrics: DeviceMetrics;
  timestamp: string;
}

interface UseMqttOptions {
  topics: string[];
  enabled?: boolean;
}

export function useMqtt({ topics, enabled = true }: UseMqttOptions) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, MqttMessage>>({});
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
          
          setMessages((prev) => ({
            ...prev,
            [deviceId]: {
              deviceId,
              metrics: {
                current: message.current ?? message.I ?? 0,
                voltage: message.voltage ?? message.V ?? 0,
                frequency: message.frequency ?? message.F ?? 50,
                power: message.power ?? message.P ?? 0,
                energy: message.energy ?? message.E ?? 0,
                powerFactor: message.powerFactor ?? message.PF ?? 0,
              },
              timestamp: new Date().toISOString(),
            },
          }));
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
  }, [enabled, topics]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.end();
      clientRef.current = null;
      setConnected(false);
    }
  }, []);

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
    reconnect: connect,
  };
}
