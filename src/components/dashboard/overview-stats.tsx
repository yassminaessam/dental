import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { overviewStats } from "@/lib/data";
import { DollarSign, Users, Calendar, UserPlus } from "lucide-react";

const iconMap = {
  DollarSign: <DollarSign className="h-4 w-4 text-muted-foreground" />,
  Users: <Users className="h-4 w-4 text-muted-foreground" />,
  Calendar: <Calendar className="h-4 w-4 text-muted-foreground" />,
  UserPlus: <UserPlus className="h-4 w-4 text-muted-foreground" />,
};

type IconKey = keyof typeof iconMap;

export default function OverviewStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {overviewStats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {iconMap[stat.icon as IconKey]}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
