import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { CalendarIcon, Download, TrendingUp } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";

const Analytics = () => {
  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 5));
  const [endDate, setEndDate] = useState<Date>(new Date());

  // Extended mock data for last 6 months
  const analyticsData = [
    { month: 'Aug', testsLaunched: 12, testsPlanned: 8 },
    { month: 'Sep', testsLaunched: 15, testsPlanned: 12 },
    { month: 'Oct', testsLaunched: 11, testsPlanned: 15 },
    { month: 'Nov', testsLaunched: 14, testsPlanned: 2 },
    { month: 'Dec', testsLaunched: 16, testsPlanned: 16 },
    { month: 'Jan', testsLaunched: 18, testsPlanned: 8 },
  ];

  const totalLaunched = analyticsData.reduce((sum, item) => sum + item.testsLaunched, 0);
  const totalPlanned = analyticsData.reduce((sum, item) => sum + item.testsPlanned, 0);
  const avgLaunched = Math.round(totalLaunched / analyticsData.length);
  const avgPlanned = Math.round(totalPlanned / analyticsData.length);

  const exportData = () => {
    const csvContent = [
      ['Month', 'Tests Launched', 'Tests Planned'],
      ...analyticsData.map(item => [item.month, item.testsLaunched, item.testsPlanned])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-foreground">Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Tests performance and planning insights
            </p>
          </div>
          <Button onClick={exportData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-4 mb-8 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">From:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-[140px] justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "MMM yyyy") : "Start"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">To:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-[140px] justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "MMM yyyy") : "End"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Launched
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{totalLaunched}</div>
              <p className="text-xs text-muted-foreground">
                Last 6 months
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Planned
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{totalPlanned}</div>
              <p className="text-xs text-muted-foreground">
                Last 6 months
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg. Launched/Month
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{avgLaunched}</div>
              <p className="text-xs text-success flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +15% trend
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg. Planned/Month
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{avgPlanned}</div>
              <p className="text-xs text-muted-foreground">
                Variable planning
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tests Performance Over Time</CardTitle>
            <p className="text-sm text-muted-foreground">
              Comparison between launched tests and planned tests
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="testsLaunched" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Tests Launched"
                    dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                    activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="testsPlanned" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Tests Planned"
                    dot={{ r: 4, fill: 'hsl(var(--muted-foreground))' }}
                    activeDot={{ r: 6, fill: 'hsl(var(--muted-foreground))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;