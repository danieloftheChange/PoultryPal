import { useEffect, useState } from "react";
import Navbar2 from "@/components/navBar2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/layout";
import {
  BarChart as BarChartIcon,
  Home,
  Boxes,
  Users,
  Feather,
  Plus,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Calendar,
  Thermometer,
  Droplet,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

// Dashboard data types
interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  contact: string;
}

interface House {
  id: string;
  name: string;
  capacity: number;
  houseType: string;
  isMonitored: boolean;
}

interface Batch {
  id: string;
  name: string;
  arrivalDate: Date;
  ageAtArrival: number;
  chickenType: string;
  quantity: number;
  supplier: string;
  isArchived: boolean;
}

// Mock recent activities for the activity feed
const activities = [
  {
    id: '1',
    type: 'stock',
    message: 'Low stock alert: Feed is below threshold',
    time: '10 minutes ago',
    severity: 'warning'
  },
  {
    id: '2',
    type: 'production',
    message: 'Daily production recorded: 4500 eggs collected',
    time: '2 hours ago',
    severity: 'info'
  },
  {
    id: '3',
    type: 'health',
    message: 'Batch #3 scheduled for vaccination tomorrow',
    time: '3 hours ago',
    severity: 'info'
  },
  {
    id: '4',
    type: 'monitoring',
    message: 'Temperature in House 2 above normal range',
    time: '5 hours ago',
    severity: 'danger'
  },
  {
    id: '5',
    type: 'staff',
    message: 'New worker account created: John D.',
    time: '1 day ago',
    severity: 'info'
  }
];

// Helper function to get random environmental data for the current day
const getRandomEnvironmentalData = () => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  return hours.map(hour => ({
    hour: hour,
    temperature: Math.round((22 + Math.random() * 6) * 10) / 10,
    humidity: Math.round((50 + Math.random() * 20) * 10) / 10,
    ammonia: Math.round((5 + Math.random() * 3) * 10) / 10,
  }));
};

// Helper function to get random production data for the past week
const getRandomProductionData = () => {
  const days = 7;
  const result = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Generate random data but with a pattern
    const baseline = 4000 + Math.random() * 500;
    const weekend = date.getDay() === 0 || date.getDay() === 6;

    result.unshift({
      date: format(date, 'MMM dd'),
      eggsCollected: Math.round(weekend ? baseline * 0.9 : baseline),
      deadBirds: Math.round(Math.random() * 10),
    });
  }

  return result;
};

