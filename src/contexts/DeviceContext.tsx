import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Device, devices as initialDevices } from "@/lib/mockData";
import { useMqtt, DeviceMetrics, MqttHistoryEntry } from "@/hooks/useMqtt";

interface DeviceContextType {
  devices: Device[];
  addDevice: (device: Device) => void;
  removeDevice: (id: string) => void;
  updateDeviceTopic: (id: string, topic: string) => void;
  getDeviceMetrics: (id: string) => DeviceMetrics;
  mqttConnected: boolean;
  mqttError: string | null;
  mqttHistory: MqttHistoryEntry[];
  getDeviceHistory: (deviceId: string) => MqttHistoryEntry[];
  clearMqttHistory: () => void;
}

const defaultMetrics: DeviceMetrics = {
  current: 0.0,
  voltage: 220,
  frequency: 50.0,
  power: 0.0,
  energy: 0.0,
  powerFactor: 0.0,
};

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

// Load saved topics from localStorage
const loadSavedDevices = (): Device[] => {
  try {
    const saved = localStorage.getItem("device_mqtt_topics");
    if (saved) {
      const savedTopics = JSON.parse(saved) as Record<string, string>;
      return initialDevices.map((device) => ({
        ...device,
        mqttTopic: savedTopics[device.id] || device.mqttTopic,
      }));
    }
  } catch (e) {
    console.error("Failed to load saved MQTT topics:", e);
  }
  return initialDevices;
};

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<Device[]>(loadSavedDevices);

  // Generate MQTT topics based on device configuration
  const topics = devices.map((d) => d.mqttTopic || `devices/${d.id}/metrics`);

  const { connected, error, messages, history, getDeviceHistory, clearHistory } = useMqtt({
    topics,
    enabled: true,
    historyLimit: 100,
  });

  // Save topics to localStorage when devices change
  useEffect(() => {
    const topicsToSave: Record<string, string> = {};
    devices.forEach((d) => {
      if (d.mqttTopic) {
        topicsToSave[d.id] = d.mqttTopic;
      }
    });
    localStorage.setItem("device_mqtt_topics", JSON.stringify(topicsToSave));
  }, [devices]);

  const addDevice = (device: Device) => {
    setDevices((prev) => [...prev, device]);
  };

  const removeDevice = (id: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
  };

  const updateDeviceTopic = (id: string, topic: string) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, mqttTopic: topic } : d))
    );
  };

  const getDeviceMetrics = (id: string): DeviceMetrics => {
    // Find the device to get its custom topic
    const device = devices.find((d) => d.id === id);
    const topic = device?.mqttTopic || `devices/${id}/metrics`;
    
    // Check messages by topic (extract device id from topic or use direct match)
    if (messages[id]) {
      return messages[id].metrics;
    }

    // Fallback to mock data if not connected
    const seed = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return {
      current: Math.round((seed % 20) * 10) / 10,
      voltage: 200 + (seed % 50),
      frequency: 50.0,
      power: Math.round((seed % 10) * 100) / 100,
      energy: Math.round((seed % 100) * 10) / 10,
      powerFactor: Math.round((0.8 + (seed % 20) / 100) * 100) / 100,
    };
  };

  return (
    <DeviceContext.Provider
      value={{
        devices,
        addDevice,
        removeDevice,
        updateDeviceTopic,
        getDeviceMetrics,
        mqttConnected: connected,
        mqttError: error,
        mqttHistory: history,
        getDeviceHistory,
        clearMqttHistory: clearHistory,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevices() {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error("useDevices must be used within a DeviceProvider");
  }
  return context;
}
