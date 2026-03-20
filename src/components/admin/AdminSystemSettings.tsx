import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Building2, Shield, Bell, FileText } from "lucide-react";
import { toast } from "sonner";

const AdminSystemSettings: React.FC = () => {
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Settings saved successfully");
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">System Settings</h2>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-1.5" /> {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>

      {/* Organization */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-portal-purple" />
            <CardTitle className="text-sm">Organization Details</CardTitle>
          </div>
          <CardDescription>Platform identity and registration info</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Platform Name</Label>
            <Input defaultValue="Legal Aid Hub" />
          </div>
          <div className="space-y-1.5">
            <Label>Registration Number</Label>
            <Input defaultValue="U74999DL2024PTC000001" />
          </div>
          <div className="space-y-1.5">
            <Label>GST Number</Label>
            <Input placeholder="GSTIN" />
          </div>
          <div className="space-y-1.5">
            <Label>PAN Number</Label>
            <Input placeholder="AAAPZ0000A" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Contact Email</Label>
            <Input defaultValue="support@legalaidhub.in" />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-portal-purple" />
            <CardTitle className="text-sm">Security Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Require 2FA for Admins</p>
              <p className="text-xs text-muted-foreground">Enforce two-factor authentication</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Session Timeout</p>
              <p className="text-xs text-muted-foreground">Auto-logout after inactivity</p>
            </div>
            <Select defaultValue="30">
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Minimum Password Length</p>
              <p className="text-xs text-muted-foreground">For all user accounts</p>
            </div>
            <Select defaultValue="8">
              <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="8">8 chars</SelectItem>
                <SelectItem value="10">10 chars</SelectItem>
                <SelectItem value="12">12 chars</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-portal-purple" />
            <CardTitle className="text-sm">Notification Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Send email for case updates</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">SMS Notifications</p>
              <p className="text-xs text-muted-foreground">SMS alerts for urgent cases</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">WhatsApp Notifications</p>
              <p className="text-xs text-muted-foreground">WhatsApp messages for updates</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* File Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-portal-purple" />
            <CardTitle className="text-sm">File Upload Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Max File Size (MB)</Label>
            <Input type="number" defaultValue="10" min="1" max="50" />
          </div>
          <div className="space-y-1.5">
            <Label>Allowed Types</Label>
            <Input defaultValue="PDF, DOC, DOCX, JPG, PNG" disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSystemSettings;
