import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Zap, Gauge, BatteryCharging, Waves, Percent } from "lucide-react";
import { useMqttContext } from "@/contexts/MqttContext";
import { formatDistanceToNow } from "date-fns";

export function LiveSensorDisplay() {
  const { sensorData, isConnected } = useMqttContext();

  if (!isConnected) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-muted-foreground">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Connect to MQTT to see live sensor data</p>
        </CardContent>
      </Card>
    );
  }

  if (!sensorData) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Activity className="w-8 h-8 mx-auto mb-2 animate-pulse" />
          <p>Waiting for sensor data...</p>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      label: "Current",
      value: sensorData.current,
      unit: "A",
      icon: Zap,
      color: "text-yellow-500",
    },
    {
      label: "Voltage",
      value: sensorData.voltage,
      unit: "V",
      icon: BatteryCharging,
      color: "text-blue-500",
    },
    {
      label: "Frequency",
      value: sensorData.frequency,
      unit: "Hz",
      icon: Waves,
      color: "text-purple-500",
    },
    {
      label: "Power",
      value: sensorData.power,
      unit: "W",
      icon: Gauge,
      color: "text-green-500",
    },
    {
      label: "Energy",
      value: sensorData.energy,
      unit: "kWh",
      icon: Activity,
      color: "text-orange-500",
    },
    {
      label: "Power Factor",
      value: sensorData.powerFactor,
      unit: "",
      icon: Percent,
      color: "text-cyan-500",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-500 animate-pulse" />
            Live Sensor Data
          </CardTitle>
          {sensorData.timestamp && (
            <Badge variant="outline" className="text-xs">
              {formatDistanceToNow(sensorData.timestamp, { addSuffix: true })}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="bg-muted/50 rounded-lg p-3 text-center"
            >
              <metric.icon className={`w-5 h-5 mx-auto mb-1 ${metric.color}`} />
              <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
              <p className="text-lg font-semibold">
                {metric.value !== undefined ? metric.value.toFixed(2) : "--"}
                <span className="text-xs text-muted-foreground ml-1">{metric.unit}</span>
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
