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
import * as XLSX from "xlsx";
import { Production } from "@/components/dataTable/productionColumns";
import Layout from '@/components/layout';
import Navbar2 from '@/components/navBar2';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from '@tanstack/react-query';
import { Batch } from '@/components/dataTable/batchColumns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ArrowDown,
  ArrowUpDown,
  ArrowUp,
  BarChart,
  Check,
  Egg,
  FileText,
  Filter,
  Loader2,
  Plus,
  Skull,
  X,
  Package,
  AlertTriangle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// Replace your existing recharts import (around line 30-40) with this:
import {
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  LineChart,  // Add this
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';
import { format, subDays, differenceInDays } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Feather, TrendingDown, TrendingUp } from 'lucide-react';

// Enhanced schema for the production form with tray-based entry
const productionSchema = z.object({
  batchId: z.string().min(1, "Batch is required"),
  date: z.string().min(1, "Date is required"),
  numberOfDeadBirds: z.coerce.number().min(0, "Dead Birds must be at least 0"),
  entryMode: z.enum(['trays', 'eggs']).default('trays'),
  // Tray-based fields
  numberOfTrays: z.coerce.number().min(0, "Number of trays must be at least 0").optional(),
  extraEggs: z.coerce.number().min(0, "Extra eggs must be at least 0").max(29, "Extra eggs cannot exceed 29").optional(),
  // Direct egg entry field
  numberOfEggsCollected: z.coerce.number().min(0, "Eggs collected must be at least 0").optional(),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.entryMode === 'trays') {
    return data.numberOfTrays !== undefined;
  } else {
    return data.numberOfEggsCollected !== undefined;
  }
}, {
  message: "Please enter either trays or eggs based on selected entry mode",
  path: ["numberOfTrays"]
});

type FormData = z.infer<typeof productionSchema>;

// Enhanced Production interface
interface EnhancedProduction extends Production {
  batchName?: string;
  batchType?: string;
  notes?: string;
  id: string;
  numberOfTrays?: number;
  extraEggs?: number;
  productionRate?: number;
  batchCurrentCount?: number;
}

// Date range type for filtering
type DateRange = '7days' | '30days' | '90days' | 'all';

// Constants
const EGGS_PER_TRAY = 30;

