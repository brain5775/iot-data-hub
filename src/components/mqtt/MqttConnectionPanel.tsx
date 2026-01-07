import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Loader2, Settings2 } from "lucide-react";
import { useMqttContext, defaultConfig, MqttConfig } from "@/contexts/MqttContext";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function MqttConnectionPanel() {
  const { 
    config, 
    isConnected, 
    isConnecting, 
    error, 
    setConfig, 
    connect, 
    disconnect 
  } = useMqttContext();
  
  const [isOpen, setIsOpen] = useState(!isConnected);
  const [formData, setFormData] = useState<MqttConfig>(config || defaultConfig);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfig(formData);
    setTimeout(() => connect(), 100);
  };

  const handleDisconnect = () => {
    disconnect();
    setIsOpen(true);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-muted-foreground" />
            )}
            <CardTitle className="text-lg">MQTT Connection</CardTitle>
          </div>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnecting ? "Connecting..." : isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
        <CardDescription>
          Real-time sensor data via MQTT
        </CardDescription>
      </CardHeader>
      
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            {isOpen ? "Hide Settings" : "Show Settings"}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="host">Broker Host</Label>
                  <Input
                    id="host"
                    value={formData.host}
                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                    placeholder="broker.example.com"
                    disabled={isConnected || isConnecting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">WebSocket Port</Label>
                  <Input
                    id="port"
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                    placeholder="8084"
                    disabled={isConnected || isConnecting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="mqtt_user"
                    disabled={isConnected || isConnecting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    disabled={isConnected || isConnecting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Subscribe Topic</Label>
                <Input
                  id="topic"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="sensors/device1/data"
                  disabled={isConnected || isConnecting}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                  {error}
                </p>
              )}

              <div className="flex gap-2">
                {!isConnected ? (
                  <Button type="submit" disabled={isConnecting} className="flex-1">
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      "Connect"
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDisconnect}
                    className="flex-1"
                  >
                    Disconnect
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
