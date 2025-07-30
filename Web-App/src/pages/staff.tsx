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
import { Staff } from "@/components/dataTable/staffColumns";
import Layout from '@/components/layout';
import Navbar2 from '@/components/navBar2';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { 
  Alert, 
  AlertDescription 
} from "@/components/ui/alert";
import { 
  Users, 
  Search, 
  UserPlus, 
  X, 
  Loader2, 
  Shield, 
  UserCog, 
  AlignJustify,
  Check,
  AlertCircle,
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

// Enhanced schema for user form with better validation
const userSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters" })
    .max(50, { message: "First name must be less than 50 characters" })
    .regex(/^[a-zA-Z\s]*$/, { message: "First name should only contain letters" }),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters" })
    .max(50, { message: "Last name must be less than 50 characters" })
    .regex(/^[a-zA-Z\s]*$/, { message: "Last name should only contain letters" }),
  role: z
    .string()
    .min(1, { message: "Role is required" }),
  email: z
    .string()
    .email({ message: "Please enter a valid email address" }),
  contact: z
    .string()
    .min(10, { message: "Contact number should be at least 10 digits" })
    .regex(/^[0-9+\-\s]*$/, { message: "Contact should contain only numbers, +, or -" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, {
      message: "Password must contain uppercase, lowercase, and a number",
    }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof userSchema>;

function StaffPage() {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [bulkAction, setBulkAction] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      role: "",
      email: "",
      contact: "",
      password: "",
      confirmPassword: ""
    },
  });

  const accessToken = localStorage.getItem('accessToken');

  // Show success message temporarily
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Show error message temporarily
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset({
        firstName: "",
        lastName: "",
        role: "",
        email: "",
        contact: "",
        password: "",
        confirmPassword: ""
      });
    }
  }, [open, form]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...submitData } = data;
      
      const res = await axios.post(
        'http://92.112.180.180:3000/api/v1/user/register',
        submitData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      setSuccessMessage(`Staff member ${data.firstName} ${data.lastName} added successfully!`);
      form.reset();
      setOpen(false);
      refetch(); // Refresh data
    } catch (error) {
      console.error(
        'Staff creation error:',
        error instanceof Error ? error.message : error
      );
      
      // Handle specific error cases
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400 && error.response.data.message === "Email already in use") {
          setErrorMessage("This email is already registered. Please use a different email.");
        } else {
          setErrorMessage(`Error adding staff: ${error.response.data.message || "Unknown error"}`);
        }
      } else {
        setErrorMessage("Network error. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;
    
    setLoading(true);
    try {
      // Assuming there's an API endpoint to delete staff
      await axios.delete(
        `http://92.112.180.180:3000/api/v1/user/${staffToDelete.id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      setSuccessMessage(`Staff member ${staffToDelete.firstName} ${staffToDelete.lastName} has been removed.`);
      setStaffToDelete(null);
      setConfirmDeleteDialog(false);
      refetch(); // Refresh data
    } catch (error) {
      console.error(
        'Staff deletion error:',
        error instanceof Error ? error.message : error
      );
      setErrorMessage("Error removing staff member. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedStaff.length === 0) return;
    
    setLoading(true);
    try {
      if (bulkAction === "delete") {
        // Implement bulk delete
        // This would need to be implemented on the backend
        setSuccessMessage(`${selectedStaff.length} staff members removed successfully.`);
      } else if (bulkAction === "changeRole") {
        // Implement bulk role change
        setSuccessMessage(`Role updated for ${selectedStaff.length} staff members.`);
      }
      
      // Reset selection
      setSelectedStaff([]);
      setBulkAction(null);
      refetch(); // Refresh data
    } catch (error) {
      console.error(
        'Bulk action error:',
        error instanceof Error ? error.message : error
      );
      setErrorMessage("Error performing bulk action. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get user data with query caching and refetching
  const { 
    data: staff = [], 
    isLoading: isStaffLoading, 
    isError: isStaffError,
    refetch 
  } = useQuery<Staff[]>({
    queryKey: ['staff'],
    queryFn: async () => {
      try {
        const res = await fetch('http://92.112.180.180:3000/api/v1/user/staff',
          {
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
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Filter staff based on tab and search query
  const filteredStaff = staff.filter(member => {
    // Filter by role (tab)
    const roleMatches = selectedTab === "all" || 
                       (selectedTab === "managers" && member.role === "Manager") || 
                       (selectedTab === "workers" && member.role === "Worker");
                       
    // Filter by search query
    const searchMatches = 
      searchQuery === "" ||
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.contact && member.contact.includes(searchQuery));
      
    return roleMatches && searchMatches;
  });

  // Statistics
  const totalStaff = staff.length || 0;
  const managerCount = staff.filter(member => member.role === "Manager").length || 0;
  const workerCount = staff.filter(member => member.role === "Worker").length || 0;

  // Enhanced columns with selection, avatar and actions
  const enhancedColumns = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            const rowIds = table.getRowModel().rows.map(row => row.original.id);
            if (value) {
              setSelectedStaff(rowIds);
            } else {
              setSelectedStaff([]);
            }
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            if (value) {
              setSelectedStaff(prev => [...prev, row.original.id]);
            } else {
              setSelectedStaff(prev => prev.filter(id => id !== row.original.id));
            }
          }}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "avatar",
      header: "",
      cell: ({ row }) => {
        const staff = row.original;
        return (
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-medium mr-2">
              {staff.firstName[0]}{staff.lastName[0]}
            </div>
          </div>
        );
      },
      enableSorting: false,
    },
    // Name column
    {
      accessorFn: row => `${row.firstName} ${row.lastName}`,
      id: "name",
      header: "Name",
      cell: ({ row }) => {
        const staff = row.original;
        return (
          <div>
            <div className="font-medium">{staff.firstName} {staff.lastName}</div>
            <div className="text-xs text-gray-500">{staff.email}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return (
          <Badge className={role === "Manager" ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : "bg-green-100 text-green-800 hover:bg-green-200"}>
            {role === "Manager" ? <Shield className="w-3 h-3 mr-1" /> : <UserCog className="w-3 h-3 mr-1" />}
            {role}
          </Badge>
        );
      },
    },
    {
      accessorKey: "contact",
      header: "Contact",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const staff = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <AlignJustify className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  // Implementation for edit action
                  console.log("Edit", staff.id);
                }}
              >
                <UserCog className="mr-2 h-4 w-4" />
                <span>Edit Details</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  // Implementation for reset password
                  console.log("Reset password", staff.id);
                }}
              >
                <Shield className="mr-2 h-4 w-4" />
                <span>Reset Password</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  setStaffToDelete(staff);
                  setConfirmDeleteDialog(true);
                }}
              >
                <X className="mr-2 h-4 w-4" />
                <span>Remove</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <Layout>
      <Navbar2 />
      <div className="w-full space-y-4 p-6">
        {/* Success and Error Messages */}
        {successMessage && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <Check className="h-4 w-4 mr-2" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
        
        {errorMessage && (
          <Alert className="border-red-200 bg-red-50 text-red-800">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Staff Management</h1>
            <p className="text-gray-500 mt-1">
              Manage your farm workers and administrators
            </p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-green-700 hover:bg-green-800">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
                <DialogDescription>
                  Add a new staff member to your farm. They will receive an email with login instructions.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select staff role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Manager">
                                <div className="flex items-center">
                                  <Shield className="w-4 h-4 mr-2" />
                                  Manager
                                </div>
                              </SelectItem>
                              <SelectItem value="Worker">
                                <div className="flex items-center">
                                  <UserCog className="w-4 h-4 mr-2" />
                                  Worker
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Enter password" 
                                {...field} 
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-1 text-gray-400"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? "Hide" : "Show"}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="Confirm password" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setOpen(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-green-700 hover:bg-green-800"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>Add Staff</>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={confirmDeleteDialog} onOpenChange={setConfirmDeleteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Staff Removal</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove this staff member? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 border rounded-lg bg-gray-50 flex items-center gap-3 my-2">
              {staffToDelete && (
                <>
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-800 font-medium">
                    {staffToDelete.firstName[0]}{staffToDelete.lastName[0]}
                  </div>
                  <div>
                    <div className="font-medium">{staffToDelete.firstName} {staffToDelete.lastName}</div>
                    <div className="text-sm text-gray-500">{staffToDelete.role}</div>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setStaffToDelete(null);
                  setConfirmDeleteDialog(false);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteStaff}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>Confirm Removal</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStaff}</div>
              <p className="text-xs text-gray-500 mt-1">
                {isStaffLoading ? "Loading..." : `${managerCount} Managers, ${workerCount} Workers`}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Managers</CardTitle>
              <Shield className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{managerCount}</div>
              <p className="text-xs text-gray-500 mt-1">
                {isStaffLoading ? "Loading..." : `${Math.round((managerCount / totalStaff) * 100) || 0}% of total staff`}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workers</CardTitle>
              <UserCog className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workerCount}</div>
              <p className="text-xs text-gray-500 mt-1">
                {isStaffLoading ? "Loading..." : `${Math.round((workerCount / totalStaff) * 100) || 0}% of total staff`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Staff List Section */}
        <Card>
          <CardHeader>
            <CardTitle>Farm Staff</CardTitle>
            <CardDescription>
              View and manage all staff members on your farm
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filter and Search Tools */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="w-full md:w-auto">
                <Tabs 
                  defaultValue="all" 
                  value={selectedTab}
                  onValueChange={setSelectedTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all" className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      All Staff
                    </TabsTrigger>
                    <TabsTrigger value="managers" className="flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Managers
                    </TabsTrigger>
                    <TabsTrigger value="workers" className="flex items-center">
                      <UserCog className="h-4 w-4 mr-2" />
                      Workers
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search staff..."
                    className="pl-8 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {selectedStaff.length > 0 && (
                  <TooltipProvider>
                    <DropdownMenu>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                              Actions ({selectedStaff.length})
                            </Button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                          Actions for {selectedStaff.length} selected staff
                        </TooltipContent>
                      </Tooltip>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setBulkAction("changeRole")}>
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setBulkAction("delete")} className="text-red-600">
                          Remove Selected
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipProvider>
                )}
              </div>
            </div>

            {/* Loading State */}
            {isStaffLoading ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-2" />
                <p className="text-gray-500">Loading staff data...</p>
              </div>
            ) : isStaffError ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                <p className="text-gray-700 font-medium">Failed to load staff members</p>
                <p className="text-gray-500 max-w-md mt-1">
                  There was an error retrieving your staff data. Please try refreshing the page.
                </p>
                <Button onClick={() => refetch()} className="mt-4">
                  Retry
                </Button>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Users className="h-10 w-10 text-gray-400 mb-2" />
                {searchQuery ? (
                  <>
                    <p className="text-gray-700 font-medium">No staff members found</p>
                    <p className="text-gray-500 max-w-md mt-1">
                      No staff members match your search for "{searchQuery}". Try a different search term.
                    </p>
                    <Button onClick={() => setSearchQuery("")} variant="outline" className="mt-4">
                      Clear Search
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-700 font-medium">No staff members yet</p>
                    <p className="text-gray-500 max-w-md mt-1">
                      Start by adding your first staff member using the "Add Staff" button.
                    </p>
                    <Button onClick={() => setOpen(true)} className="mt-4 bg-green-700 hover:bg-green-800">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add First Staff Member
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <>
                {/* Staff Data Table */}
                <DataTable columns={enhancedColumns} data={filteredStaff} />
                
                {/* Additional Staff Information */}
                {filteredStaff.length > 0 && (
                  <div className="flex items-center justify-between mt-6 text-sm text-gray-500 border-t pt-4">
                    <p>
                      Showing {filteredStaff.length} of {totalStaff} staff members
                      {searchQuery && ` matching "${searchQuery}"`}
                    </p>
                    <div className="flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      <p>Use bulk actions to manage multiple staff members at once</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Staff Permissions Explainer */}
        <Card>
          <CardHeader>
            <CardTitle>Staff Roles & Permissions</CardTitle>
            <CardDescription>
              Understanding the different roles and their access levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-lg text-gray-800">Managers</h3>
                  <p className="text-gray-600 mt-1">
                    Managers have full access to all farm areas including staff management, financial data, and system settings.
                  </p>
                  <ul className="mt-3 space-y-1">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Add, edit and remove staff</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Manage production and inventory</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Access financial reports and settings</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Configure system settings</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                  <UserCog className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-lg text-gray-800">Workers</h3>
                  <p className="text-gray-600 mt-1">
                    Workers have limited access focused on day-to-day operations like production recording and stock management.
                  </p>
                  <ul className="mt-3 space-y-1">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Record daily production data</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Use diagnostic tools and record health data</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Update inventory and stock levels</span>
                    </li>
                    <li className="flex items-center">
                      <X className="h-4 w-4 text-red-500 mr-2" />
                      <span className="text-sm">Cannot access financial data or admin settings</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default StaffPage;