function ProductionPage() {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState<EnhancedProduction | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('30days');
  const [filter, setFilter] = useState<string>('all');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [entryMode, setEntryMode] = useState<'trays' | 'eggs'>('trays');
  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = storedUser ? JSON.parse(storedUser) : null;

  const form = useForm<FormData>({
    resolver: zodResolver(productionSchema),
    defaultValues: {
      batchId: "",
      date: new Date().toISOString().split('T')[0],
      numberOfDeadBirds: 0,
      entryMode: 'trays',
      numberOfTrays: 0,
      extraEggs: 0,
      numberOfEggsCollected: 0,
      notes: "",
    }
  });

  // Query for batches
  const { data: batches = [] } = useQuery<Batch[]>({
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

  // Watch form values for real-time calculations
  const watchedTrays = form.watch('numberOfTrays') || 0;
  const watchedExtraEggs = form.watch('extraEggs') || 0;
  const watchedEggs = form.watch('numberOfEggsCollected') || 0;
  const watchedBatchId = form.watch('batchId');
  const watchedEntryMode = form.watch('entryMode');

  // Calculate total eggs from trays
  const calculatedEggsFromTrays = (watchedTrays * EGGS_PER_TRAY) + watchedExtraEggs;

  // Calculate trays from total eggs
  const calculatedTraysFromEggs = {
    trays: Math.floor(watchedEggs / EGGS_PER_TRAY),
    extraEggs: watchedEggs % EGGS_PER_TRAY
  };

  // Get current batch for validation
  const currentBatch = batches.find(batch => batch.id === watchedBatchId);
  const currentBirdCount = currentBatch?.currentCount || 0;
  const totalEggs = watchedEntryMode === 'trays' ? calculatedEggsFromTrays : watchedEggs;
  const isEggCountValid = totalEggs <= currentBirdCount;
  const productionRate = currentBirdCount > 0 ? ((totalEggs / currentBirdCount) * 100) : 0;

  // Set form values when editing a production record
  useEffect(() => {
    if (editMode && selectedProduction) {
      const hasTraysData = selectedProduction.numberOfTrays !== undefined;
      const mode = hasTraysData ? 'trays' : 'eggs';

      form.reset({
        batchId: selectedProduction.batchId,
        date: new Date(selectedProduction.date).toISOString().split('T')[0],
        numberOfDeadBirds: selectedProduction.numberOfDeadBirds,
        entryMode: mode,
        numberOfTrays: selectedProduction.numberOfTrays || 0,
        extraEggs: selectedProduction.extraEggs || 0,
        numberOfEggsCollected: selectedProduction.numberOfEggsCollected,
        notes: selectedProduction.notes || "",
      });
      setEntryMode(mode);
    }
  }, [editMode, selectedProduction, form]);

  // Reset form when dialog is closed
  useEffect(() => {
    if (!open) {
      setEditMode(false);
      setSelectedProduction(null);
      setEntryMode('trays');
      form.reset({
        batchId: "",
        date: new Date().toISOString().split('T')[0],
        numberOfDeadBirds: 0,
        entryMode: 'trays',
        numberOfTrays: 0,
        extraEggs: 0,
        numberOfEggsCollected: 0,
        notes: "",
      });
    }
  }, [open, form]);

  // Update entry mode when form value changes
  useEffect(() => {
    setEntryMode(watchedEntryMode);
  }, [watchedEntryMode]);

  // Clear success/error messages after 3 seconds
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const accessToken = localStorage.getItem('accessToken');

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      // Prepare payload based on entry mode
      const payload: any = {
        batchId: data.batchId,
        date: data.date,
        numberOfDeadBirds: data.numberOfDeadBirds,
        notes: data.notes,
      };

      if (data.entryMode === 'trays') {
        payload.numberOfTrays = data.numberOfTrays || 0;
        payload.extraEggs = data.extraEggs || 0;
      } else {
        payload.numberOfEggsCollected = data.numberOfEggsCollected || 0;
      }

      if (editMode && selectedProduction) {
        // Update existing production record
        await axios.patch(
          `http://92.112.180.180:3000/api/v1/production/${selectedProduction.id}`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`
            }
          }
        );

        setSuccessMessage('Production record updated successfully');
      } else {
        // Create new production record
        await axios.post(
          'http://92.112.180.180:3000/api/v1/production',
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`
            }
          }
        );

        setSuccessMessage('Production record added successfully');
      }

      form.reset();
      setOpen(false);
      refetch();
    } catch (error) {
      console.error(
        editMode ? 'Production update error:' : 'Production creation error:',
        error instanceof Error ? error.message : error
      );

      setErrorMessage(
        (axios.isAxiosError(error) && error.response?.data?.message) ||
        'Failed to save production record'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduction) return;

    setLoading(true);
    try {
      await axios.delete(
        `http://92.112.180.180:3000/api/v1/production/${selectedProduction.id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      setSuccessMessage('Production record deleted successfully');
      setDeleteDialogOpen(false);
      refetch();
    } catch (error) {
      setErrorMessage(
        (axios.isAxiosError(error) && error.response?.data?.message) ||
        'Failed to delete production record'
      );
      console.error('Production deletion error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Query for production data
  const {
    data: production = [],
    isLoading: isProductionLoading,
    refetch
  } = useQuery<EnhancedProduction[]>({
    queryKey: ['production'],
    queryFn: async () => {
      const res = await fetch('http://92.112.180.180:3000/api/v1/production', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch production data');
      return res.json();
    },
    refetchInterval: 60000, // Refetch every minute
  });

  // Enhanced production records with batch details
  const enhancedProduction: EnhancedProduction[] = production.map(prod => {
    const batch = batches.find(b => b.id === prod.batchId);
    return {
      ...prod,
      batchName: batch?.name || 'Unknown Batch',
      batchType: batch?.chickenType || 'Unknown Type',
      batchCurrentCount: batch?.currentCount || 0,
    };
  });

  // Calculate date from range
  const getDateFromRange = (range: DateRange): Date => {
    const today = new Date();
    switch (range) {
      case '7days':
        return subDays(today, 7);
      case '30days':
        return subDays(today, 30);
      case '90days':
        return subDays(today, 90);
      case 'all':
      default:
        return new Date(0); // Beginning of time
    }
  };

  // Filter production records by date range and batch
  const filteredProduction = enhancedProduction.filter(prod => {
    const prodDate = new Date(prod.date);
    const rangeDate = getDateFromRange(dateRange);

    const dateInRange = prodDate >= rangeDate;
    const batchMatches = filter === 'all' || prod.batchId === filter;

    return dateInRange && batchMatches;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const prepareBirdCountChartData = () => {
    // Group production records by date to calculate cumulative bird count changes
    const groupedByDate = filteredProduction.reduce((acc, record) => {
      const date = format(new Date(record.date), 'MMM dd');
      if (!acc[date]) {
        acc[date] = {
          date,
          totalDeaths: 0,
          recordCount: 0
        };
      }
      acc[date].totalDeaths += record.numberOfDeadBirds;
      acc[date].recordCount += 1;
      return acc;
    }, {} as Record<string, { date: string; totalDeaths: number; recordCount: number }>);

    // Calculate cumulative bird count over time
    const chartDataArray = Object.values(groupedByDate).sort((a, b) => {
      const dateA = new Date(a.date + ' 2024'); // Add year for proper sorting
      const dateB = new Date(b.date + ' 2024');
      return dateA.getTime() - dateB.getTime();
    });

    // Get initial bird count from selected batches
    let initialBirdCount = 0;
    if (filter === 'all') {
      initialBirdCount = batches
        .filter(batch => !batch.isArchived)
        .reduce((sum, batch) => sum + (batch.originalCount || 0), 0);
    } else {
      const selectedBatch = batches.find(batch => batch.id === filter);
      initialBirdCount = selectedBatch?.originalCount || 0;
    }

    // Calculate running bird count
    let cumulativeDeaths = 0;
    return chartDataArray.map(item => {
      cumulativeDeaths += item.totalDeaths;
      const currentBirdCount = Math.max(0, initialBirdCount - cumulativeDeaths);

      return {
        date: item.date,
        birdCount: currentBirdCount,
        dailyDeaths: item.totalDeaths,
        cumulativeDeaths,
        mortalityRate: initialBirdCount > 0 ? ((cumulativeDeaths / initialBirdCount) * 100) : 0
      };
    });
  };

  // Calculate bird count trend (add this after the existing stats calculation)
  const birdCountData = prepareBirdCountChartData();
  const birdCountTrend = (() => {
    if (birdCountData.length < 2) return 'stable';

    const firstHalf = birdCountData.slice(0, Math.floor(birdCountData.length / 2));
    const secondHalf = birdCountData.slice(Math.floor(birdCountData.length / 2));

    const firstAvg = firstHalf.reduce((sum, item) => sum + item.birdCount, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, item) => sum + item.birdCount, 0) / secondHalf.length;

    if (secondAvg < firstAvg * 0.95) return 'decreasing';
    if (secondAvg > firstAvg * 1.05) return 'increasing';
    return 'stable';
  })();

  // Calculate production statistics
  const calcProductionStats = () => {
    if (filteredProduction.length === 0) {
      return {
        totalEggs: 0,
        totalTrays: 0,
        avgEggsPerDay: 0,
        avgTraysPerDay: 0,
        totalMortality: 0,
        mortalityRate: 0,
        avgProductionRate: 0,
        trends: {
          eggs: 'stable',
          mortality: 'stable'
        }
      };
    }

    const totalEggs = filteredProduction.reduce((sum, record) => sum + (record.numberOfEggsCollected || 0), 0);
    const totalTrays = filteredProduction.reduce((sum, record) => sum + (record.numberOfTrays || 0), 0);
    const totalMortality = filteredProduction.reduce((sum, record) => sum + record.numberOfDeadBirds, 0);

    // Calculate days in range
    const oldest = new Date(Math.min(...filteredProduction.map(p => new Date(p.date).getTime())));
    const newest = new Date(Math.max(...filteredProduction.map(p => new Date(p.date).getTime())));
    const daysDiff = Math.max(1, differenceInDays(newest, oldest) + 1);

    // Calculate averages
    const avgEggsPerDay = Math.round(totalEggs / daysDiff);
    const avgTraysPerDay = Math.round((totalTrays * 10) / daysDiff) / 10;

    // Calculate total birds for mortality rate
    const totalBirds = batches.reduce((sum, batch) => sum + (batch.currentCount || 0), 0);
    const mortalityRate = totalBirds > 0 ? ((totalMortality / totalBirds) * 100) : 0;

    // Calculate average production rate
    const validRates = filteredProduction.filter(p => p.productionRate !== undefined && p.productionRate > 0);
    const avgProductionRate = validRates.length > 0
      ? validRates.reduce((sum, p) => sum + (p.productionRate || 0), 0) / validRates.length
      : 0;

    // Calculate trends by comparing first half to second half of the period
    const sortedByDate = [...filteredProduction].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const midpoint = Math.floor(sortedByDate.length / 2);
    const firstHalf = sortedByDate.slice(0, midpoint);
    const secondHalf = sortedByDate.slice(midpoint);

    const firstHalfEggs = firstHalf.reduce((sum, record) => sum + (record.numberOfEggsCollected || 0), 0);
    const secondHalfEggs = secondHalf.reduce((sum, record) => sum + (record.numberOfEggsCollected || 0), 0);

    const firstHalfMortality = firstHalf.reduce((sum, record) => sum + record.numberOfDeadBirds, 0);
    const secondHalfMortality = secondHalf.reduce((sum, record) => sum + record.numberOfDeadBirds, 0);

    const eggsTrend =
      secondHalfEggs > firstHalfEggs * 1.1 ? 'increasing' :
        secondHalfEggs < firstHalfEggs * 0.9 ? 'decreasing' : 'stable';

    const mortalityTrend =
      secondHalfMortality > firstHalfMortality * 1.1 ? 'increasing' :
        secondHalfMortality < firstHalfMortality * 0.9 ? 'decreasing' : 'stable';

    return {
      totalEggs,
      totalTrays,
      avgEggsPerDay,
      avgTraysPerDay,
      totalMortality,
      mortalityRate,
      avgProductionRate,
      trends: {
        eggs: eggsTrend,
        mortality: mortalityTrend
      }
    };
  };

  const stats = calcProductionStats();

  // Prepare chart data
  const prepareChartData = () => {
    // Group by date
    const groupedByDate = filteredProduction.reduce((acc, record) => {
      const date = format(new Date(record.date), 'MMM dd');
      if (!acc[date]) {
        acc[date] = {
          date,
          eggsCollected: 0,
          traysCollected: 0,
          deadBirds: 0
        };
      }
      acc[date].eggsCollected += record.numberOfEggsCollected || 0;
      acc[date].traysCollected += record.numberOfTrays || 0;
      acc[date].deadBirds += record.numberOfDeadBirds;
      return acc;
    }, {} as Record<string, { date: string; eggsCollected: number; traysCollected: number; deadBirds: number }>);

    // Convert to array and sort by date
    return Object.values(groupedByDate).sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  };

  const chartData = prepareChartData();

  // Create enhanced columns with batch name and actions
  const enhancedColumns = [
    {
      id: "select",
      header: ({ table }: any) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value: any) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }: any) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: any) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "batchName",
      header: ({ column }: any) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Batch
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }: any) => {
        const record = row.original as EnhancedProduction;
        return (
          <div className="flex items-center gap-2">
            <span>{record.batchName}</span>
            {isNewRecord(record.createdAt) && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                New
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "date",
      header: ({ column }: any) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }: any) => {
        const rawDate = row.getValue("date") as string;
        const formattedDate = new Date(rawDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        return <span>{formattedDate}</span>;
      },
    },
    {
      id: "production",
      header: ({ column }: any) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Production
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }: any) => {
        const record = row.original as EnhancedProduction;
        const eggsCollected = record.numberOfEggsCollected || 0;
        const traysCollected = record.numberOfTrays || 0;
        const extraEggs = record.extraEggs || 0;
        const productionRate = record.productionRate || 0;

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              <span className="font-medium">{traysCollected} trays</span>
              {extraEggs > 0 && (
                <span className="text-sm text-gray-500">+ {extraEggs}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Egg className="h-4 w-4 text-green-600" />
              <span className="text-sm">{eggsCollected.toLocaleString()} eggs</span>
            </div>
            {typeof productionRate === "number" && productionRate > 0 && (
              <Badge variant="outline" className="text-xs">
                {productionRate.toFixed(1)}% rate
              </Badge>
            )}
          </div>
        );
      },
      accessorFn: (row: any) => row.numberOfEggsCollected,
    },
    {
      accessorKey: "numberOfDeadBirds",
      header: ({ column }: any) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Dead Birds
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }: any) => {
        const value = row.getValue("numberOfDeadBirds") as number;
        return <span className="font-medium">{value}</span>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const record = row.original as EnhancedProduction;

        return (
          <div className="flex items-center justify-end gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedProduction(record);
                      setEditMode(true);
                      setOpen(true);
                    }}
                  >
                    <FileText className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit Record</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {user?.role !== "Worker" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedProduction(record);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <X className="h-4 w-4 text-red-500" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete Record</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );
      },
    },
  ];

  const handleExport = () => {
    setIsExporting(true);

    try {
      const exportData = filteredProduction.map((item) => ({
        Batch: item.batchName,
        Date: new Date(item.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        "Trays Collected": item.numberOfTrays || 0,
        "Extra Eggs": item.extraEggs || 0,
        "Total Eggs": item.numberOfEggsCollected,
        "Production Rate (%)": item.productionRate?.toFixed(1) || "0.0",
        "Dead Birds": item.numberOfDeadBirds,
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Production Data");

      XLSX.writeFile(workbook, "production_data.xlsx");
    } finally {
      // Ensures loading state resets even if an error occurs
      setTimeout(() => setIsExporting(false), 1000);
    }
  };

  const isNewRecord = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffInMinutes = (now.getTime() - createdDate.getTime()) / 1000 / 60;
    return diffInMinutes < 1440;
  };

  return (
    <Layout>
      <Navbar2 />
      <div className="w-full p-4 md:p-8 space-y-6">
        {/* Header with title and add button */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Production Records</h2>
            <p className="text-gray-500">
              Track and manage egg production and mortality data
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-700 hover:bg-green-800">
                <Plus className="mr-2 h-4 w-4" />
                Add Production Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editMode ? "Edit Production Record" : "Add Production Record"}
                </DialogTitle>
                <DialogDescription>
                  {editMode
                    ? "Update the details of the production record below."
                    : "Enter daily production data including egg collection and mortality."}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="batchId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Batch</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select batch" />
                            </SelectTrigger>
                            <SelectContent>
                              {batches
                                .filter(batch => !batch.isArchived)
                                .map((batch) => (
                                  <SelectItem key={batch.id} value={batch.id}>
                                    {batch.name} ({batch.chickenType}) - {batch.currentCount} birds
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
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Entry Mode Selection */}
                  <FormField
                    control={form.control}
                    name="entryMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entry Mode</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="trays"
                                value="trays"
                                checked={field.value === 'trays'}
                                onChange={() => field.onChange('trays')}
                                className="h-4 w-4 text-green-600"
                              />
                              <label htmlFor="trays" className="text-sm font-medium">
                                Trays + Extra Eggs
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="eggs"
                                value="eggs"
                                checked={field.value === 'eggs'}
                                onChange={() => field.onChange('eggs')}
                                className="h-4 w-4 text-green-600"
                              />
                              <label htmlFor="eggs" className="text-sm font-medium">
                                Total Eggs
                              </label>
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Choose how you want to enter egg production data
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Current batch info display */}
                  {currentBatch && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          {currentBatch.name} - {currentBatch.currentCount} birds
                        </span>
                      </div>
                      <div className="text-xs text-blue-600">
                        Maximum possible eggs: {currentBatch.currentCount}
                      </div>
                    </div>
                  )}

                  {/* Tray-based entry */}
                  {entryMode === 'trays' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="numberOfTrays"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Number of Trays</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  {...field}
                                  min={0}
                                />
                              </FormControl>
                              <FormDescription>
                                Each tray holds {EGGS_PER_TRAY} eggs
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="extraEggs"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Extra Eggs</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  {...field}
                                  min={0}
                                  max={29}
                                />
                              </FormControl>
                              <FormDescription>
                                Loose eggs (0-29)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Calculation display for tray mode */}
                      <div className="bg-gray-50 border rounded-md p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Calculated Total:</span>
                          <span className="font-medium">
                            {calculatedEggsFromTrays} eggs
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
                          <span>Production Rate:</span>
                          <span>
                            {typeof productionRate === "number"
                              ? `${productionRate.toFixed(1)}%`
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Direct egg entry */}
                  {entryMode === 'eggs' && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="numberOfEggsCollected"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Eggs Collected</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0"
                                {...field}
                                min={0}
                                max={currentBirdCount}
                              />
                            </FormControl>
                            <FormDescription>
                              Total number of eggs collected
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Calculation display for egg mode */}
                      <div className="bg-gray-50 border rounded-md p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Equivalent Trays:</span>
                          <span className="font-medium">
                            {calculatedTraysFromEggs.trays} trays + {calculatedTraysFromEggs.extraEggs} eggs
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
                          <span>Production Rate:</span>
                          <span>
                            {typeof productionRate === "number"
                              ? `${productionRate.toFixed(1)}%`
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Validation warning */}
                  {!isEggCountValid && totalEggs > 0 && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        Egg count ({totalEggs}) cannot exceed current bird count ({currentBirdCount})
                      </AlertDescription>
                    </Alert>
                  )}

                  <FormField
                    control={form.control}
                    name="numberOfDeadBirds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dead Birds</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            min={0}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any observations or notes"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional: Record any unusual observations or issues
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || !isEggCountValid}
                      className="bg-green-700 hover:bg-green-800"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {editMode ? "Updating..." : "Saving..."}
                        </>
                      ) : (
                        <>{editMode ? "Update Record" : "Save Record"}</>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 flex items-center">
            <Check className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 flex items-center">
            <X className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Production Overview Cards */}
        {user?.role !== "Worker" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Eggs Collected
                </CardTitle>
                <Egg className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEggs.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.avgEggsPerDay.toLocaleString()} eggs per day on average
                </p>
                <div className="mt-3 flex items-center">
                  {stats.trends.eggs === 'increasing' ? (
                    <div className="flex items-center text-green-600 text-xs">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      <span>Increasing trend</span>
                    </div>
                  ) : stats.trends.eggs === 'decreasing' ? (
                    <div className="flex items-center text-amber-600 text-xs">
                      <ArrowDown className="h-3 w-3 mr-1" />
                      <span>Decreasing trend</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-blue-600 text-xs">
                      <span>Stable production</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Trays Collected
                </CardTitle>
                <Package className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTrays.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.avgTraysPerDay} trays per day on average
                </p>
                <div className="text-xs text-blue-600 mt-2">
                  {EGGS_PER_TRAY} eggs per tray
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Production Rate
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgProductionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Eggs per bird ratio
                </p>
                <div className="mt-3">
                  <Badge variant={stats.avgProductionRate > 80 ? "default" : stats.avgProductionRate > 60 ? "secondary" : "destructive"}>
                    {stats.avgProductionRate > 80 ? "Excellent" : stats.avgProductionRate > 60 ? "Good" : "Needs Attention"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Mortality
                </CardTitle>
                <Skull className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMortality.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.mortalityRate.toFixed(2)}% mortality rate
                </p>
                <div className="mt-3 flex items-center">
                  {stats.trends.mortality === 'increasing' ? (
                    <div className="flex items-center text-red-600 text-xs">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      <span>Increasing mortality (concerning)</span>
                    </div>
                  ) : stats.trends.mortality === 'decreasing' ? (
                    <div className="flex items-center text-green-600 text-xs">
                      <ArrowDown className="h-3 w-3 mr-1" />
                      <span>Decreasing mortality (good)</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-blue-600 text-xs">
                      <span>Stable mortality</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Filter & Export
                </CardTitle>
                <Filter className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Select
                  value={dateRange}
                  onValueChange={(value) => setDateRange(value as DateRange)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filter}
                  onValueChange={setFilter}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Batches</SelectItem>
                    {batches
                      .filter(batch => !batch.isArchived)
                      .map(batch => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  size="sm"
                  className="w-full"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    "Export Data"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts Section */}
        {user?.role !== "Worker" && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Egg Production Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Egg Production Trend</CardTitle>
                <CardDescription>
                  Daily egg collection over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="eggGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickMargin={10}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => value.toLocaleString()}
                      />
                      <RechartsTooltip
                        formatter={(value: any) => [value.toLocaleString(), "Eggs"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="eggsCollected"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#eggGradient)"
                        activeDot={{ r: 8 }}
                        name="Eggs Collected"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No data available for the selected period</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tray Production Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Tray Collection Trend</CardTitle>
                <CardDescription>
                  Daily tray collection over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={chartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickMargin={10}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                      />
                      <RechartsTooltip
                        formatter={(value: any) => [`${value}`, "Trays"]}
                      />
                      <Bar
                        dataKey="traysCollected"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                        name="Trays Collected"
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No data available for the selected period</p>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Mortality Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Mortality Trend</CardTitle>
                <CardDescription>
                  Daily bird mortality over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={chartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickMargin={10}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                      />
                      <RechartsTooltip
                        formatter={(value: any) => [`${value}`, "Birds"]}
                      />
                      <Bar
                        dataKey="deadBirds"
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                        name="Dead Birds"
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No data available for the selected period</p>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Bird Count Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Feather className="h-4 w-4 text-blue-600" />
                  Bird Population Trend
                  <div className="ml-auto flex items-center gap-1 text-sm">
                    {birdCountTrend === 'increasing' ? (
                      <div className="flex items-center text-green-600">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>Population Growing</span>
                      </div>
                    ) : birdCountTrend === 'decreasing' ? (
                      <div className="flex items-center text-red-600">
                        <TrendingDown className="h-4 w-4 mr-1" />
                        <span>Population Declining</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-blue-600">
                        <span>Population Stable</span>
                      </div>
                    )}
                  </div>
                </CardTitle>
                <CardDescription>
                  Track changes in bird population due to mortality over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {birdCountData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={birdCountData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="birdCountGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickMargin={10}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => value.toLocaleString()}
                      />
                      <RechartsTooltip
                        formatter={(value: any, name: string) => [
                          name === 'birdCount' ? value.toLocaleString() : value,
                          name === 'birdCount' ? 'Bird Count' :
                            name === 'dailyDeaths' ? 'Daily Deaths' :
                              name === 'mortalityRate' ? 'Mortality Rate (%)' : name
                        ]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="birdCount"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fill="url(#birdCountGradient)"
                        activeDot={{ r: 8 }}
                        name="Bird Count"
                      />
                      <Line
                        type="monotone"
                        dataKey="dailyDeaths"
                        stroke="#ef4444"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Daily Deaths"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No data available for the selected period</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Data Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle>Production Records</CardTitle>
              <div className="text-sm text-gray-500">
                {filteredProduction.length} records found
              </div>
            </div>
            <CardDescription>
              Showing production data {filter === 'all'
                ? 'from all batches'
                : `for ${batches.find(b => b.id === filter)?.name || 'selected batch'}`}
              {dateRange === 'all'
                ? ''
                : ` over the last ${dateRange.replace('days', ' days')}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isProductionLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-green-700" />
                <span className="ml-2">Loading production data...</span>
              </div>
            ) : filteredProduction.length === 0 ? (
              <div className="text-center py-8">
                <BarChart className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-lg font-semibold text-gray-900">No production records found</h3>
                <p className="mt-1 text-gray-500">
                  {filter !== 'all'
                    ? 'Try selecting a different batch or time period'
                    : 'Start recording your daily production data'}
                </p>
                <Button
                  onClick={() => setOpen(true)}
                  className="mt-4 bg-green-700 hover:bg-green-800"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Record
                </Button>
              </div>
            ) : (
              <DataTable columns={enhancedColumns} data={filteredProduction} />
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Production Record</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this production record? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 border rounded-lg bg-red-50 mb-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <Skull className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {selectedProduction?.batchName || 'Unknown Batch'}
                  </p>
                  <p className="text-xs text-gray-600">
                    Date: {selectedProduction ? new Date(selectedProduction.date).toLocaleDateString() : ''}
                  </p>
                  <p className="text-xs text-gray-600">
                    {selectedProduction?.numberOfTrays ? (
                      <>Trays: {selectedProduction.numberOfTrays} + {selectedProduction.extraEggs || 0} extra</>
                    ) : (
                      <>Eggs: {selectedProduction?.numberOfEggsCollected || 0}</>
                    )} | Mortality: {selectedProduction?.numberOfDeadBirds || 0}
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Record'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Production Tips Card */}
        <Card className="bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Production Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-blue-700 text-sm">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Use tray-based entry for more accurate and faster data collection (1 tray = {EGGS_PER_TRAY} eggs)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Monitor production rates closely - a healthy flock should maintain 70-90% production rate</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Record production data daily for accurate tracking and better analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Monitor mortality rates closely - sudden increases may indicate health issues</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Use the notes field to record environmental conditions or changes in feed</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Regular data entry helps identify trends and optimize production</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default ProductionPage;