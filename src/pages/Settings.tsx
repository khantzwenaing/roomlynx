
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [retentionDays, setRetentionDays] = useState(30);
  const [autoDeleteReports, setAutoDeleteReports] = useState(true);
  const [maxDevices, setMaxDevices] = useState(3);
  const { toast } = useToast();

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('hotel_settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setRetentionDays(settings.retentionDays || 30);
      setAutoDeleteReports(settings.autoDeleteReports !== undefined ? settings.autoDeleteReports : true);
      setMaxDevices(settings.maxDevices || 3);
    }
  }, []);

  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem('hotel_settings', JSON.stringify({
      retentionDays,
      autoDeleteReports,
      maxDevices
    }));
    
    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully",
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Report Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={autoDeleteReports}
                onCheckedChange={setAutoDeleteReports}
                id="auto-delete"
              />
              <Label htmlFor="auto-delete">Auto-delete old reports</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="retention-days">Retention Period (Days)</Label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Slider
                    value={[retentionDays]}
                    min={7}
                    max={365}
                    step={1}
                    onValueChange={(values) => setRetentionDays(values[0])}
                    disabled={!autoDeleteReports}
                  />
                </div>
                <div className="w-16">
                  <Input
                    type="number"
                    value={retentionDays}
                    onChange={(e) => setRetentionDays(Number(e.target.value))}
                    disabled={!autoDeleteReports}
                    min={7}
                    max={365}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Reports older than this will be automatically deleted
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Access Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="max-devices">Maximum Concurrent Devices</Label>
              <Select 
                value={String(maxDevices)} 
                onValueChange={(value) => setMaxDevices(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select maximum devices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 device</SelectItem>
                  <SelectItem value="2">2 devices</SelectItem>
                  <SelectItem value="3">3 devices</SelectItem>
                  <SelectItem value="5">5 devices</SelectItem>
                  <SelectItem value="10">10 devices</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                The maximum number of devices that can access the system simultaneously
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSaveSettings}>Save Settings</Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
