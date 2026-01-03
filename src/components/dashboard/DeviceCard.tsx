import { Activity } from "lucide-react";
import { Gauge } from "./Gauge";

interface DeviceMetrics {
  current: number;
  voltage: number;
  frequency: number;
  power: number;
  energy: number;
  powerFactor: number;
}

interface DeviceCardProps {
  name: string;
  metrics: DeviceMetrics;
}

export function DeviceCard({ name, metrics }: DeviceCardProps) {
  return (
    <div className="card-section animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">{name}</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Gauge
          value={metrics.current}
          min={0}
          max={48}
          label="Current"
          unit="A"
          color="hsl(var(--gauge-current))"
        />
        <Gauge
          value={metrics.voltage}
          min={0}
          max={600}
          label="Voltage"
          unit="V"
          color="hsl(var(--gauge-voltage))"
        />
        <Gauge
          value={metrics.frequency}
          min={0}
          max={100}
          label="Frequency"
          unit="Hz"
          color="hsl(var(--gauge-frequency))"
        />
        <Gauge
          value={metrics.power}
          min={0}
          max={1000}
          label="Power"
          unit="kVA"
          color="hsl(var(--gauge-power))"
        />
        <Gauge
          value={metrics.energy}
          min={0}
          max={600}
          label="Energy"
          unit="kWh"
          color="hsl(var(--gauge-energy))"
        />
        <Gauge
          value={metrics.powerFactor}
          min={0}
          max={1}
          label="Power Factor"
          unit=""
          color="hsl(var(--primary))"
        />
      </div>
    </div>
  );
}
