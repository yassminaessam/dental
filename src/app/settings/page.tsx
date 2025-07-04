
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
import { Building } from "lucide-react";

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
          <TabsContent value="users">
            <Card>
              <CardContent className="flex h-48 items-center justify-center p-6 text-center text-muted-foreground">
                User settings will be shown here.
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="notifications">
            <Card>
              <CardContent className="flex h-48 items-center justify-center p-6 text-center text-muted-foreground">
                Notification settings will be shown here.
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="security">
            <Card>
              <CardContent className="flex h-48 items-center justify-center p-6 text-center text-muted-foreground">
                Security settings will be shown here.
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
