import { useState } from "react";
import { History, Trash2, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { MqttHistoryEntry } from "@/hooks/useMqtt";
import { useDevices } from "@/contexts/DeviceContext";

interface MqttMessageHistoryProps {
  history: MqttHistoryEntry[];
  onClear: () => void;
  deviceFilter?: string;
}

export function MqttMessageHistory({ history, onClear, deviceFilter }: MqttMessageHistoryProps) {
  const { devices } = useDevices();
  const [selectedDevice, setSelectedDevice] = useState<string>(deviceFilter || "all");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const filteredHistory = selectedDevice === "all"
    ? history
    : history.filter((entry) => entry.deviceId === selectedDevice);

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              MQTT Message History
            </CardTitle>
            <CardDescription>
              Recent messages received from devices ({filteredHistory.length} messages)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedDevice} onValueChange={setSelectedDevice}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by device" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Devices</SelectItem>
                {devices.map((device) => (
                  <SelectItem key={device.id} value={device.id}>
                    {device.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={onClear}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No messages received yet</p>
            <p className="text-sm">Messages will appear here when devices send data</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {filteredHistory.map((entry) => {
                const device = devices.find((d) => d.id === entry.deviceId);
                const isExpanded = expandedItems.has(entry.id);

                return (
                  <Collapsible key={entry.id} open={isExpanded}>
                    <div className="border rounded-lg overflow-hidden">
                      <CollapsibleTrigger asChild>
                        <button
                          onClick={() => toggleExpanded(entry.id)}
                          className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="font-mono text-xs">
                              {formatTime(entry.timestamp)}
                            </Badge>
                            <span className="font-medium text-sm">
                              {device?.name || entry.deviceId}
                            </span>
                            <Badge variant="secondary" className="font-mono text-xs">
                              {entry.topic}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(entry.timestamp)}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="px-3 pb-3 pt-1 border-t bg-muted/30">
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                            <MetricPill label="Current" value={`${entry.metrics.current.toFixed(2)} A`} />
                            <MetricPill label="Voltage" value={`${entry.metrics.voltage.toFixed(1)} V`} />
                            <MetricPill label="Frequency" value={`${entry.metrics.frequency.toFixed(1)} Hz`} />
                            <MetricPill label="Power" value={`${entry.metrics.power.toFixed(2)} kW`} />
                            <MetricPill label="Energy" value={`${entry.metrics.energy.toFixed(1)} kWh`} />
                            <MetricPill label="PF" value={entry.metrics.powerFactor.toFixed(2)} />
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background rounded px-2 py-1 border">
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
