export interface Device {
  id: string;
  name: string;
  status: "online" | "offline";
  mqttTopic?: string;
}

export interface HistoryRecord {
  id: number;
  timestamp: string;
  ir: number;
  is: number;
  it: number;
  iAverage: number;
  voltRS: number;
  voltST: number;
  voltTR: number;
  voltRN: number;
  voltSN: number;
  voltTN: number;
  vAverage: number;
  pr: number;
  ps: number;
  pt: number;
  totalPower: number;
}

export const devices: Device[] = [
  { id: "device_1", name: "Generator 1", status: "online", mqttTopic: "devices/device_1/metrics" },
  { id: "device_2", name: "Generator 2", status: "online", mqttTopic: "devices/device_2/metrics" },
];

export const deviceMetrics = {
  device_1: {
    current: 0.0,
    voltage: 71,
    frequency: 50.0,
    power: 0.0,
    energy: 0.0,
    powerFactor: 0.0,
  },
  device_2: {
    current: 12.5,
    voltage: 220,
    frequency: 50.0,
    power: 2.75,
    energy: 45.2,
    powerFactor: 0.95,
  },
};

export function generateChartData(metric: "current" | "voltage", count: number = 10) {
  const baseValue = metric === "current" ? 0.1 : 71;
  const variance = metric === "current" ? 0.05 : 1;
  
  const now = new Date();
  
  return Array.from({ length: count }, (_, i) => {
    const time = new Date(now.getTime() - (count - 1 - i) * 5 * 60 * 1000);
    return {
      time: time.toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      value: baseValue + (Math.random() - 0.5) * variance * 2,
    };
  });
}

export function generateHistoryData(deviceId: string, startDate: Date, endDate: Date): HistoryRecord[] {
  const records: HistoryRecord[] = [];
  const diff = endDate.getTime() - startDate.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i < Math.min(days * 24, 100); i++) {
    const timestamp = new Date(startDate.getTime() + i * 60 * 60 * 1000);
    records.push({
      id: i + 1,
      timestamp: timestamp.toLocaleString(),
      ir: Math.random() * 10,
      is: Math.random() * 10,
      it: Math.random() * 10,
      iAverage: Math.random() * 10,
      voltRS: 380 + Math.random() * 20,
      voltST: 380 + Math.random() * 20,
      voltTR: 380 + Math.random() * 20,
      voltRN: 220 + Math.random() * 10,
      voltSN: 220 + Math.random() * 10,
      voltTN: 220 + Math.random() * 10,
      vAverage: 220 + Math.random() * 10,
      pr: Math.random() * 5,
      ps: Math.random() * 5,
      pt: Math.random() * 5,
      totalPower: Math.random() * 15,
    });
  }
  
  return records;
}
