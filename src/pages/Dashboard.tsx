import { useState, useEffect } from "react";
import { Home, ChevronRight } from "lucide-react";
import { DeviceCard } from "@/components/dashboard/DeviceCard";
import { useDevices } from "@/contexts/DeviceContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";

const DEVICE_COLORS = [
  "hsl(var(--gauge-current))",
  "hsl(var(--gauge-energy))",
  "hsl(var(--primary))",
  "hsl(142, 76%, 36%)",
  "hsl(280, 65%, 60%)",
];

export default function Dashboard() {
  const { devices, getDeviceMetrics } = useDevices();

  // Generate chart data for each device
  const generateMultiDeviceData = (metricKey: "current" | "voltage") => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const time = new Date(now.getTime() - (11 - i) * 5 * 60000);
      const dataPoint: Record<string, string | number> = {
        time: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      };
      devices.forEach((device) => {
        const metrics = getDeviceMetrics(device.id);
        const baseValue = metricKey === "current" ? metrics.current : metrics.voltage;
        const variance = metricKey === "current" ? 2 : 10;
        dataPoint[device.name] = Math.round((baseValue + (Math.random() - 0.5) * variance) * 10) / 10;
      });
      return dataPoint;
    });
  };

  const [currentData, setCurrentData] = useState(() => generateMultiDeviceData("current"));
  const [voltageData, setVoltageData] = useState(() => generateMultiDeviceData("voltage"));

  useEffect(() => {
    setCurrentData(generateMultiDeviceData("current"));
    setVoltageData(generateMultiDeviceData("voltage"));
  }, [devices.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentData(generateMultiDeviceData("current"));
      setVoltageData(generateMultiDeviceData("voltage"));
    }, 30000);
    return () => clearInterval(interval);
  }, [devices]);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Control panel</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Home className="w-4 h-4" />
          <span>Home</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">Dashboard</span>
        </div>
      </div>

      {/* Device Cards */}
      {devices.map((device) => (
        <DeviceCard
          key={device.id}
          name={device.name}
          metrics={getDeviceMetrics(device.id)}
        />
      ))}

      {devices.length === 0 && (
        <div className="card-section text-center py-12">
          <p className="text-muted-foreground">No devices added yet. Add devices from the Device page.</p>
        </div>
      )}

      {/* Charts - one line per device */}
      {devices.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-section animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Current per Device</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} unit=" A" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Legend />
                  {devices.map((device, idx) => (
                    <Line key={device.id} type="monotone" dataKey={device.name} stroke={DEVICE_COLORS[idx % DEVICE_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-section animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Voltage per Device</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={voltageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} unit=" V" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Legend />
                  {devices.map((device, idx) => (
                    <Line key={device.id} type="monotone" dataKey={device.name} stroke={DEVICE_COLORS[idx % DEVICE_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
