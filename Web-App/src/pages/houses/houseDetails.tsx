import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout';
import Navbar2 from '@/components/navBar2';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Home, Boxes, Monitor, Thermometer, Droplet, AlertTriangle, Info, MoreHorizontal, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Batch } from "@/components/dataTable/batchColumns";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from 'react-hot-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface House {
  id: string;
  name: string;
  capacity: number;
  houseType: string;
  isMonitored: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Allocation {
  id: string;
  batchId: string;
  houseId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

interface SensorData {
  id: string;
  houseId: string;
  temperature: number;
  humidity: number;
  ammonia?: number;
  lightIntensity?: number;
  soundIntensity?: number;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

const allocationSchema = z.object({
  batchId: z.string().min(1, 'Batch is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
});

const transferSchema = z.object({
  batchId: z.string().min(1, 'Batch is required'),
  sourceHouseId: z.string().min(1, 'Source house is required'),
  targetHouseId: z.string().min(1, 'Target house is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
});

type AllocationFormData = z.infer<typeof allocationSchema>;
type TransferFormData = z.infer<typeof transferSchema>;

const HouseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [house, setHouse] = useState<House | null>(null);
  const [loadingAllocation, setLoadingAllocation] = useState(false);
  const [loadingTransferIn, setLoadingTransferIn] = useState(false);
  const [loadingTransferOut, setLoadingTransferOut] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openTransferIn, setOpenTransferIn] = useState(false);
  const [openTransferOut, setOpenTransferOut] = useState(false);
  const [loadingMonitor, setLoadingMonitor] = useState(false);
  const [isMonitored, setIsMonitored] = useState<boolean>(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [selectedSourceHouse, setSelectedSourceHouse] = useState<string>("");

  useEffect(() => {
    if (house?.isMonitored !== undefined) {
      setIsMonitored(house.isMonitored);
    }
  }, [house]);

  const allocationForm = useForm<AllocationFormData>({
    resolver: zodResolver(allocationSchema),
    defaultValues: {
      batchId: '',
      quantity: 0
    }
  });

  const transferInForm = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      batchId: '',
      sourceHouseId: '',
      targetHouseId: id || '',
      quantity: 0
    }
  });

  const transferOutForm = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      batchId: '',
      sourceHouseId: id || '',
      targetHouseId: '',
      quantity: 0
    }
  });

  const accessToken = localStorage.getItem('accessToken');

  const onSubmitAllocation = async (data: AllocationFormData) => {
    setLoadingAllocation(true);
    try {
      const res = await axios.post(
        'http://92.112.180.180:3000/api/v1/batch/allocation',
        {
          ...data,
          houseId: id,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      toast.success('Birds allocated successfully');
      allocationForm.reset();
      setOpenCreate(false);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || 'Failed to allocate birds');
      } else {
        toast.error('Failed to allocate birds');
      }
      console.error('Batch allocation error:', error);
    } finally {
      setLoadingAllocation(false);
    }
  };

  const onSubmitTransferIn = async (data: TransferFormData) => {
    setLoadingTransferIn(true);
    try {
      const res = await axios.post(
        'http://92.112.180.180:3000/api/v1/batch/allocation/transfer',
        {
          batchId: data.batchId,
          fromHouseId: data.sourceHouseId,
          toHouseId: data.targetHouseId,
          quantity: data.quantity
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      toast.success('Birds transferred successfully');
      transferInForm.reset();
      setOpenTransferIn(false);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || 'Failed to transfer birds');
      } else {
        toast.error('Failed to transfer birds');
      }
      console.error('Transfer error:', error);
    } finally {
      setLoadingTransferIn(false);
    }
  };

  const onSubmitTransferOut = async (data: TransferFormData) => {
    setLoadingTransferOut(true);
    try {
      const res = await axios.post(
        'http://92.112.180.180:3000/api/v1/batch/allocation/transfer',
        {
          batchId: data.batchId,
          fromHouseId: data.sourceHouseId,
          toHouseId: data.targetHouseId,
          quantity: data.quantity
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      toast.success('Birds transferred successfully');
      transferOutForm.reset();
      setOpenTransferOut(false);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || 'Failed to transfer birds');
      } else {
        toast.error('Failed to transfer birds');
      }
      console.error('Transfer error:', error);
    } finally {
      setLoadingTransferOut(false);
    }
  };

  const { data: batches = [] } = useQuery<Batch[]>({
    queryKey: ['batches'],
    queryFn: async () => {
      const res = await fetch('http://92.112.180.180:3000/api/v1/batch',
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });

      if (!res.ok) throw new Error('Failed to fetch batch data');
      return res.json();
    },
    refetchInterval: 3000,
  });

  const {
    data: allocations = [],
    isError: isAllocationsError,
    error: allocationsError,
  } = useQuery<Allocation[]>({
    queryKey: ['allocation', id],
    queryFn: async () => {
      const res = await fetch(`http://92.112.180.180:3000/api/v1/batch/allocation/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch allocation');
      return res.json();
    },
    refetchInterval: 3000,
  });

  if (isAllocationsError) {
    console.error('Error fetching allocations:', allocationsError);
  }

  const { data: houses = [] } = useQuery<House[]>({
    queryKey: ['houses'],
    queryFn: async () => {
      const res = await fetch('http://92.112.180.180:3000/api/v1/house', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch houses');
      return res.json();
    },
    refetchInterval: 2000,
  });

  useEffect(() => {
    if (houses.length && id) {
      const found = houses.find((entry) => entry.id === id);
      setHouse(found || null);
    }
  }, [houses, id]);

  const {
    data: sensorData = [],
    isLoading: isSensorDataLoading,
  } = useQuery<SensorData[]>({
    queryKey: ['sensorData', id],
    queryFn: async () => {
      const res = await fetch(`http://92.112.180.180:3000/api/v1/monitoring`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch sensor data');
      return res.json();
    },
    refetchInterval: 10000,
    enabled: isMonitored,
  });

  const onToggleMonitoring = async (checked: boolean) => {
    setLoadingMonitor(true);
    try {
      const res = await axios.patch(
        `http://92.112.180.180:3000/api/v1/house/${id}`,
        { isMonitored: checked },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      setIsMonitored(checked);
      toast.success(`Monitoring ${checked ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      toast.error('Failed to update monitoring status');
      console.error('Error updating monitoring status:', error);
    } finally {
      setLoadingMonitor(false);
    }
  };

  // Calculate occupancy statistics
  const totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.quantity, 0);
  const houseCapacity = house?.capacity ?? 1;
  const fillPercentage = Math.min(Math.floor((totalAllocated / houseCapacity) * 100), 100);
  
  // For the occupancy visualization
  const totalBoxes = 20;
  const filledBoxes = Math.floor((fillPercentage / 100) * totalBoxes);

  // Get the latest sensor readings
  const latestSensorData = sensorData[0] || null;
  
  // Helper function to determine temperature status
  const getTemperatureStatus = (temp?: number) => {
    if (!temp) return 'normal';
    if (temp < 18) return 'cold';
    if (temp > 27) return 'hot';
    return 'normal';
  };
  
  // Helper function to determine humidity status
  const getHumidityStatus = (humidity?: number) => {
    if (!humidity) return 'normal';
    if (humidity < 30) return 'low';
    if (humidity > 60) return 'high';
    return 'normal';
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'cold':
      case 'low':
      case 'high':
      case 'hot':
        return 'text-amber-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-green-600';
    }
  };

  // When batch is selected in transfer forms, filter available houses
  useEffect(() => {
    if (selectedBatchId) {
      // Find allocation for this batch that isn't in the current house
      const batchesInOtherHouses = allocations.filter(
        a => a.batchId === selectedBatchId && a.houseId !== id
      );
      
      if (batchesInOtherHouses.length > 0 && batchesInOtherHouses[0].houseId) {
        setSelectedSourceHouse(batchesInOtherHouses[0].houseId);
      }
    }
  }, [selectedBatchId, allocations, id]);

  if (!house) {
    return (
      <Layout>
        <Navbar2 />
        <div className="bg-white px-8 py-5 min-h-screen">
          <div className="flex items-center justify-center h-40">
            <p className="text-lg text-gray-500">Loading house details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Navbar2 />
      <div className="bg-white px-4 py-5 min-h-screen md:px-8">
        <div className="mx-auto space-y-6 max-w-7xl">
          {/* Header with actions */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-800">House: {house.name}</h2>
                <Badge variant={house.isMonitored ? "default" : "outline"}>
                  {house.isMonitored ? "Monitored" : "Not Monitored"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Boxes className="h-4 w-4" />
                  <span>Capacity: {house.capacity}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  <span>Type: {house.houseType}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center justify-between p-2 bg-white rounded-lg gap-3 border">
                <span className="text-sm font-medium text-gray-700">
                  Monitoring {loadingMonitor && <span className="text-xs">(updating...)</span>}
                </span>
                <Switch checked={isMonitored} onCheckedChange={onToggleMonitoring} />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="flex items-center gap-1 px-4 bg-green-700 text-sm font-semibold text-white hover:bg-green-800">
                    Allocation
                    <ChevronDown size={16} />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setOpenCreate(true)}>
                    Add New Birds
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setOpenTransferIn(true)}>
                    Transfer In
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setOpenTransferOut(true)}>
                    Transfer Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left column - House information */}
            <div className="md:col-span-4 space-y-6">
              {/* House details card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">House Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
                      <Home size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-semibold">{house.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-600">
                      <Boxes size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Capacity</p>
                      <p className="font-semibold">{house.capacity} Birds</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-600">
                      <Info size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-semibold">{house.houseType}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600">
                      <Monitor size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Monitoring Status</p>
                      <p className="font-semibold">{house.isMonitored ? 'Enabled' : 'Disabled'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Environmental monitoring card */}
              {isMonitored && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Environmental Monitoring</CardTitle>
                    <CardDescription>
                      Real-time environmental conditions in this house
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isSensorDataLoading ? (
                      <div className="text-center py-4 text-gray-500">Loading sensor data...</div>
                    ) : latestSensorData ? (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-600">
                            <Thermometer size={20} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <p className="text-sm text-gray-500">Temperature</p>
                              <p className={`text-sm font-semibold ${getStatusColor(getTemperatureStatus(latestSensorData.temperature))}`}>
                                {getTemperatureStatus(latestSensorData.temperature) === 'normal' ? 'Normal' : 
                                 getTemperatureStatus(latestSensorData.temperature) === 'hot' ? 'Too Hot' : 'Too Cold'}
                              </p>
                            </div>
                            <p className="text-xl font-semibold">{latestSensorData.temperature?.toFixed(1)}°C</p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className={`h-2 rounded-full ${
                                  getTemperatureStatus(latestSensorData.temperature) === 'normal' 
                                    ? 'bg-green-500' 
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${Math.min(Math.max((latestSensorData.temperature - 10) * 5, 0), 100)}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>10°C</span>
                              <span>20°C</span>
                              <span>30°C</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
                            <Droplet size={20} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <p className="text-sm text-gray-500">Humidity</p>
                              <p className={`text-sm font-semibold ${getStatusColor(getHumidityStatus(latestSensorData.humidity))}`}>
                                {getHumidityStatus(latestSensorData.humidity) === 'normal' ? 'Normal' : 
                                 getHumidityStatus(latestSensorData.humidity) === 'high' ? 'Too High' : 'Too Low'}
                              </p>
                            </div>
                            <p className="text-xl font-semibold">{latestSensorData.humidity?.toFixed(1)}%</p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className={`h-2 rounded-full ${
                                  getHumidityStatus(latestSensorData.humidity) === 'normal' 
                                    ? 'bg-green-500' 
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${Math.min(Math.max(latestSensorData.humidity, 0), 100)}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>0%</span>
                              <span>50%</span>
                              <span>100%</span>
                            </div>
                          </div>
                        </div>
                        
                        {latestSensorData.ammonia && (
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 text-yellow-600">
                              <AlertTriangle size={20} />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <p className="text-sm text-gray-500">Ammonia Levels</p>
                                <p className={`text-sm font-semibold ${latestSensorData.ammonia > 25 ? 'text-red-600' : 'text-green-600'}`}>
                                  {latestSensorData.ammonia > 25 ? 'Dangerous' : 'Safe'}
                                </p>
                              </div>
                              <p className="text-xl font-semibold">{latestSensorData.ammonia?.toFixed(1)} ppm</p>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div 
                                  className={`h-2 rounded-full ${
                                    latestSensorData.ammonia > 25 
                                      ? 'bg-red-500' 
                                      : latestSensorData.ammonia > 15
                                        ? 'bg-amber-500'
                                        : 'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min((latestSensorData.ammonia / 50) * 100, 100)}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>0 ppm</span>
                                <span>25 ppm</span>
                                <span>50 ppm</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-500 mt-2">
                          Last updated: {new Date(latestSensorData.createdAt).toLocaleString()}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        {isMonitored 
                          ? "No sensor data available yet" 
                          : "Enable monitoring to view environmental data"}
                      </div>
                    )}
                  </CardContent>
                  {isMonitored && (
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate(`/monitoring/${id}`)}
                      >
                        View Detailed History
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              )}
            </div>
            
            {/* Right column - Occupancy and batch information */}
            <div className="md:col-span-8 space-y-6">
              {/* Occupancy card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">House Occupancy</CardTitle>
                  <CardDescription>Current allocation status and distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col">
                    <div className="mb-3 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">Occupancy Map</h3>
                        <p className="text-sm text-gray-500">
                          {totalAllocated} birds allocated of {houseCapacity} capacity
                        </p>
                      </div>
                      
                      <Badge className={`px-3 py-1 text-sm ${fillPercentage > 90 ? 'bg-red-500' : fillPercentage > 75 ? 'bg-amber-500' : 'bg-green-500'}`}>
                        {fillPercentage}% Filled
                      </Badge>
                    </div>
                    
                    <div className="w-full bg-gray-100 p-4 rounded-lg">
                      <div className="grid grid-cols-10 gap-2">
                        {Array.from({ length: totalBoxes }).map((_, index) => (
                          <div
                            key={index}
                            className={`h-6 rounded transition-all duration-300 ease-in-out ${
                              index < filledBoxes
                                ? fillPercentage > 90 
                                  ? 'bg-red-500' 
                                  : fillPercentage > 75 
                                    ? 'bg-amber-500' 
                                    : 'bg-green-600'
                                : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${
                              fillPercentage > 90 
                                ? 'bg-red-500' 
                                : fillPercentage > 75 
                                  ? 'bg-amber-500' 
                                  : 'bg-green-600'
                            }`}
                            style={{ width: `${fillPercentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0%</span>
                          <span>25%</span>
                          <span>50%</span>
                          <span>75%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Batch allocation card */}
              <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                  <div>
                    <CardTitle className="text-xl">Batch Allocations</CardTitle>
                    <CardDescription>Birds currently allocated to this house</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setOpenCreate(true)}
                    className="text-sm"
                  >
                    Add Batch
                  </Button>
                </CardHeader>
                <CardContent>
                  {allocations.length === 0 ? (
                    <div className="text-center py-8 border border-dashed rounded-lg">
                      <Boxes className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No batches allocated to this house yet</p>
                      <Button 
                        className="mt-4 bg-green-700 hover:bg-green-800" 
                        onClick={() => setOpenCreate(true)}
                      >
                        Allocate Birds
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {allocations.map((allocation) => {
                        const batch = batches.find(b => b.id === allocation.batchId);
                        return (
                          <div 
                            key={allocation.id} 
                            className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                          >
                            <div className="mb-3 md:mb-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{batch?.name || 'Unknown Batch'}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {batch?.chickenType || 'Unknown Type'}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-500 flex flex-col sm:flex-row sm:gap-3">
                                <div className="flex items-center gap-1">
                                  <Boxes className="h-3.5 w-3.5" />
                                  <span>{allocation.quantity} birds</span>
                                </div>
                                {batch?.arrivalDate && (
                                  <>
                                    <span className="hidden sm:inline">•</span>
                                    <div>Arrived: {new Date(batch.arrivalDate).toLocaleDateString()}</div>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  transferOutForm.setValue('batchId', allocation.batchId);
                                  setSelectedBatchId(allocation.batchId);
                                  setOpenTransferOut(true);
                                }}
                              >
                                Transfer
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  navigate(`/batch/${allocation.batchId}`);
                                }}
                              >
                                View Batch
                              </Button>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" className="px-2">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    More Actions
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* DIALOGS */}
      {/* Create allocation dialog */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Allocate Birds</DialogTitle>
            <DialogDescription>
              Add birds to this house from an existing batch
            </DialogDescription>
          </DialogHeader>
          <Form {...allocationForm}>
            <form onSubmit={allocationForm.handleSubmit(onSubmitAllocation)} className="space-y-4">
              <FormField
                control={allocationForm.control}
                name="batchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a batch" />
                        </SelectTrigger>
                        <SelectContent>
                          {batches
                            ?.filter(batch => !batch.isArchived)
                            .map((batch) => (
                              <SelectItem key={batch.id} value={batch.id}>
                                {batch.name} ({batch.quantity} available)
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={allocationForm.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter number of birds" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpenCreate(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-green-700 hover:bg-green-800"
                  disabled={loadingAllocation}
                >
                  {loadingAllocation ? 'Allocating...' : 'Allocate Birds'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Transfer In dialog */}
      <Dialog open={openTransferIn} onOpenChange={setOpenTransferIn}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Birds In</DialogTitle>
            <DialogDescription>
              Transfer birds to this house from another house
            </DialogDescription>
          </DialogHeader>
          <Form {...transferInForm}>
            <form onSubmit={transferInForm.handleSubmit(onSubmitTransferIn)} className="space-y-4">
              <FormField
                control={transferInForm.control}
                name="batchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch</FormLabel>
                    <FormControl>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedBatchId(value);
                        }} 
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a batch" />
                        </SelectTrigger>
                        <SelectContent>
                          {batches
                            ?.filter(batch => !batch.isArchived)
                            .map((batch) => (
                              <SelectItem key={batch.id} value={batch.id}>
                                {batch.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={transferInForm.control}
                name="sourceHouseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source House</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value || selectedSourceHouse}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source house" />
                        </SelectTrigger>
                        <SelectContent>
                          {houses
                            ?.filter(h => h.id !== id)
                            .map((house) => (
                              <SelectItem key={house.id} value={house.id}>
                                {house.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={transferInForm.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter number of birds" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpenTransferIn(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-green-700 hover:bg-green-800"
                  disabled={loadingTransferIn}
                >
                  {loadingTransferIn ? 'Transferring...' : 'Transfer Birds'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Transfer Out dialog */}
      <Dialog open={openTransferOut} onOpenChange={setOpenTransferOut}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Birds Out</DialogTitle>
            <DialogDescription>
              Transfer birds from this house to another house
            </DialogDescription>
          </DialogHeader>
          <Form {...transferOutForm}>
            <form onSubmit={transferOutForm.handleSubmit(onSubmitTransferOut)} className="space-y-4">
              <FormField
                control={transferOutForm.control}
                name="batchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a batch" />
                        </SelectTrigger>
                        <SelectContent>
                          {allocations.map((allocation) => {
                            const batch = batches.find(b => b.id === allocation.batchId);
                            return (
                              <SelectItem key={allocation.id} value={allocation.batchId}>
                                {batch?.name || 'Unknown'} ({allocation.quantity} birds)
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={transferOutForm.control}
                name="targetHouseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target House</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select target house" />
                        </SelectTrigger>
                        <SelectContent>
                          {houses
                            ?.filter(h => h.id !== id)
                            .map((house) => (
                              <SelectItem key={house.id} value={house.id}>
                                {house.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={transferOutForm.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter number of birds" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpenTransferOut(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-green-700 hover:bg-green-800"
                  disabled={loadingTransferOut}
                >
                  {loadingTransferOut ? 'Transferring...' : 'Transfer Birds'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default HouseDetailPage;