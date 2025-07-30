import { useState, useEffect } from 'react';
import axios from 'axios';
import { DataTable } from '@/components/dataTable/dataTable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { House, columns } from "@/components/dataTable/houseColumns";
import Layout from '@/components/layout';
import Navbar2 from '@/components/navBar2';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, PlusCircle, Boxes, AlertTriangle, Edit, Trash, MonitorSmartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from 'react-router-dom';

const houseSchema = z.object({
  name: z.string().min(1, "House name is required"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  houseType: z.string().min(1, "House type is required"),
  isMonitored: z.boolean().optional().default(false),
});

type FormData = z.infer<typeof houseSchema>;

function HousesPage() {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [editMode, setEditMode] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(houseSchema),
    defaultValues: {
      name: "",
      capacity: 0,
      houseType: "",
      isMonitored: false,
    },
  });

  // Reset form and selected house when dialog closes
  useEffect(() => {
    if (!open) {
      setEditMode(false);
      setSelectedHouse(null);
      form.reset({
        name: "",
        capacity: 0,
        houseType: "",
        isMonitored: false,
      });
    }
  }, [open, form]);

  // Populate form when editing
  useEffect(() => {
    if (selectedHouse && editMode) {
      form.reset({
        name: selectedHouse.name,
        capacity: selectedHouse.capacity,
        houseType: selectedHouse.houseType,
        isMonitored: selectedHouse.isMonitored || false,
      });
    }
  }, [selectedHouse, editMode, form]);

  const accessToken = localStorage.getItem('accessToken');

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      if (editMode && selectedHouse) {
        // Update existing house
        const res = await axios.patch(
          `http://92.112.180.180:3000/api/v1/house/${selectedHouse.id}`,
          data,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
        console.log('House Updated:', res.data);
      } else {
        // Create new house
        const res = await axios.post(
          'http://92.112.180.180:3000/api/v1/house',
          data,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
        console.log('New House Added:', res.data);
      }
      
      form.reset();
      setOpen(false);
      setEditMode(false);
      setSelectedHouse(null);
      refetch(); // Refresh data after adding/updating house
    } catch (error) {
      console.error(
        editMode ? 'House update error:' : 'House creation error:',
        error instanceof Error ? error.message : error
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to handle deleting a house
  const handleDeleteHouse = async () => {
    if (!selectedHouse) return;
    
    setLoading(true);
    try {
      await axios.delete(
        `http://92.112.180.180:3000/api/v1/house/${selectedHouse.id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      
      setDeleteDialogOpen(false);
      setSelectedHouse(null);
      refetch(); // Refresh data after deleting
    } catch (error) {
      console.error(
        'House deletion error:',
        error instanceof Error ? error.message : error
      );
    } finally {
      setLoading(false);
    }
  };

  const { data: houses = [], isLoading, isError, refetch } = useQuery<House[]>({
    queryKey: ['houses'],
    queryFn: async () => {
      try {
        const res = await fetch('http://92.112.180.180:3000/api/v1/house',
          {
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
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Calculate statistics
  const totalCapacity = houses?.reduce((sum, house) => sum + house.capacity, 0) || 0;
  const totalHouses = houses?.length || 0;
  const monitoredHouses = houses?.filter(house => house.isMonitored)?.length || 0;
  
  // Count by house type
  const houseTypes = houses?.reduce((types, house) => {
    if (!types[house.houseType]) {
      types[house.houseType] = 0;
    }
    types[house.houseType] += 1;
    return types;
  }, {} as Record<string, number>) || {};

  // Filter houses based on selected type
  const filteredHouses = houses.filter(house => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "monitored") return house.isMonitored;
    if (selectedFilter === "unmonitored") return !house.isMonitored;
    return house.houseType === selectedFilter;
  });

  // Handle row click to navigate to house details
  const handleRowClick = (houseId: string) => {
    navigate(`/house/${houseId}`);
  };

  // Create custom columns with edit and delete actions
  const enhancedColumns: ColumnDef<House>[] = [
    ...columns.slice(0, -1), // Use all original columns except the last one (actions)
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: any }) => {
        const house = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              onClick={(e) => { 
                e.stopPropagation(); 
                setEditMode(true);
                setSelectedHouse(house);
                setOpen(true);
              }}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button 
              variant="ghost" 
              onClick={(e) => { 
                e.stopPropagation(); 
                setSelectedHouse(house);
                setDeleteDialogOpen(true);
              }}
              className="h-8 w-8 p-0"
            >
              <Trash className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
            <Button 
              variant="ghost" 
              onClick={(e) => { 
                e.stopPropagation(); 
                navigate(`/house/${house.id}`);
              }}
              className="h-8 w-8 p-0"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="sr-only">Details</span>
            </Button>
          </div>
        );
      },
    }
  ];

  return (
    <Layout>
      <Navbar2 />
      <div className="w-full space-y-4">
        <div className="rounded-lg bg-white px-8 py-5">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Poultry Houses</h2>
              <p className="text-gray-500">Manage and monitor your poultry housing units</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger>
                <button className="rounded-full bg-green-700 px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-green-800 flex items-center gap-2">
                  <Home size={16} />
                  Add New House
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editMode ? "Edit House" : "Add New House"}</DialogTitle> 
                  <DialogDescription>
                    {editMode 
                      ? "Update the details for this housing unit." 
                      : "Fill in the details below to add a new housing unit to your farm."}
                  </DialogDescription>
                </DialogHeader>
                <section className="py-4">
                  <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>House Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter house name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="capacity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Capacity</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="Enter maximum capacity" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="houseType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>House Type</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select house type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Caged">Caged</SelectItem>
                                  <SelectItem value="Deep Litter">Deep Litter</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="isMonitored"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Monitoring Status</FormLabel>
                              <div className="text-xs text-muted-foreground">
                                Enable environmental monitoring for this house
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <DialogFooter className="mt-6">
                      <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-green-700 hover:bg-green-800">
                        {loading ? 'Processing...' : editMode ? 'Update House' : 'Add House'}
                      </Button>
                    </DialogFooter>
                  </form>
                  </Form>
                </section>
              </DialogContent>
            </Dialog>
          </div>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Delete House</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the house and all associated data.
                </DialogDescription>
              </DialogHeader>
              <div className="p-6 border rounded-lg flex items-center gap-3 bg-red-50">
                <Trash className="h-5 w-5 text-red-600" />
                <div>
                  <h4 className="font-medium">{selectedHouse?.name}</h4>
                  <p className="text-sm text-gray-500">
                    Capacity: {selectedHouse?.capacity} - Type: {selectedHouse?.houseType}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleDeleteHouse}
                  variant="destructive"
                >
                  {loading ? 'Processing...' : 'Delete House'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Key statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Houses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Home className="h-5 w-5 text-gray-700 mr-2" />
                  <span className="text-2xl font-bold">{totalHouses}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Capacity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Boxes className="h-5 w-5 text-gray-700 mr-2" />
                  <span className="text-2xl font-bold">{totalCapacity}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Monitored Houses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <MonitorSmartphone className="h-5 w-5 text-gray-700 mr-2" />
                  <span className="text-2xl font-bold">{monitoredHouses}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">House Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(houseTypes).map(([type, count]) => (
                    <Badge key={type} variant="outline">
                      {type}: {count}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button 
              variant={selectedFilter === "all" ? "default" : "outline"} 
              onClick={() => setSelectedFilter("all")}
              className={selectedFilter === "all" ? "bg-green-700 hover:bg-green-800" : ""}
            >
              All Houses
            </Button>
            <Button 
              variant={selectedFilter === "monitored" ? "default" : "outline"} 
              onClick={() => setSelectedFilter("monitored")}
              className={selectedFilter === "monitored" ? "bg-green-700 hover:bg-green-800" : ""}
            >
              Monitored
            </Button>
            <Button 
              variant={selectedFilter === "unmonitored" ? "default" : "outline"} 
              onClick={() => setSelectedFilter("unmonitored")}
              className={selectedFilter === "unmonitored" ? "bg-green-700 hover:bg-green-800" : ""}
            >
              Unmonitored
            </Button>
            {Object.keys(houseTypes).map(type => (
              <Button 
                key={type}
                variant={selectedFilter === type ? "default" : "outline"} 
                onClick={() => setSelectedFilter(type)}
                className={selectedFilter === type ? "bg-green-700 hover:bg-green-800" : ""}
              >
                {type}
              </Button>
            ))}
          </div>

          {/* Data Table */}
          <div className="container mx-auto mt-4">
            {isLoading ? (
              <div className="text-center py-8">Loading house data...</div>
            ) : isError ? (
              <div className="bg-red-50 p-4 rounded-md flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
                <p className="text-red-500">Error loading house data. Please try again later.</p>
              </div>
            ) : filteredHouses.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-md">
                <Home className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No houses found matching your filter criteria.</p>
                <Button 
                  className="mt-4 bg-green-700 hover:bg-green-800"
                  onClick={() => setOpen(true)}
                >
                  Add First House
                </Button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border">
                <DataTable
                  columns={enhancedColumns}
                  data={filteredHouses}
                  onRowClick={(row) => handleRowClick(row.id)}
                />
              </div>
            )}
          </div>

          {/* House Management Tips */}
          <div className="mt-8 bg-blue-50 p-4 rounded-lg">
            <h3 className="text-md font-semibold text-blue-900 mb-2">House Management Tips</h3>
            <ul className="list-disc pl-5 text-blue-800 text-sm">
              <li>Keep house monitoring enabled to track environmental conditions</li>
              <li>Regularly clean and maintain housing units for optimal bird health</li>
              <li>Ensure proper ventilation and temperature control</li>
              <li>Monitor stocking density to prevent overcrowding</li>
            </ul>
          </div>
          
          {/* Simple helper message */}
          <div className="mt-6 text-sm text-gray-500 flex items-center gap-2">
            <div className="bg-gray-200 p-2 rounded-full">?</div>
            <p>Click on any house row to view detailed information and monitor environmental conditions.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default HousesPage;