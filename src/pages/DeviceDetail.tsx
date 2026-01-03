import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Home, 
  ChevronRight, 
  Activity, 
  Zap, 
  Gauge as GaugeIcon, 
  Settings, 
  Power,
  Thermometer,
  Clock,
  Wifi,
  WifiOff,
  Save,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Gauge } from "@/components/dashboard/Gauge";
import { MetricChart } from "@/components/dashboard/MetricChart";
import { devices, deviceMetrics, generateChartData } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";

interface DeviceConfig {
  samplingRate: number;
  alertThreshold: number;
  autoReconnect: boolean;
  dataLogging: boolean;
}

export default function DeviceDetailPage() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const [currentData, setCurrentData] = useState(generateChartData("current", 20));
  const [voltageData, setVoltageData] = useState(generateChartData("voltage", 20));
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [config, setConfig] = useState<DeviceConfig>({
    samplingRate: 5,
    alertThreshold: 80,
    autoReconnect: true,
    dataLogging: true,
  });

  const device = devices.find((d) => d.id === deviceId);
  const metrics = deviceMetrics[deviceId as keyof typeof deviceMetrics] || deviceMetrics.device_1;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setCurrentData(generateChartData("current", 20));
      setVoltageData(generateChartData("voltage", 20));
      setIsRefreshing(false);
      toast({
        title: "Data Refreshed",
        description: "Latest readings have been fetched",
      });
    }, 1000);
  };

  const handleSaveConfig = () => {
    toast({
      title: "Configuration Saved",
      description: "Device settings have been updated",
    });
  };

  if (!device) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h2 className="text-xl font-semibold text-foreground mb-2">Device Not Found</h2>
        <p className="text-muted-foreground mb-4">The device you're looking for doesn't exist.</p>
        <Button asChild>
          <Link to="/device">Back to Devices</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">{device.name}</h1>
          <p className="page-subtitle">Device ID: {device.id}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Home className="w-4 h-4" />
            <Link to="/" className="hover:text-foreground">Dashboard</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/device" className="hover:text-foreground">Devices</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{device.name}</span>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div className="card-section animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              device.status === "online" ? "bg-green-500/20" : "bg-red-500/20"
            }`}>
              {device.status === "online" ? (
                <Wifi className="w-6 h-6 text-green-500" />
              ) : (
                <WifiOff className="w-6 h-6 text-red-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">{device.name}</h2>
                <Badge variant={device.status === "online" ? "default" : "destructive"}>
                  {device.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Last updated: Just now</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Uptime: 24h 32m 15s
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
          <TabsTrigger value="metrics" className="gap-2">
            <Activity className="w-4 h-4" />
            Live Metrics
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-2">
            <GaugeIcon className="w-4 h-4" />
            Historical Trends
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-2">
            <Settings className="w-4 h-4" />
            Configuration
          </TabsTrigger>
        </TabsList>

        {/* Live Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="card-section flex flex-col items-center">
              <Gauge
                value={metrics.current}
                min={0}
                max={50}
                label="Current"
                unit="A"
                color="hsl(var(--primary))"
              />
            </div>
            <div className="card-section flex flex-col items-center">
              <Gauge
                value={metrics.voltage}
                min={0}
                max={400}
                label="Voltage"
                unit="V"
                color="hsl(var(--accent))"
              />
            </div>
            <div className="card-section flex flex-col items-center">
              <Gauge
                value={metrics.frequency}
                min={45}
                max={55}
                label="Frequency"
                unit="Hz"
                color="hsl(180 70% 50%)"
              />
            </div>
            <div className="card-section flex flex-col items-center">
              <Gauge
                value={metrics.power}
                min={0}
                max={100}
                label="Power"
                unit="kW"
                color="hsl(45 90% 50%)"
              />
            </div>
            <div className="card-section flex flex-col items-center">
              <Gauge
                value={metrics.energy}
                min={0}
                max={1000}
                label="Energy"
                unit="kWh"
                color="hsl(280 70% 60%)"
              />
            </div>
            <div className="card-section flex flex-col items-center">
              <Gauge
                value={metrics.powerFactor}
                min={0}
                max={1}
                label="Power Factor"
                unit="PF"
                color="hsl(120 60% 50%)"
              />
            </div>
          </div>

          {/* Detailed Metrics Table */}
          <div className="card-section animate-fade-in">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Detailed Readings
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricItem icon={<Activity className="w-4 h-4" />} label="IR (Phase R)" value="3.2 A" />
              <MetricItem icon={<Activity className="w-4 h-4" />} label="IS (Phase S)" value="3.1 A" />
              <MetricItem icon={<Activity className="w-4 h-4" />} label="IT (Phase T)" value="3.3 A" />
              <MetricItem icon={<Activity className="w-4 h-4" />} label="I Average" value="3.2 A" />
              <MetricItem icon={<Zap className="w-4 h-4" />} label="Volt RS" value="385 V" />
              <MetricItem icon={<Zap className="w-4 h-4" />} label="Volt ST" value="382 V" />
              <MetricItem icon={<Zap className="w-4 h-4" />} label="Volt TR" value="384 V" />
              <MetricItem icon={<Zap className="w-4 h-4" />} label="V Average" value="383.7 V" />
              <MetricItem icon={<Power className="w-4 h-4" />} label="Power R" value="1.2 kW" />
              <MetricItem icon={<Power className="w-4 h-4" />} label="Power S" value="1.1 kW" />
              <MetricItem icon={<Power className="w-4 h-4" />} label="Power T" value="1.3 kW" />
              <MetricItem icon={<Power className="w-4 h-4" />} label="Total Power" value="3.6 kW" />
            </div>
          </div>
        </TabsContent>

        {/* Historical Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MetricChart
              title="Current Trend (Last 100 mins)"
              data={currentData}
              color="hsl(var(--primary))"
              unit=" A"
            />
            <MetricChart
              title="Voltage Trend (Last 100 mins)"
              data={voltageData}
              color="hsl(var(--accent))"
              unit=" V"
            />
          </div>

          <div className="card-section animate-fade-in">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-primary" />
              Statistics Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatCard label="Avg Current" value="0.08 A" change="+2.1%" positive />
              <StatCard label="Max Voltage" value="72.3 V" change="-0.5%" positive={false} />
              <StatCard label="Power Usage" value="45.2 kWh" change="+12.3%" positive />
              <StatCard label="Efficiency" value="94.5%" change="+1.2%" positive />
            </div>
          </div>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-section animate-fade-in">
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Device Settings
              </h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="sampling">Sampling Rate (seconds)</Label>
                  <Input
                    id="sampling"
                    type="number"
                    value={config.samplingRate}
                    onChange={(e) => setConfig({ ...config, samplingRate: Number(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">How often to collect data from the device</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="threshold">Alert Threshold (%)</Label>
                  <Input
                    id="threshold"
                    type="number"
                    value={config.alertThreshold}
                    onChange={(e) => setConfig({ ...config, alertThreshold: Number(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">Trigger alert when usage exceeds this percentage</p>
                </div>
              </div>
            </div>

            <div className="card-section animate-fade-in">
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <Power className="w-5 h-5 text-primary" />
                Connectivity Options
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-reconnect">Auto Reconnect</Label>
                    <p className="text-xs text-muted-foreground">Automatically reconnect on connection loss</p>
                  </div>
                  <Switch
                    id="auto-reconnect"
                    checked={config.autoReconnect}
                    onCheckedChange={(checked) => setConfig({ ...config, autoReconnect: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="data-logging">Data Logging</Label>
                    <p className="text-xs text-muted-foreground">Store historical data for this device</p>
                  </div>
                  <Switch
                    id="data-logging"
                    checked={config.dataLogging}
                    onCheckedChange={(checked) => setConfig({ ...config, dataLogging: checked })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveConfig} className="gap-2">
              <Save className="w-4 h-4" />
              Save Configuration
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper Components
function MetricItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
      <div className="text-primary">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  change, 
  positive 
}: { 
  label: string; 
  value: string; 
  change: string; 
  positive: boolean;
}) {
  return (
    <div className="text-center p-4 rounded-lg bg-muted/30 border border-border/50">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className={`text-xs mt-1 ${positive ? "text-green-500" : "text-red-500"}`}>
        {change}
      </p>
    </div>
  );
}
