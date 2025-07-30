import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/layout';
import Navbar2 from '@/components/navBar2';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
    Calendar as CalendarIcon,
    Check,
    CheckCircle,
    Clock,
    Edit,
    Trash
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from '@tanstack/react-query';
import { formatDistance } from 'date-fns';
import { Batch } from "@/components/dataTable/batchColumns";

// Schema for the immunization form
const immunizationSchema = z.object({
    batchId: z.string().min(1, "Batch is required"),
    vaccineName: z.string().min(1, "Vaccine name is required"),
    scheduledStartDate: z.string().min(1, "Date is required"),
    notes: z.string().optional(),
});

type FormData = z.infer<typeof immunizationSchema>;

// Interface for the Immunization type
interface Immunization {
    id: string;
    batchId: string;
    vaccineName: string;
    scheduledStartDate: string;
    status: "pending" | "completed" | "cancelled";
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

function ImmunizationPage() {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [immunizations, setImmunizations] = useState<Immunization[]>([]);
    const [selectedImmunization, setSelectedImmunization] = useState<Immunization | null>(null);
    const [editMode, setEditMode] = useState(false);
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const user = storedUser ? JSON.parse(storedUser) : null;

    const form = useForm<FormData>({
        resolver: zodResolver(immunizationSchema),
        defaultValues: {
            batchId: "",
            vaccineName: "",
            scheduledStartDate: "",
            notes: "",
        },
    });

    const accessToken = localStorage.getItem('accessToken');

    useEffect(() => {
        // If a success or error message is set, clear it after 3 seconds
        if (successMessage || errorMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
                setErrorMessage(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, errorMessage]);

    useEffect(() => {
        // Reset form and state when dialog is closed
        if (!open) {
            form.reset();
            setEditMode(false);
            setSelectedImmunization(null);
        }
    }, [open, form]);

    useEffect(() => {
        // Set form values when editing an immunization
        if (editMode && selectedImmunization) {
            form.setValue("batchId", selectedImmunization.batchId);
            form.setValue("vaccineName", selectedImmunization.vaccineName);
            form.setValue("scheduledStartDate",
                new Date(selectedImmunization.scheduledStartDate).toISOString().split('T')[0]);
            form.setValue("notes", selectedImmunization.notes || "");
        }
    }, [editMode, selectedImmunization, form]);

    // Mock data for immunizations (replace with actual API call)
    useEffect(() => {
        // This would be replaced with your actual API call
        const mockImmunizations: Immunization[] = [
            {
                id: "1",
                batchId: "batch1",
                vaccineName: "Newcastle Disease Vaccine",
                scheduledStartDate: new Date(2025, 4, 15).toISOString(),
                status: "pending",
                notes: "First vaccination for the new batch",
                createdAt: new Date(2025, 4, 1).toISOString(),
                updatedAt: new Date(2025, 4, 1).toISOString(),
            },
            {
                id: "2",
                batchId: "batch2",
                vaccineName: "Infectious Bronchitis Vaccine",
                scheduledStartDate: new Date(2025, 4, 17).toISOString(),
                status: "completed",
                notes: "Second dose for batch 2",
                createdAt: new Date(2025, 4, 2).toISOString(),
                updatedAt: new Date(2025, 4, 16).toISOString(),
            },
            {
                id: "3",
                batchId: "batch1",
                vaccineName: "Marek's Disease Vaccine",
                scheduledStartDate: new Date(2025, 4, 10).toISOString(),
                status: "cancelled",
                notes: "Cancelled due to supplier issues",
                createdAt: new Date(2025, 4, 3).toISOString(),
                updatedAt: new Date(2025, 4, 8).toISOString(),
            },
            {
                id: "4",
                batchId: "batch3",
                vaccineName: "Fowl Pox Vaccine",
                scheduledStartDate: new Date(2025, 4, 20).toISOString(),
                status: "pending",
                notes: "First vaccination for batch 3",
                createdAt: new Date(2025, 4, 5).toISOString(),
                updatedAt: new Date(2025, 4, 5).toISOString(),
            },
        ];
        setImmunizations(mockImmunizations);
    }, []);

    const { data: batches = [] } = useQuery<Batch[]>({
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
                return res.json();
            } catch (err) {
                console.error('Failed to fetch batch data:', err);
                throw err;
            }
        },
        refetchInterval: 3000,
    });

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            if (editMode && selectedImmunization) {
                // Mock update (would be replaced with API call)
                const updatedImmunizations = immunizations.map(imm =>
                    imm.id === selectedImmunization.id
                        ? {
                            ...imm,
                            batchId: data.batchId,
                            vaccineName: data.vaccineName,
                            scheduledStartDate: new Date(data.scheduledStartDate).toISOString(),
                            notes: data.notes,
                            updatedAt: new Date().toISOString()
                        }
                        : imm
                );
                setImmunizations(updatedImmunizations);
                setSuccessMessage("Immunization schedule updated successfully!");
            } else {
                // Mock create (would be replaced with API call)
                const newImmunization: Immunization = {
                    id: String(immunizations.length + 1),
                    batchId: data.batchId,
                    vaccineName: data.vaccineName,
                    scheduledStartDate: new Date(data.scheduledStartDate).toISOString(),
                    status: "pending",
                    notes: data.notes,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                setImmunizations([...immunizations, newImmunization]);
                setSuccessMessage("Immunization schedule created successfully!");
            }
            form.reset();
            setOpen(false);
        } catch (error) {
            setErrorMessage(
                'Error saving immunization schedule: ' +
                (error instanceof Error ? error.message : String(error))
            );
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status);
    };

