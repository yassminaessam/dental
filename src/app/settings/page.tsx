
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Building, Users, Bell, Shield } from "lucide-react";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <main className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Settings</h1>
          <Button>Save Changes</Button>
        </div>

        <Tabs defaultValue="clinic">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
            <TabsTrigger value="clinic">Clinic</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="clinic" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Building className="h-5 w-5" />
                    Clinic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="clinic-name">Clinic Name</Label>
                    <Input id="clinic-name" defaultValue="DentalPro Clinic" />
                  </div>
                  <div>
                    <Label htmlFor="phone-number">Phone Number</Label>
                    <Input id="phone-number" defaultValue="(555) 123-4567" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="info@dentalpro.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" defaultValue="www.dentalpro.com" />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      defaultValue="123 Main Street, Suite 100 Anytown, State 12345"
                    />
                  </div>
                  <div>
                    <Label htmlFor="business-hours">Business Hours</Label>
                    <Select defaultValue="mon-fri-8-6">
                      <SelectTrigger id="business-hours">
                        <SelectValue placeholder="Select hours" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mon-fri-8-6">
                          Mon-Fri 8AM-6PM
                        </SelectItem>
                        <SelectItem value="mon-fri-9-5">
                          Mon-Fri 9AM-5PM
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="eastern">
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eastern">Eastern Time</SelectItem>
                        <SelectItem value="pacific">Pacific Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Appointment Settings</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="appointment-duration">
                      Default Appointment Duration
                    </Label>
                    <Select defaultValue="60">
                      <SelectTrigger id="appointment-duration">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="booking-limit">
                      Advance Booking Limit
                    </Label>
                    <Select defaultValue="90">
                      <SelectTrigger id="booking-limit">
                        <SelectValue placeholder="Select limit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-4 rounded-md border p-4 md:col-span-2">
                    <Switch id="online-booking" defaultChecked />
                    <div className="flex flex-col">
                      <Label htmlFor="online-booking">
                        Allow Online Booking
                      </Label>
                      <span className="text-sm text-muted-foreground">
                        Let patients book appointments online
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="users" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Users className="h-5 w-5" />
                    User Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                    <div className="flex flex-col">
                      <Label htmlFor="2fa-switch">
                        Require Two-Factor Authentication
                      </Label>
                      <span className="text-sm text-muted-foreground">
                        All users must enable 2FA
                      </span>
                    </div>
                    <Switch id="2fa-switch" />
                  </div>
                  <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                    <div className="flex flex-col">
                      <Label htmlFor="autolock-switch">
                        Auto-lock Inactive Sessions
                      </Label>
                      <span className="text-sm text-muted-foreground">
                        Lock sessions after 30 minutes of inactivity
                      </span>
                    </div>
                    <Switch id="autolock-switch" defaultChecked />
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="session-timeout">Session Timeout</Label>
                      <Select defaultValue="30">
                        <SelectTrigger id="session-timeout">
                          <SelectValue placeholder="Select timeout" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="password-policy">Password Policy</Label>
                      <Select defaultValue="strong">
                        <SelectTrigger id="password-policy">
                          <SelectValue placeholder="Select policy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="simple">
                            Simple (8+ chars)
                          </SelectItem>
                          <SelectItem value="strong">
                            Strong (8+ chars, mixed case, numbers, symbols)
                          </SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                  <div className="flex flex-col">
                    <Label>Appointment Reminders</Label>
                    <span className="text-sm text-muted-foreground">
                      Send reminders to patients
                    </span>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                  <div className="flex flex-col">
                    <Label>Payment Notifications</Label>
                    <span className="text-sm text-muted-foreground">
                      Notify when payments are received
                    </span>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                  <div className="flex flex-col">
                    <Label>Staff Schedule Changes</Label>
                    <span className="text-sm text-muted-foreground">
                      Alert when staff schedules change
                    </span>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                  <div className="flex flex-col">
                    <Label>System Maintenance</Label>
                    <span className="text-sm text-muted-foreground">
                      Notify about system updates
                    </span>
                  </div>
                  <Switch />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="reminder-timing">Reminder Timing</Label>
                    <Select defaultValue="24h">
                      <SelectTrigger id="reminder-timing">
                        <SelectValue placeholder="Select timing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">1 hour before</SelectItem>
                        <SelectItem value="24h">24 hours before</SelectItem>
                        <SelectItem value="48h">2 days before</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="notification-method">Notification Method</Label>
                    <Select defaultValue="both">
                      <SelectTrigger id="notification-method">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email only</SelectItem>
                        <SelectItem value="sms">SMS only</SelectItem>
                        <SelectItem value="both">Both email and SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                  <div className="flex flex-col">
                    <Label htmlFor="audit-logging">Enable Audit Logging</Label>
                    <span className="text-sm text-muted-foreground">
                      Track all system access and changes
                    </span>
                  </div>
                  <Switch id="audit-logging" defaultChecked />
                </div>
                <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                  <div className="flex flex-col">
                    <Label htmlFor="encrypt-data">Encrypt Patient Data</Label>
                    <span className="text-sm text-muted-foreground">
                      Additional encryption for sensitive data
                    </span>
                  </div>
                  <Switch id="encrypt-data" defaultChecked />
                </div>
                <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                  <div className="flex flex-col">
                    <Label htmlFor="hipaa-mode">HIPAA Compliance Mode</Label>
                    <span className="text-sm text-muted-foreground">
                      Enable strict HIPAA compliance features
                    </span>
                  </div>
                  <Switch id="hipaa-mode" defaultChecked />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="data-retention">Data Retention Period</Label>
                  <Select defaultValue="7y">
                    <SelectTrigger id="data-retention" className="w-full md:w-1/2">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1y">1 year</SelectItem>
                      <SelectItem value="3y">3 years</SelectItem>
                      <SelectItem value="5y">5 years</SelectItem>
                      <SelectItem value="7y">7 years</SelectItem>
                      <SelectItem value="forever">Indefinitely</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="backup">
            <Card>
              <CardContent className="flex h-48 items-center justify-center p-6 text-center text-muted-foreground">
                Backup settings will be shown here.
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="appearance">
            <Card>
              <CardContent className="flex h-48 items-center justify-center p-6 text-center text-muted-foreground">
                Appearance settings will be shown here.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </DashboardLayout>
  );
}
