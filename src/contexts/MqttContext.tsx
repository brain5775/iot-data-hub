import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { useMqtt, MqttMessage, MqttConnectionState } from "@/hooks/useMqtt";

interface MqttConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  topic: string;
}

interface SensorData {
  current?: number;
  voltage?: number;
  frequency?: number;
  power?: number;
  energy?: number;
  powerFactor?: number;
  timestamp?: Date;
  [key: string]: unknown;
}

interface MqttContextType extends MqttConnectionState {
  config: MqttConfig | null;
  sensorData: SensorData | null;
  sensorHistory: SensorData[];
  messages: MqttMessage[];
  setConfig: (config: MqttConfig) => void;
  connect: () => void;
  disconnect: () => void;
  clearHistory: () => void;
}

const defaultConfig: MqttConfig = {
  host: "k2f268df.ala.asia-southeast1.emqxsl.com",
  port: 8084,
  username: "",
  password: "",
  topic: "sensors/device1/data",
};

const MqttContext = createContext<MqttContextType | undefined>(undefined);

export function MqttProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<MqttConfig | null>(null);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [sensorHistory, setSensorHistory] = useState<SensorData[]>([]);

  const handleMessage = useCallback((message: MqttMessage) => {
    console.log("Processing MQTT message:", message);
    
    if (typeof message.payload === "object" && message.payload !== null) {
      const data = message.payload as SensorData;
      const enrichedData = {
        ...data,
        timestamp: message.timestamp,
      };
      
      setSensorData(enrichedData);
      setSensorHistory((prev) => [...prev.slice(-59), enrichedData]); // Keep last 60 readings
    }
  }, []);

  const mqttOptions = config
    ? {
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password,
        topics: [config.topic],
        onMessage: handleMessage,
      }
    : null;

  const mqtt = useMqtt(mqttOptions);

  const setConfig = useCallback((newConfig: MqttConfig) => {
    setConfigState(newConfig);
  }, []);

  const clearHistory = useCallback(() => {
    setSensorHistory([]);
    setSensorData(null);
  }, []);

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem("mqtt_config");
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfigState({ ...defaultConfig, ...parsed });
      } catch {
        console.error("Failed to parse saved MQTT config");
      }
    }
  }, []);

  // Save config to localStorage when it changes
  useEffect(() => {
    if (config) {
      // Don't save credentials to localStorage for security
      const { username, password, ...safeConfig } = config;
      localStorage.setItem("mqtt_config", JSON.stringify(safeConfig));
    }
  }, [config]);

  return (
    <MqttContext.Provider
      value={{
        config,
        sensorData,
        sensorHistory,
        messages: mqtt.messages,
        isConnected: mqtt.isConnected,
        isConnecting: mqtt.isConnecting,
        error: mqtt.error,
        setConfig,
        connect: mqtt.connect,
        disconnect: mqtt.disconnect,
        clearHistory,
      }}
    >
      {children}
    </MqttContext.Provider>
  );
}

export function useMqttContext() {
  const context = useContext(MqttContext);
  if (!context) {
    throw new Error("useMqttContext must be used within a MqttProvider");
  }
  return context;
}

export { defaultConfig };
export type { MqttConfig, SensorData };