    const handleUpdateStatus = (id: string, newStatus: "completed" | "cancelled" | "pending") => {
        const updatedImmunizations = immunizations.map(imm =>
            imm.id === id
                ? { ...imm, status: newStatus, updatedAt: new Date().toISOString() }
                : imm
        );
        setImmunizations(updatedImmunizations);
        setSuccessMessage(`Immunization status updated to ${newStatus}!`);
    };

    const handleEdit = (immunization: Immunization) => {
        setSelectedImmunization(immunization);
        setEditMode(true);
        setOpen(true);
    };

    const handleDelete = (id: string) => {
        const updatedImmunizations = immunizations.filter(imm => imm.id !== id);
        setImmunizations(updatedImmunizations);
        setSuccessMessage("Immunization schedule deleted successfully!");
    };

    // Filter immunizations based on selected date and status
    const filteredImmunizations = immunizations.filter(imm => {
        const immunizationDate = new Date(imm.scheduledStartDate);
        const selectedDate = date ? new Date(date) : new Date();

        const dateMatches =
            immunizationDate.getDate() === selectedDate.getDate() &&
            immunizationDate.getMonth() === selectedDate.getMonth() &&
            immunizationDate.getFullYear() === selectedDate.getFullYear();

        const statusMatches = selectedStatus === "all" || imm.status === selectedStatus;

        return dateMatches && statusMatches;
    });

