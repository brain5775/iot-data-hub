import { useState, useEffect } from "react";
import { Home, ChevronRight, TrendingUp, Wifi, WifiOff } from "lucide-react";
import { DeviceCard } from "@/components/dashboard/DeviceCard";
import { useDevices } from "@/contexts/DeviceContext";
import { Badge } from "@/components/ui/badge";
import { MqttMessageHistory } from "@/components/mqtt/MqttMessageHistory";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const { devices, getDeviceMetrics, mqttConnected, mqttError, mqttHistory, clearMqttHistory } = useDevices();
  const [chartData, setChartData] = useState<Record<string, { current: Array<{ time: string; value: number }>; voltage: Array<{ time: string; value: number }> }>>({});

  const generateDeviceChartData = (deviceId: string, metricKey: "current" | "voltage") => {
    const metrics = getDeviceMetrics(deviceId);
    const baseValue = metricKey === "current" ? metrics.current : metrics.voltage;
    const variance = metricKey === "current" ? 2 : 10;
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const time = new Date(now.getTime() - (11 - i) * 5 * 60000);
      return {
        time: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        value: Math.round((baseValue + (Math.random() - 0.5) * variance) * 10) / 10,
      };
    });
  };

  useEffect(() => {
    const data: Record<string, { current: Array<{ time: string; value: number }>; voltage: Array<{ time: string; value: number }> }> = {};
    devices.forEach((device) => {
      data[device.id] = {
        current: generateDeviceChartData(device.id, "current"),
        voltage: generateDeviceChartData(device.id, "voltage"),
      };
    });
    setChartData(data);
  }, [devices.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      const data: Record<string, { current: Array<{ time: string; value: number }>; voltage: Array<{ time: string; value: number }> }> = {};
      devices.forEach((device) => {
        data[device.id] = {
          current: generateDeviceChartData(device.id, "current"),
          voltage: generateDeviceChartData(device.id, "voltage"),
        };
      });
      setChartData(data);
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
        <div className="flex items-center gap-4">
          {/* MQTT Status Indicator */}
          <Badge variant={mqttConnected ? "default" : "secondary"} className="flex items-center gap-1.5">
            {mqttConnected ? (
              <>
                <Wifi className="w-3 h-3" />
                <span>Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                <span>{mqttError ? "Error" : "Connecting..."}</span>
              </>
            )}
          </Badge>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Home className="w-4 h-4" />
            <span>Home</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Dashboard</span>
          </div>
        </div>
      </div>

      {devices.length === 0 && (
        <div className="card-section text-center py-12">
          <p className="text-muted-foreground">No devices added yet. Add devices from the Device page.</p>
        </div>
      )}

      {/* Device Cards with their individual charts */}
      {devices.map((device) => (
        <div key={device.id} className="space-y-4">
          <DeviceCard
            name={device.name}
            metrics={getDeviceMetrics(device.id)}
          />
          
          {chartData[device.id] && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="card-section animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Average Current - {device.name}</h3>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData[device.id].current}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} unit=" A" />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Line type="monotone" dataKey="value" stroke="hsl(var(--gauge-current))" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card-section animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Average Voltage - {device.name}</h3>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData[device.id].voltage}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} unit=" V" />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Line type="monotone" dataKey="value" stroke="hsl(var(--gauge-energy))" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* MQTT Message History */}
      <MqttMessageHistory history={mqttHistory} onClear={clearMqttHistory} />
    </div>
  );
}
