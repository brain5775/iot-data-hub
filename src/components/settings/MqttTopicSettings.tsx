import { useState } from "react";
import { Wifi, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useDevices } from "@/contexts/DeviceContext";

export function MqttTopicSettings() {
  const { devices, updateDeviceTopic, mqttConnected } = useDevices();
  const { toast } = useToast();
  const [editedTopics, setEditedTopics] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleTopicChange = (deviceId: string, topic: string) => {
    setEditedTopics((prev) => ({
      ...prev,
      [deviceId]: topic,
    }));
  };

  const getDisplayTopic = (deviceId: string, currentTopic?: string) => {
    return editedTopics[deviceId] ?? currentTopic ?? `devices/${deviceId}/metrics`;
  };

  const hasChanges = (deviceId: string, currentTopic?: string) => {
    const editedTopic = editedTopics[deviceId];
    if (editedTopic === undefined) return false;
    return editedTopic !== (currentTopic ?? `devices/${deviceId}/metrics`);
  };

  const handleSave = async (deviceId: string) => {
    const newTopic = editedTopics[deviceId];
    if (!newTopic) return;

    setIsSaving(true);
    try {
      updateDeviceTopic(deviceId, newTopic);
      setEditedTopics((prev) => {
        const updated = { ...prev };
        delete updated[deviceId];
        return updated;
      });
      toast({
        title: "Topic updated",
        description: `MQTT topic for device updated successfully.`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = (deviceId: string, currentTopic?: string) => {
    setEditedTopics((prev) => {
      const updated = { ...prev };
      delete updated[deviceId];
      return updated;
    });
  };

  const handleSaveAll = () => {
    const changedDevices = devices.filter((d) => hasChanges(d.id, d.mqttTopic));
    changedDevices.forEach((device) => {
      const newTopic = editedTopics[device.id];
      if (newTopic) {
        updateDeviceTopic(device.id, newTopic);
      }
    });
    setEditedTopics({});
    toast({
      title: "All topics updated",
      description: `Updated ${changedDevices.length} device topic(s).`,
    });
  };

  const anyChanges = devices.some((d) => hasChanges(d.id, d.mqttTopic));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              MQTT Topic Configuration
            </CardTitle>
            <CardDescription>Configure MQTT topics for each device</CardDescription>
          </div>
          <Badge variant={mqttConnected ? "default" : "secondary"}>
            {mqttConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {devices.map((device) => (
          <div key={device.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={`topic-${device.id}`} className="font-medium">
                {device.name}
              </Label>
              <Badge variant={device.status === "online" ? "default" : "outline"} className="text-xs">
                {device.status}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Input
                id={`topic-${device.id}`}
                value={getDisplayTopic(device.id, device.mqttTopic)}
                onChange={(e) => handleTopicChange(device.id, e.target.value)}
                placeholder={`devices/${device.id}/metrics`}
                className="font-mono text-sm"
              />
              {hasChanges(device.id, device.mqttTopic) && (
                <>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleReset(device.id, device.mqttTopic)}
                    title="Reset"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={() => handleSave(device.id)}
                    disabled={isSaving}
                    title="Save"
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Device ID: <code className="bg-muted px-1 rounded">{device.id}</code>
            </p>
          </div>
        ))}

        {anyChanges && (
          <div className="pt-4 border-t">
            <Button onClick={handleSaveAll} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Save All Changes
            </Button>
          </div>
        )}

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            <strong>Topic format:</strong> Use topics like <code className="bg-muted px-1 rounded">devices/{'<device_id>'}/metrics</code> or any custom topic structure your MQTT broker supports.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