    // Get all dates with immunizations for calendar highlighting
    const immunizationDates = immunizations.map(imm => {
        const date = new Date(imm.scheduledStartDate);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    });

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500 hover:bg-green-600';
            case 'pending':
                return 'bg-yellow-500 hover:bg-yellow-600';
            case 'cancelled':
                return 'bg-red-500 hover:bg-red-600';
            default:
                return 'bg-gray-500 hover:bg-gray-600';
        }
    };

    // Get batch name from batch ID
    const getBatchName = (batchId: string) => {
        const batch = batches.find(b => b.id === batchId);
        return batch ? batch.name : batchId;
    };

    return (
        <Layout>
            <Navbar2 />
            <div className="w-full space-y-4 p-8">
                {/* Success and Error Messages */}
                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                        <span className="block sm:inline">{successMessage}</span>
                    </div>
                )}
                {errorMessage && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        <span className="block sm:inline">{errorMessage}</span>
                    </div>
                )}

                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">Immunization Schedule</h2>
                    {user?.role !== "Worker" && (
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger>
                                <button className="rounded-full bg-green-700 px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-green-800">
                                    {editMode ? "Edit Schedule" : "Add Schedule"}
                                </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-xl">
                                <DialogHeader>
                                    <DialogTitle>{editMode ? "Edit Immunization Schedule" : "Add Immunization Schedule"}</DialogTitle>
                                    <DialogDescription>
                                        {editMode
                                            ? "Update the details of the immunization schedule below."
                                            : "Fill in the details below to add a new immunization schedule."}
                                    </DialogDescription>
                                </DialogHeader>
                                <section className="p-2">
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="batchId"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Batch</FormLabel>
                                                        <FormControl>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select batch" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {batches.map((batch) => (
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
                                                control={form.control}
                                                name="vaccineName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Vaccine Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Enter vaccine name" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="scheduledStartDate"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Scheduled Date</FormLabel>
                                                        <FormControl>
                                                            <Input type="date" {...field} />
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
                                                            <Input placeholder="Add notes" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="submit" className="w-full mt-4 bg-green-700 hover:bg-green-800 col-span-1 md:col-span-2">
                                                {loading
                                                    ? editMode ? "Updating..." : "Adding..."
                                                    : editMode ? "Update Schedule" : "Add Schedule"}
                                            </Button>
                                        </form>
                                    </Form>
                                </section>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Calendar Section */}
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle className="text-lg">Calendar</CardTitle>
                            <CardDescription>Select a date to view scheduled immunizations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border"
                                modifiers={{
                                    immunization: immunizationDates,
                                }}
                                modifiersClassNames={{
                                    immunization: "bg-green-100 text-green-800 font-bold border-green-500 border",
                                }}
                            />
                        </CardContent>
                        <CardFooter className="flex justify-center gap-2">
                            <Badge variant="outline" className="border-green-500 bg-green-100 text-green-800">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                Has Immunization
                            </Badge>
                        </CardFooter>
                    </Card>

                    {/* Schedule List Section */}
                    <Card className="col-span-1 md:col-span-2">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">
                                    {date ? (
                                        <span className="flex items-center gap-2">
                                            <CalendarIcon className="h-5 w-5" />
                                            Immunizations for {date.toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    ) : (
                                        "Today's Immunizations"
                                    )}
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Select value={selectedStatus} onValueChange={handleStatusChange}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue placeholder="Filter status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {filteredImmunizations.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="flex justify-center mb-4">
                                        <CalendarIcon className="h-12 w-12" />
                                    </div>
                                    <p className="text-lg font-medium">No immunizations scheduled for this date</p>
                                    <p className="mt-1">Select another date or add a new schedule</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredImmunizations.map((immunization) => (
                                        <div key={immunization.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                                            <div className="flex justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Badge className={getStatusBadgeColor(immunization.status)}>
                                                        {immunization.status}
                                                    </Badge>
                                                    <h3 className="font-semibold">{immunization.vaccineName}</h3>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(immunization)}
                                                        className="h-8 w-8"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(immunization.id)}
                                                        className="h-8 w-8 text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Batch: {getBatchName(immunization.batchId)}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                <Clock className="h-4 w-4 inline mr-1" />
                                                Scheduled: {new Date(immunization.scheduledStartDate).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                            {immunization.notes && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Notes: {immunization.notes}
                                                </p>
                                            )}
                                            <div className="mt-3 pt-3 border-t flex gap-2">
                                                {immunization.status !== "completed" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-green-600 border-green-600 hover:bg-green-50"
                                                        onClick={() => handleUpdateStatus(immunization.id, "completed")}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Mark Complete
                                                    </Button>
                                                )}
                                                {immunization.status !== "cancelled" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-600 border-red-600 hover:bg-red-50"
                                                        onClick={() => handleUpdateStatus(immunization.id, "cancelled")}
                                                    >
                                                        Cancel
                                                    </Button>
                                                )}
                                                {immunization.status !== "pending" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                                                        onClick={() => handleUpdateStatus(immunization.id, "pending")}
                                                    >
                                                        Mark Pending
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Upcoming Immunizations Section */}
                    <Card className="col-span-1 md:col-span-3">
                        <CardHeader>
                            <CardTitle className="text-lg">Upcoming Immunizations</CardTitle>
                            <CardDescription>Next 7 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {immunizations
                                    .filter(imm => {
                                        const today = new Date();
                                        const immunizationDate = new Date(imm.scheduledStartDate);
                                        const sevenDaysLater = new Date();
                                        sevenDaysLater.setDate(today.getDate() + 7);

                                        return imm.status === "pending" &&
                                            immunizationDate >= today &&
                                            immunizationDate <= sevenDaysLater;
                                    })
                                    .sort((a, b) => new Date(a.scheduledStartDate).getTime() - new Date(b.scheduledStartDate).getTime())
                                    .slice(0, 3)
                                    .map((immunization) => (
                                        <div key={immunization.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-semibold">{immunization.vaccineName}</h3>
                                                <Badge className="bg-yellow-500">
                                                    {formatDistance(new Date(immunization.scheduledStartDate), new Date(), { addSuffix: true })}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                Batch: {getBatchName(immunization.batchId)}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Date: {new Date(immunization.scheduledStartDate).toLocaleDateString()}
                                            </p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-3 w-full text-green-600 border-green-600 hover:bg-green-50"
                                                onClick={() => handleUpdateStatus(immunization.id, "completed")}
                                            >
                                                <Check className="h-4 w-4 mr-1" />
                                                Mark Complete
                                            </Button>
                                        </div>
                                    ))}
                                {immunizations.filter(imm => {
                                    const today = new Date();
                                    const immunizationDate = new Date(imm.scheduledStartDate);
                                    const sevenDaysLater = new Date();
                                    sevenDaysLater.setDate(today.getDate() + 7);

                                    return imm.status === "pending" &&
                                        immunizationDate >= today &&
                                        immunizationDate <= sevenDaysLater;
                                }).length === 0 && (
                                        <div className="col-span-3 text-center py-6 text-gray-500">
                                            <p>No upcoming immunizations in the next 7 days</p>
                                        </div>
                                    )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}

export default ImmunizationPage;