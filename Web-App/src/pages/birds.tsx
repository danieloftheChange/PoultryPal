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
import { Batch } from "@/components/dataTable/batchColumns";
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
import { Feather, Boxes, AlertTriangle, Edit, Archive, CheckCircle, TrendingDown, Skull, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";

const batchSchema = z.object({
  name: z.string().min(1, "Batch name is required"),
  arrivalDate: z.string().min(1, "Arrival date is required"),
  ageAtArrival: z.coerce.number().min(0, "Age at arrival must be at least 0"),
  chickenType: z.string().min(1, "Chicken type is required"),
  originalCount: z.coerce.number().min(1, "Original count must be at least 1"),
  supplier: z.string().min(1, "Supplier is required"),
  isArchived: z.boolean().optional(),
});

type FormData = z.infer<typeof batchSchema>;

// Enhanced Batch interface with calculated fields
interface EnhancedBatch extends Batch {
  currentCount: number;
}

// Bird Count Update Dialog Component
const BirdCountUpdateDialog = ({ 
  batch, 
  open, 
  onOpenChange, 
  onSuccess 
}: {
  batch: EnhancedBatch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const countForm = useForm({
    defaultValues: {
      dead: 0,
      culled: 0,
      offlaid: 0,
      reason: '',
      notes: '',
    },
  });

  const accessToken = localStorage.getItem('accessToken');

  const onSubmitCount = async (data: any) => {
    if (!batch) return;

    setLoading(true);
    setError(null);

    try {
      await axios.patch(
        `http://92.112.180.180:3000/api/v1/batch/${batch.id}/counts`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      countForm.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error updating bird counts:', error);
      setError('Failed to update bird counts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Bird Counts</DialogTitle>
          <DialogDescription>
            Record changes in bird numbers for {batch?.name}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
            {error}
          </div>
        )}

        <Form {...countForm}>
          <form onSubmit={countForm.handleSubmit(onSubmitCount)} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={countForm.control}
                name="dead"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dead</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={countForm.control}
                name="culled"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Culled</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={countForm.control}
                name="offlaid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Offlaid</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-green-700 hover:bg-green-800">
                {loading ? 'Updating...' : 'Update Counts'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// Helper function to safely calculate current count
const calculateCurrentCount = (batch: any): number => {
  const originalCount = batch.originalCount || 0;
  const dead = batch.dead || 0;
  const culled = batch.culled || 0;
  const offlaid = batch.offlaid || 0;
  return Math.max(0, originalCount - (dead + culled + offlaid));
};

// Helper function to safely format numbers
const safeToLocaleString = (value: any): string => {
  const num = Number(value);
  return isNaN(num) ? '0' : num.toLocaleString();
};

function BatchPage() {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [editMode, setEditMode] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<EnhancedBatch | null>(null);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [countUpdateDialogOpen, setCountUpdateDialogOpen] = useState(false);
  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = storedUser ? JSON.parse(storedUser) : null;

  const form = useForm<FormData>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      name: "",
      arrivalDate: "",
      ageAtArrival: 0,
      chickenType: "",
      originalCount: 0,
      supplier: "",
      isArchived: false,
    },
  });

  // Reset form and selected batch when dialog closes
  useEffect(() => {
    if (!open) {
      setEditMode(false);
      setSelectedBatch(null);
      form.reset({
        name: "",
        arrivalDate: "",
        ageAtArrival: 0,
        chickenType: "",
        originalCount: 0,
        supplier: "",
        isArchived: false,
      });
    }
  }, [open, form]);

  // Populate form when editing
  useEffect(() => {
    if (selectedBatch && editMode) {
      form.reset({
        name: selectedBatch.name,
        arrivalDate: new Date(selectedBatch.arrivalDate).toISOString().split('T')[0],
        ageAtArrival: selectedBatch.ageAtArrival,
        chickenType: selectedBatch.chickenType,
        originalCount: selectedBatch.originalCount,
        supplier: selectedBatch.supplier,
        isArchived: selectedBatch.isArchived || false,
      });
    }
  }, [selectedBatch, editMode, form]);

  const accessToken = localStorage.getItem('accessToken');

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      if (editMode && selectedBatch) {
        // Update existing batch
        const res = await axios.patch(
          `http://92.112.180.180:3000/api/v1/batch/${selectedBatch.id}`,
          data,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
        console.log('Batch Updated:', res.data);
      } else {
        // Create new batch
        const res = await axios.post(
          'http://92.112.180.180:3000/api/v1/batch',
          data,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
        console.log('New Batch Added:', res.data);
      }
      
      form.reset();
      setOpen(false);
      setEditMode(false);
      setSelectedBatch(null);
      refetch();
    } catch (error) {
      console.error(
        editMode ? 'Batch update error:' : 'Batch creation error:',
        error instanceof Error ? error.message : error
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to handle archiving a batch
  const handleArchiveBatch = async () => {
    if (!selectedBatch) return;
    
    setLoading(true);
    try {
      await axios.patch(
        `http://92.112.180.180:3000/api/v1/batch/${selectedBatch.id}`,
        { isArchived: !selectedBatch.isArchived },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      
      setArchiveDialogOpen(false);
      setSelectedBatch(null);
      refetch();
    } catch (error) {
      console.error(
        'Batch archive error:',
        error instanceof Error ? error.message : error
      );
    } finally {
      setLoading(false);
    }
  };

  const { data: batches = [], isLoading, isError, refetch } = useQuery<EnhancedBatch[]>({
    queryKey: ['batches'],
    queryFn: async () => {
      try {
        const res = await fetch('http://92.112.180.180:3000/api/v1/batch',
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          });

        if (!res.ok) throw new Error('Failed to fetch batch data');
        const data = await res.json();
        
        // Calculate currentCount for each batch with safe handling
        return data.map((batch: any): EnhancedBatch => ({
          ...batch,
          currentCount: calculateCurrentCount(batch),
          // Ensure all required fields exist with default values
          dead: batch.dead || 0,
          culled: batch.culled || 0,
          offlaid: batch.offlaid || 0,
          originalCount: batch.originalCount || 0,
        }));
      } catch (err) {
        console.error('Failed to fetch batch data:', err);
        throw err;
      }
    },
    refetchInterval: 30000,
  });

  // Calculate statistics with safe handling
  const totalBirds = batches?.reduce((sum, batch) => sum + (batch.currentCount || 0), 0) || 0;
  const originalTotalBirds = batches?.reduce((sum, batch) => sum + (batch.originalCount || 0), 0) || 0;
  const activeBatches = batches?.filter(batch => !batch.isArchived)?.length || 0;
  const archivedBatches = batches?.filter(batch => batch.isArchived)?.length || 0;
  const totalDeaths = batches?.reduce((sum, batch) => sum + (batch.dead || 0), 0) || 0;
  const totalCulled = batches?.reduce((sum, batch) => sum + (batch.culled || 0), 0) || 0;
  const totalOfflaid = batches?.reduce((sum, batch) => sum + (batch.offlaid || 0), 0) || 0;
  const totalLoss = totalDeaths + totalCulled + totalOfflaid;
  const mortalityRate = originalTotalBirds > 0 ? ((totalDeaths / originalTotalBirds) * 100) : 0;
  const survivalRate = originalTotalBirds > 0 ? ((totalBirds / originalTotalBirds) * 100) : 0;
  
  // Types of chickens
  const chickenTypes = batches?.reduce((types, batch) => {
    if (!types[batch.chickenType]) {
      types[batch.chickenType] = 0;
    }
    types[batch.chickenType] += 1;
    return types;
  }, {} as Record<string, number>) || {};

  // Filter batches based on selected type
  const filteredBatches = batches.filter(batch => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "active") return !batch.isArchived;
    if (selectedFilter === "archived") return batch.isArchived;
    return batch.chickenType === selectedFilter;
  });

  // Create custom columns with enhanced functionality and safe handling
  const enhancedColumns: ColumnDef<EnhancedBatch>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "name",
      accessorFn: (row) => row.name,
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Batch Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "arrivalDate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Arrival Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("arrivalDate"));
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      accessorKey: "chickenType",
      header: "Bird Type",
    },
    {
      accessorKey: "originalCount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Original Count
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("originalCount") as number;
        return <div className="font-medium">{safeToLocaleString(value)}</div>;
      },
    },
    {
      id: "currentCount",
      accessorKey: "currentCount",
      header: "Current Count",
      cell: ({ row }) => {
        const batch = row.original;
        const currentCount = batch.currentCount || 0;
        const originalCount = batch.originalCount || 1; // Prevent division by zero
        const lossCount = (batch.dead || 0) + (batch.culled || 0) + (batch.offlaid || 0);
        const survivalPercentage = originalCount > 0 ? ((currentCount / originalCount) * 100) : 0;
        
        let badgeColor = "bg-green-100 text-green-800";
        if (survivalPercentage < 50) {
          badgeColor = "bg-red-100 text-red-800";
        } else if (survivalPercentage < 80) {
          badgeColor = "bg-yellow-100 text-yellow-800";
        }
        
        return (
          <div className="flex flex-col gap-1">
            <span className="font-medium">{safeToLocaleString(currentCount)}</span>
            {lossCount > 0 && (
              <Badge variant="outline" className={`text-xs ${badgeColor}`}>
                {survivalPercentage.toFixed(1)}% remaining
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const batch = row.original;
        return (
          <div className="flex flex-col gap-1 text-xs">
            <div className="text-red-600">Dead: {batch.dead || 0}</div>
            <div className="text-orange-600">Culled: {batch.culled || 0}</div>
            <div className="text-blue-600">Offlaid: {batch.offlaid || 0}</div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const batch = row.original;
        return (
          <div className="flex items-center gap-2">
            {user?.role !== "Worker" && (
              <>
                <Button 
                  variant="ghost" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setEditMode(true);
                    setSelectedBatch(batch);
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
                    setSelectedBatch(batch);
                    setArchiveDialogOpen(true);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Archive className="h-4 w-4" />
                  <span className="sr-only">Archive</span>
                </Button>
              </>
            )}
            <Button 
              variant="ghost" 
              onClick={(e) => { 
                e.stopPropagation(); 
                setSelectedBatch(batch);
                setCountUpdateDialogOpen(true);
              }}
              className="h-8 w-8 p-0"
            >
              <TrendingDown className="h-4 w-4" />
              <span className="sr-only">Update Counts</span>
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
              <h2 className="text-2xl font-semibold mb-2">Bird Batches</h2>
              <p className="text-gray-500">Manage and monitor all your poultry batches</p>
            </div>
            {user?.role !== "Worker" && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-full bg-green-700 px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-green-800 flex items-center gap-2">
                    <Boxes size={16} />
                    Add New Batch
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editMode ? "Edit Batch" : "Add New Batch"}</DialogTitle> 
                    <DialogDescription>
                      {editMode 
                        ? "Update the details for this batch of birds." 
                        : "Fill in the details below to add a new batch of birds to your farm."}
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
                              <FormLabel>Batch Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter batch name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="arrivalDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Arrival Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="ageAtArrival"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Age at Arrival (days)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="Enter age at arrival" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="chickenType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bird Type</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select bird type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Broiler">Broiler</SelectItem>
                                    <SelectItem value="Layer">Layer</SelectItem>
                                    <SelectItem value="Dual Purpose">Dual Purpose</SelectItem>
                                    <SelectItem value="Breeder">Breeder</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="originalCount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Original Count</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="Enter original count" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="supplier"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Supplier</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter supplier" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {editMode && (
                          <FormField
                            control={form.control}
                            name="isArchived"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                  <FormLabel>Archived Status</FormLabel>
                                  <div className="text-xs text-muted-foreground">
                                    Mark this batch as archived if it's no longer active
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
                        )}
                      </div>
                      <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-green-700 hover:bg-green-800" disabled={loading}>
                          {loading ? 'Processing...' : editMode ? 'Update Batch' : 'Add Batch'}
                        </Button>
                      </DialogFooter>
                    </form>
                    </Form>
                  </section>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Archive Confirmation Dialog */}
          <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{selectedBatch?.isArchived ? "Unarchive Batch" : "Archive Batch"}</DialogTitle>
                <DialogDescription>
                  {selectedBatch?.isArchived 
                    ? "This will make the batch active again. Are you sure you want to unarchive this batch?"
                    : "This will hide the batch from active records. You can unarchive it later if needed."}
                </DialogDescription>
              </DialogHeader>
              <div className="p-6 border rounded-lg flex items-center gap-3 bg-gray-50">
                {selectedBatch?.isArchived ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Archive className="h-5 w-5 text-amber-600" />
                )}
                <div>
                  <h4 className="font-medium">{selectedBatch?.name}</h4>
                  <p className="text-sm text-gray-500">
                    {safeToLocaleString(selectedBatch?.currentCount)} current / {safeToLocaleString(selectedBatch?.originalCount)} original birds - {selectedBatch?.chickenType}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setArchiveDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleArchiveBatch}
                  variant="default"
                  className={selectedBatch?.isArchived ? "bg-green-700 hover:bg-green-800" : "bg-amber-600 hover:bg-amber-700"}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : selectedBatch?.isArchived ? 'Unarchive Batch' : 'Archive Batch'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Bird Count Update Dialog */}
          <BirdCountUpdateDialog
            batch={selectedBatch}
            open={countUpdateDialogOpen}
            onOpenChange={setCountUpdateDialogOpen}
            onSuccess={() => {
              refetch();
              setSelectedBatch(null);
            }}
          />

          {/* Enhanced statistics with 6 cards */}
          {user?.role !== "Worker" && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Current Birds</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Feather className="h-5 w-5 text-green-700 mr-2" />
                    <span className="text-2xl font-bold">{totalBirds?.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    of {originalTotalBirds?.toLocaleString()} original
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Survival Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Heart className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-2xl font-bold">{survivalRate.toFixed(1)}%</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {totalBirds} birds surviving
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Deaths</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Skull className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-2xl font-bold">{totalDeaths?.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {mortalityRate.toFixed(1)}% mortality rate
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Loss</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <TrendingDown className="h-5 w-5 text-orange-600 mr-2" />
                    <span className="text-2xl font-bold">{totalLoss?.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Deaths + Culled + Offlaid
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Active Batches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Boxes className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-2xl font-bold">{activeBatches}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {archivedBatches} archived
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Bird Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(chickenTypes).map(([type, count]) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}: {count}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button 
              variant={selectedFilter === "all" ? "default" : "outline"} 
              onClick={() => setSelectedFilter("all")}
              className={selectedFilter === "all" ? "bg-green-700 hover:bg-green-800" : ""}
            >
              All Batches
            </Button>
            <Button 
              variant={selectedFilter === "active" ? "default" : "outline"} 
              onClick={() => setSelectedFilter("active")}
              className={selectedFilter === "active" ? "bg-green-700 hover:bg-green-800" : ""}
            >
              Active
            </Button>
            <Button 
              variant={selectedFilter === "archived" ? "default" : "outline"} 
              onClick={() => setSelectedFilter("archived")}
              className={selectedFilter === "archived" ? "bg-green-700 hover:bg-green-800" : ""}
            >
              Archived
            </Button>
            {Object.keys(chickenTypes).map(type => (
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
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading batch data...</p>
              </div>
            ) : isError ? (
              <div className="bg-red-50 p-4 rounded-md flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
                <p className="text-red-500">Error loading batch data. Please try again later.</p>
              </div>
            ) : filteredBatches.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-md">
                <Boxes className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No batches found matching your filter criteria.</p>
                {user?.role !== "Worker" && (
                  <Button 
                    className="mt-4 bg-green-700 hover:bg-green-800"
                    onClick={() => setOpen(true)}
                  >
                    Add First Batch
                  </Button>
                )}
              </div>
            ) : (
              <DataTable columns={enhancedColumns} data={filteredBatches} />
            )}
          </div>

          {/* Batch Management Tips */}
          <div className="mt-8 bg-blue-50 p-4 rounded-lg">
            <h3 className="text-md font-semibold text-blue-900 mb-2">Batch Management Tips</h3>
            <ul className="list-disc pl-5 text-blue-800 text-sm">
              <li>Regularly update bird counts to maintain accurate records</li>
              <li>Monitor mortality rates closely - increases may indicate health issues</li>
              <li>Archive inactive batches to keep your dashboard organized</li>
              <li>Use batch filters to quickly find the information you need</li>
              <li>Track age progression to plan feeding and healthcare schedules</li>
            </ul>
          </div>
          
          {/* Helper messages */}
          <div className="mt-6 text-sm text-gray-500 flex items-center gap-2">
            <div className="bg-gray-200 p-2 rounded-full">?</div>
            <p>Need help with batch management? Contact your administrator or check the user manual.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default BatchPage;