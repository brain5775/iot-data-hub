import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Device, devices as initialDevices } from "@/lib/mockData";
import { useMqtt, DeviceMetrics } from "@/hooks/useMqtt";

interface DeviceContextType {
  devices: Device[];
  addDevice: (device: Device) => void;
  removeDevice: (id: string) => void;
  getDeviceMetrics: (id: string) => DeviceMetrics;
  mqttConnected: boolean;
  mqttError: string | null;
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

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<Device[]>(initialDevices);

  // Generate MQTT topics based on device IDs
  const topics = devices.map((d) => `devices/${d.id}/metrics`);

  const { connected, error, messages } = useMqtt({
    topics,
    enabled: true,
  });

  const addDevice = (device: Device) => {
    setDevices((prev) => [...prev, device]);
  };

  const removeDevice = (id: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
  };

  const getDeviceMetrics = (id: string): DeviceMetrics => {
    // Return real-time MQTT data if available
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
        getDeviceMetrics,
        mqttConnected: connected,
        mqttError: error,
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
