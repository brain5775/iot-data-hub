import { useState } from "react";
import { Link } from "react-router-dom";
import { Home, ChevronRight, Plus, Info, X, Cpu, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { devices as initialDevices, Device } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";

export default function DevicePage() {
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [deviceId, setDeviceId] = useState("");
  const [deviceName, setDeviceName] = useState("");

  const handleAddDevice = () => {
    if (!deviceId.trim() || !deviceName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (devices.some((d) => d.id === deviceId)) {
      toast({
        title: "Error",
        description: "Device ID already exists",
        variant: "destructive",
      });
      return;
    }

    const newDevice: Device = {
      id: deviceId,
      name: deviceName,
      status: "online",
    };

    setDevices([...devices, newDevice]);
    setDeviceId("");
    setDeviceName("");

    toast({
      title: "Success",
      description: "Device added successfully",
    });
  };

  const handleDeleteDevice = (id: string) => {
    setDevices(devices.filter((d) => d.id !== id));
    toast({
      title: "Deleted",
      description: "Device removed successfully",
    });
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Add Hardware</h1>
          <p className="page-subtitle">Add new hardware to control and monitoring</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Home className="w-4 h-4" />
          <span>Hardware</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">Add Hardware</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add New Hardware Form */}
        <div className="card-section animate-fade-in">
          <div className="flex items-center gap-2 mb-6">
            <Cpu className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Add New Hardware</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deviceId" className="text-right text-muted-foreground">
                ID Device
              </Label>
              <Input
                id="deviceId"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                className="col-span-3"
                placeholder="Enter device ID"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deviceName" className="text-right text-muted-foreground">
                Name
              </Label>
              <Input
                id="deviceName"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="col-span-3"
                placeholder="Enter device name"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAddDevice} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Hardware
              </Button>
            </div>
          </div>
        </div>

        {/* Device List */}
        <div className="card-section animate-fade-in">
          <div className="flex items-center gap-2 mb-6">
            <Info className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">List Hardware</h2>
          </div>

          <div className="space-y-4">
            {devices.map((device, index) => (
              <div key={device.id} className="relative">
                {/* Timeline connector */}
                {index < devices.length - 1 && (
                  <div className="absolute left-3 top-10 w-0.5 h-full bg-border" />
                )}
                
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 z-10">
                    <Info className="w-3 h-3 text-primary-foreground" />
                  </div>
                  
                  <div className="flex-1 pb-6">
                    <h3 className="font-medium text-foreground">{device.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      ID Device : {device.id}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link to={`/device/${device.id}`}>
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Details
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteDevice(device.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {devices.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No devices added yet
              </p>
            )}

            {/* Close button */}
            <div className="flex justify-center pt-4">
              <Button variant="outline" size="icon" className="rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