// Helper function to get stock level data for visualization
const getStockLevelData = () => [
  { name: 'Feed', value: 65, color: '#10b981' },
  { name: 'Medicine', value: 30, color: '#3b82f6' },
  { name: 'Equipment', value: 85, color: '#8b5cf6' },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("weekly");
  const [selectedHouse, setSelectedHouse] = useState<string | null>(null);
  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = storedUser ? JSON.parse(storedUser) : null;

  const accessToken = localStorage.getItem('accessToken');

  // Fetch staff data
  const { data: staff = [], isLoading: isStaffLoading } = useQuery<Staff[]>({
    queryKey: ['staff'],
    queryFn: async () => {
      try {
        const res = await fetch('http://92.112.180.180:3000/api/v1/user/staff', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch staff data');
        return res.json();
      } catch (err) {
        console.error('Failed to fetch staff data:', err);
        throw err;
      }
    },
  });

  // Fetch houses data
  const { data: houses = [], isLoading: isHousesLoading } = useQuery<House[]>({
    queryKey: ['houses'],
    queryFn: async () => {
      try {
        const res = await fetch('http://92.112.180.180:3000/api/v1/house', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch house data');
        return res.json();
      } catch (err) {
        console.error('Failed to fetch house data:', err);
        throw err;
      }
    },
  });

  // Fetch batches data
  const { data: batches = [], isLoading: isBatchesLoading } = useQuery<Batch[]>({
    queryKey: ['batches'],
    queryFn: async () => {
      try {
        const res = await fetch('http://92.112.180.180:3000/api/v1/batch', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch batch data');
        return res.json();
      } catch (err) {
        console.error('Failed to fetch batch data:', err);
        throw err;
      }
    },
  });

  // For environmental data, we'll use mock data for now
  // In a real app, this would come from your API
  const [environmentalData, setEnvironmentalData] = useState(getRandomEnvironmentalData());
  const productionData = getRandomProductionData();
  const stockData = getStockLevelData();

  // Calculate summary statistics
  const activeBatches = batches?.filter(batch => !batch.isArchived)?.length || 0;
  const monitoredHouses = houses?.filter(house => house.isMonitored)?.length || 0;
  const totalCapacity = houses?.reduce((total, house) => total + (house.capacity || 0), 0) || 0;
  const workerCount = staff?.filter(person => person.role === "Worker")?.length || 0;
  const totalBirds = batches
    ?.filter(batch => !batch.isArchived)
    ?.reduce((total, batch) => total + (batch.quantity || 0), 0) || 0;

  // Calculate production metrics
  const todayProduction = productionData[productionData.length - 1]?.eggsCollected || 0;
  const yesterdayProduction = productionData[productionData.length - 2]?.eggsCollected || 0;
  const productionChange = todayProduction - yesterdayProduction;
  const productionChangePercent = yesterdayProduction ? (productionChange / yesterdayProduction) * 100 : 0;

  // Calculate capacity utilization
  const capacityUtilization = totalCapacity ? (totalBirds / totalCapacity) * 100 : 0;

  // Format production data for visualization
  const productionChartData = productionData.map(item => ({
    ...item,
    eggsCollected: item.eggsCollected,
    deadBirds: item.deadBirds,
  }));

  useEffect(() => {
    // Add a timer to simulate real-time data updates
    const timer = setInterval(() => {
      // Update environmental data with small variations to simulate real-time changes
      setEnvironmentalData(prev => {
        const lastHour = prev[prev.length - 1];
        return [
          ...prev.slice(1),
          {
            hour: lastHour.hour + 1 > 23 ? 0 : lastHour.hour + 1,
            temperature: Math.max(18, Math.min(32, lastHour.temperature + (Math.random() - 0.5) * 0.5)),
            humidity: Math.max(40, Math.min(80, lastHour.humidity + (Math.random() - 0.5) * 1)),
            ammonia: Math.max(3, Math.min(10, lastHour.ammonia + (Math.random() - 0.5) * 0.2)),
          }
        ];
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(timer);
  }, []);

  // Format environmental data for visualization
  const currentHour = new Date().getHours();
  const relevantEnvironmentalData = environmentalData
    .filter(data => data.hour <= currentHour || currentHour === 0)
    .map(data => ({
      ...data,
      time: `${String(data.hour).padStart(2, '0')}:00`,
    }));

  if (isStaffLoading || isHousesLoading || isBatchesLoading) {
    return (
      <Layout>
        <Navbar2 />
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Navbar2 />
      <div className="flex-1 space-y-4 p-4 md:p-6 pt-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          {user?.role !== "Worker" && (
            <div className="flex items-center gap-2">
              <Button onClick={() => navigate('/settings')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          )}
        </div>

        {/* Overview Stats */}
        {user?.role !== "Worker" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Birds</CardTitle>
                <Feather className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalBirds.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Across {activeBatches} active batches
                </p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Capacity Utilization</span>
                    <span className="font-medium">{Math.round(capacityUtilization)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.min(100, capacityUtilization)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Houses Monitored</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monitoredHouses} / {houses.length}</div>
                <p className="text-xs text-muted-foreground">
                  Total capacity: {totalCapacity.toLocaleString()} birds
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => navigate('/houses')}
                  >
                    View Houses
                  </Button>
                  <Button
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => navigate('/houses')}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add House
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Production</CardTitle>
                <BarChartIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold">{todayProduction.toLocaleString()}</div>
                  <Badge variant={productionChange >= 0 ? "default" : "destructive"} className="ml-auto">
                    {productionChange >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                    {Math.abs(productionChangePercent).toFixed(1)}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  vs {yesterdayProduction.toLocaleString()} yesterday
                </p>
                <div className="mt-3">
                  <ResponsiveContainer width="100%" height={40}>
                    <AreaChart data={productionChartData}>
                      <defs>
                        <linearGradient id="productionGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="eggsCollected"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#productionGradient)"
                        animationDuration={300}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Farm Workers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workerCount}</div>
                <p className="text-xs text-muted-foreground">
                  Out of {staff.length} total staff
                </p>
                <div className="mt-3">
                  <div className="grid grid-cols-3 gap-1">
                    {staff.slice(0, 3).map((person) => (
                      <div key={person.id} className="flex flex-col items-center">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                          {person.firstName[0]}{person.lastName[0]}
                        </div>
                        <span className="text-xs mt-1 truncate max-w-full">
                          {person.firstName}
                        </span>
                      </div>
                    ))}
                  </div>
                  {staff.length > 3 && (
                    <Button
                      variant="link"
                      size="sm"
                      className="w-full mt-1 text-xs h-7"
                      onClick={() => navigate('/staff')}
                    >
                      View All Staff
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Environmental Monitoring */}
          {/* <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Environmental Monitoring</CardTitle>
              <CardDescription>
                Real-time conditions in your poultry houses
              </CardDescription>
              <div className="flex space-x-2 mt-2">
                <select
                  value={selectedHouse || ''}
                  onChange={(e) => setSelectedHouse(e.target.value || null)}
                  className="text-sm p-1 border rounded"
                >
                  <option value="">All Houses</option>
                  {houses.filter(h => h.isMonitored).map(house => (
                    <option key={house.id} value={house.id}>{house.name}</option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[230px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={relevantEnvironmentalData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) => [`${value}`, '']}
                      labelFormatter={(label) => `Time: ${label}`}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="temperature"
                      name="Temperature (°C)"
                      stroke="#ef4444"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="humidity"
                      name="Humidity (%)"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="ammonia"
                      name="Ammonia (ppm)"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                  <Thermometer className="h-7 w-7 text-red-500" />
                  <div>
                    <div className="text-xs text-gray-500">Temperature</div>
                    <div className="text-xl font-semibold text-gray-900">
                      {relevantEnvironmentalData[relevantEnvironmentalData.length - 1]?.temperature.toFixed(1)}°C
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <Droplet className="h-7 w-7 text-blue-500" />
                  <div>
                    <div className="text-xs text-gray-500">Humidity</div>
                    <div className="text-xl font-semibold text-gray-900">
                      {relevantEnvironmentalData[relevantEnvironmentalData.length - 1]?.humidity.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                  <AlertTriangle className="h-7 w-7 text-purple-500" />
                  <div>
                    <div className="text-xs text-gray-500">Ammonia</div>
                    <div className="text-xl font-semibold text-gray-900">
                      {relevantEnvironmentalData[relevantEnvironmentalData.length - 1]?.ammonia.toFixed(1)} ppm
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card> */}

          {/* Activity Feed */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest events and notifications from your farm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[330px] overflow-auto">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center ${activity.severity === 'warning' ? 'bg-amber-100 text-amber-600' :
                      activity.severity === 'danger' ? 'bg-red-100 text-red-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                      {activity.type === 'stock' && <Boxes className="h-4 w-4" />}
                      {activity.type === 'production' && <BarChartIcon className="h-4 w-4" />}
                      {activity.type === 'health' && <Feather className="h-4 w-4" />}
                      {activity.type === 'monitoring' && <Thermometer className="h-4 w-4" />}
                      {activity.type === 'staff' && <Users className="h-4 w-4" />}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm">{activity.message}</p>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full mt-4 text-sm">
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </div>
        {user?.role !== "Worker" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Production Trends */}
            <Card className="col-span-2">
              <CardHeader className="flex flex-row items-center">
                <div>
                  <CardTitle>Production Trends</CardTitle>
                  <CardDescription>
                    Daily egg production and mortality rates
                  </CardDescription>
                </div>
                <div className="ml-auto">
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="text-sm p-1 border rounded"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productionChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar yAxisId="left" dataKey="eggsCollected" name="Eggs Collected" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="deadBirds" name="Mortality" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Stock Levels */}
            <Card>
              <CardHeader>
                <CardTitle>Stock Levels</CardTitle>
                <CardDescription>
                  Current inventory status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stockData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {stockData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value}%`, '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 grid gap-2">
                  {stockData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <div className="flex-1 text-sm">{item.name}</div>
                      <div className="text-sm font-medium">{item.value}%</div>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-4 text-sm"
                  onClick={() => navigate('/stock')}
                >
                  Manage Stock
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Today's Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Today's Tasks</CardTitle>
              <CardDescription>
                Scheduled activities for {format(new Date(), "MMMM d, yyyy")}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/tasks')}>
              <Calendar className="h-4 w-4 mr-2" />
              View Calendar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Batch #2 Vaccination</div>
                  <Badge>10:00 AM</Badge>
                </div>
                <p className="text-sm text-gray-500">
                  Newcastle disease vaccination for Layer Batch #2
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <Button size="sm" className="w-full">Mark Complete</Button>
                  <Button size="sm" variant="outline">Reassign</Button>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Feed Restocking</div>
                  <Badge variant="outline">1:30 PM</Badge>
                </div>
                <p className="text-sm text-gray-500">
                  Restock Layer Feed in Houses 1, 2 and 3
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <Button size="sm" className="w-full">Mark Complete</Button>
                  <Button size="sm" variant="outline">Reassign</Button>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">House 1 Cleaning</div>
                  <Badge variant="outline">3:00 PM</Badge>
                </div>
                <p className="text-sm text-gray-500">
                  Scheduled cleaning and disinfection of House 1
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <Button size="sm" className="w-full">Mark Complete</Button>
                  <Button size="sm" variant="outline">Reassign</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DashboardPage;