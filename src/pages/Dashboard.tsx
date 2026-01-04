import { useState, useEffect } from "react";
import { Home, ChevronRight } from "lucide-react";
import { DeviceCard } from "@/components/dashboard/DeviceCard";
import { MetricChart } from "@/components/dashboard/MetricChart";
import { useDevices } from "@/contexts/DeviceContext";

export default function Dashboard() {
  const { devices, getDeviceMetrics } = useDevices();
  // Calculate averages from actual devices
  const averageCurrent = devices.length > 0 
    ? devices.reduce((sum, device) => sum + getDeviceMetrics(device.id).current, 0) / devices.length
    : 0;
  
  const averageVoltage = devices.length > 0 
    ? devices.reduce((sum, device) => sum + getDeviceMetrics(device.id).voltage, 0) / devices.length
    : 0;

  // Generate chart data based on actual device averages
  const generateDeviceChartData = (baseValue: number, variance: number) => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const time = new Date(now.getTime() - (11 - i) * 5 * 60000);
      return {
        time: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        value: Math.round((baseValue + (Math.random() - 0.5) * variance) * 10) / 10,
      };
    });
  };

  const [currentData, setCurrentData] = useState(() => generateDeviceChartData(averageCurrent, 2));
  const [voltageData, setVoltageData] = useState(() => generateDeviceChartData(averageVoltage, 10));

  useEffect(() => {
    setCurrentData(generateDeviceChartData(averageCurrent, 2));
    setVoltageData(generateDeviceChartData(averageVoltage, 10));
  }, [devices.length, averageCurrent, averageVoltage]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentData(generateDeviceChartData(averageCurrent, 2));
      setVoltageData(generateDeviceChartData(averageVoltage, 10));
    }, 30000);

    return () => clearInterval(interval);
  }, [averageCurrent, averageVoltage]);

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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MetricChart
          title="Average Current"
          data={currentData}
          color="hsl(var(--gauge-current))"
          unit=" A"
        />
        <MetricChart
          title="Average Voltage"
          data={voltageData}
          color="hsl(var(--gauge-energy))"
          unit=" V"
        />
      </div>
    </div>
  );
}
