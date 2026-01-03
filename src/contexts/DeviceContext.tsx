import { createContext, useContext, useState, ReactNode } from "react";
import { Device, devices as initialDevices } from "@/lib/mockData";

interface DeviceMetrics {
  current: number;
  voltage: number;
  frequency: number;
  power: number;
  energy: number;
  powerFactor: number;
}

interface DeviceContextType {
  devices: Device[];
  addDevice: (device: Device) => void;
  removeDevice: (id: string) => void;
  getDeviceMetrics: (id: string) => DeviceMetrics;
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

  const addDevice = (device: Device) => {
    setDevices((prev) => [...prev, device]);
  };

  const removeDevice = (id: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
  };

  const getDeviceMetrics = (id: string): DeviceMetrics => {
    // Generate random metrics for each device
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
    <DeviceContext.Provider value={{ devices, addDevice, removeDevice, getDeviceMetrics }}>
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
