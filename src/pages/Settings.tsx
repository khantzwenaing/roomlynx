
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GasAndChargesSettings from "@/components/settings/GasAndChargesSettings";
import { getGasSettings, updateGasSettings } from "@/services/settingsService";
import { GasSettings } from "@/types";

const Settings = () => {
  const [retentionDays, setRetentionDays] = useState(30);
  const [autoDeleteReports, setAutoDeleteReports] = useState(true);
  const [maxDevices, setMaxDevices] = useState(3);
  const [gasSettings, setGasSettings] = useState<GasSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load settings from localStorage and database on component mount
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      
      // Load general settings from localStorage
      const savedSettings = localStorage.getItem('hotel_settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setRetentionDays(settings.retentionDays || 30);
        setAutoDeleteReports(settings.autoDeleteReports !== undefined ? settings.autoDeleteReports : true);
        setMaxDevices(settings.maxDevices || 3);
      }
      
      // Load gas settings from database
      try {
        const settings = await getGasSettings();
        setGasSettings(settings);
      } catch (error) {
        console.error("Error loading gas settings:", error);
        toast({
          title: "Error",
          description: "Failed to load gas settings",
          variant: "destructive",
        });
      }
      
      setIsLoading(false);
    };
    
    loadSettings();
  }, [toast]);

  const handleSaveSettings = () => {
    // Save general settings to localStorage
    localStorage.setItem('hotel_settings', JSON.stringify({
      retentionDays,
      autoDeleteReports,
      maxDevices
    }));
    
    toast({
      title: "Settings Saved",
      description: "Your general settings have been saved successfully",
    });
  };

  const handleSaveGasSettings = async (settings: Omit<GasSettings, 'id' | 'created_at'>) => {
    try {
      // If we have existing settings, update them, otherwise use addDefaultGasSettings
      let updatedSettings;
      if (gasSettings && gasSettings.id) {
        updatedSettings = await updateGasSettings({
          ...settings,
          id: gasSettings.id
        });
      } else {
        updatedSettings = await getGasSettings(); // This should call addDefaultGasSettings if none exist
      }
      
      if (updatedSettings) {
        setGasSettings(updatedSettings);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error saving gas settings:", error);
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>

      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="charges">Gas & Charges</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
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
        </TabsContent>
        
        <TabsContent value="charges">
          <GasAndChargesSettings
            onSave={handleSaveGasSettings}
            initialSettings={gasSettings || undefined}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
