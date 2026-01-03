import { useState, useEffect } from "react";
import { Home, ChevronRight } from "lucide-react";
import { DeviceCard } from "@/components/dashboard/DeviceCard";
import { MetricChart } from "@/components/dashboard/MetricChart";
import { devices, deviceMetrics, generateChartData } from "@/lib/mockData";

export default function Dashboard() {
  const [currentData, setCurrentData] = useState(generateChartData("current"));
  const [voltageData, setVoltageData] = useState(generateChartData("voltage"));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentData(generateChartData("current"));
      setVoltageData(generateChartData("voltage"));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

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
          metrics={deviceMetrics[device.id as keyof typeof deviceMetrics]}
        />
      ))}

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
