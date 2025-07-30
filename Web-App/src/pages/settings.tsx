import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

import Layout from '@/components/layout';
import Navbar2 from '@/components/navBar2';
import { 
  BellIcon, 
  AtSignIcon,
  EyeOffIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
  TextIcon,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";

// Form schemas
const farmProfileSchema = z.object({
  name: z.string().min(2, "Farm name must be at least 2 characters"),
  location: z.string().min(2, "Location is required"),
  includeSatellite: z.boolean().optional(),
});

const userProfileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  contact: z.string().optional(),
});

const securitySchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const notificationSchema = z.object({
  emailNotifications: z.boolean().default(true),
  stockAlerts: z.boolean().default(true),
  productionAlerts: z.boolean().default(true),
  healthAlerts: z.boolean().default(true),
  dailyReports: z.boolean().default(false),
  weeklyReports: z.boolean().default(true),
});

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("farm");
  const [selectedTheme, setSelectedTheme] = useState("light");
  const [selectedFontSize, setSelectedFontSize] = useState("medium");
  const [shareUsageData, setShareUsageData] = useState(false);
  const [allowThirdPartyCookies, setAllowThirdPartyCookies] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState("available");
  
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setError] = useState<string | null>(null);

  const accessToken = localStorage.getItem('accessToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Farm profile form
  const farmProfileForm = useForm<z.infer<typeof farmProfileSchema>>({
    resolver: zodResolver(farmProfileSchema),
    defaultValues: {
      name: "",
      location: "",
      includeSatellite: false,
    },
  });

  // User profile form
  const userProfileForm = useForm<z.infer<typeof userProfileSchema>>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      contact: "",
    },
  });

  // Security form
  const securityForm = useForm<z.infer<typeof securitySchema>>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Notification preferences form
  const notificationForm = useForm<z.infer<typeof notificationSchema>>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      stockAlerts: true,
      productionAlerts: true,
      healthAlerts: true,
      dailyReports: false,
      weeklyReports: true,
    },
  });

  // Fetch farm data
  const { data: farmData, isLoading: isFarmLoading } = useQuery({
    queryKey: ['farm', user?.farmId],
    queryFn: async () => {
      if (!user?.farmId) return null;
      
      const res = await axios.get(`http://92.112.180.180:3000/api/v1/farm/${user.farmId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res.data;
    },
    enabled: !!user?.farmId && !!accessToken,
  });

  // Fetch user data
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // Note: Since the actual API endpoint might not exist, we're using the user data from localStorage
      // In a real application, you would make an API request to get the full user profile
      return user;
    },
    enabled: !!user?.id,
  });

  // Update farm mutation
  const updateFarmMutation = useMutation({
    mutationFn: async (data: z.infer<typeof farmProfileSchema>) => {
      return axios.patch(`http://92.112.180.180:3000/api/v1/farm/${user.farmId}`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    onSuccess: () => {
      setSaveSuccess("Farm details updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['farm', user?.farmId] });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(null);
      }, 3000);
    },
    onError: (error) => {
      setError("Failed to update farm details. Please try again.");
      console.error("Farm update error:", error);
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof userProfileSchema>) => {
      // This is a mock implementation since the actual API endpoint might not exist
      // In a real application, you would make an API request to update the user profile
      console.log("Updating user profile:", data);
      
      // Simulate API call
      return new Promise(resolve => {
        setTimeout(() => {
          // Update localStorage to simulate the update
          const updatedUser = { ...user, ...data };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          resolve({ data: updatedUser });
        }, 1000);
      });
    },
    onSuccess: () => {
      setSaveSuccess("User profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['user', user?.id] });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(null);
      }, 3000);
    },
    onError: (error) => {
      setError("Failed to update user profile. Please try again.");
      console.error("User update error:", error);
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof securitySchema>) => {
      // This is a mock implementation since the actual API endpoint might not exist
      // In a real application, you would make an API request to change the password
      console.log("Changing password");
      
      // Simulate API call with 50% success rate to demonstrate error handling
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Randomly succeed or fail for demonstration
          if (Math.random() > 0.5) {
            resolve({ data: { message: "Password changed successfully" } });
          } else {
            reject(new Error("Current password is incorrect"));
          }
        }, 1000);
      });
    },
    onSuccess: () => {
      setSaveSuccess("Password changed successfully!");
      securityForm.reset();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(null);
      }, 3000);
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : "Failed to change password. Please try again.");
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    },
  });

  // Update notification preferences mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof notificationSchema>) => {
      // This is a mock implementation since the actual API endpoint might not exist
      console.log("Updating notification preferences:", data);
      
      // Simulate API call
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ data: { message: "Notification preferences updated" } });
        }, 1000);
      });
    },
    onSuccess: () => {
      setSaveSuccess("Notification preferences updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(null);
      }, 3000);
    },
    onError: () => {
      setError("Failed to update notification preferences. Please try again.");
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    },
  });

  // Save theme preferences
  const saveThemePreferences = () => {
    try {
      // Save theme preference to localStorage
      localStorage.setItem('theme', selectedTheme);
      localStorage.setItem('fontSize', selectedFontSize);
      
      // Apply theme - in a real application, you would have a theme context
      // For now, we'll just show a success message
      setSaveSuccess("Theme preferences saved successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(null);
      }, 3000);
    } catch (error) {
      setError("Failed to save theme preferences. Please try again.");
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  // Save privacy settings
  const savePrivacySettings = () => {
    try {
      // Save privacy settings to localStorage
      localStorage.setItem('shareUsageData', shareUsageData.toString());
      localStorage.setItem('allowThirdPartyCookies', allowThirdPartyCookies.toString());
      
      setSaveSuccess("Privacy settings saved successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(null);
      }, 3000);
    } catch (error) {
      setError("Failed to save privacy settings. Please try again.");
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  // Update farm profile
  const onSubmitFarmProfile = (data: z.infer<typeof farmProfileSchema>) => {
    updateFarmMutation.mutate(data);
  };

  // Update user profile
  const onSubmitUserProfile = (data: z.infer<typeof userProfileSchema>) => {
    updateUserMutation.mutate(data);
  };

  // Change password
  const onSubmitSecurity = (data: z.infer<typeof securitySchema>) => {
    changePasswordMutation.mutate(data);
  };

  // Update notification preferences
  const onSubmitNotifications = (data: z.infer<typeof notificationSchema>) => {
    updateNotificationsMutation.mutate(data);
  };

  // Populate form values when data is loaded
  useEffect(() => {
    if (farmData) {
      farmProfileForm.reset({
        name: farmData.name || "",
        location: farmData.location || "",
        includeSatellite: false, // Set default or fetch from API
      });
    }
  }, [farmData, farmProfileForm]);

  useEffect(() => {
    if (userData) {
      userProfileForm.reset({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        contact: userData.contact || "",
      });
    }
  }, [userData, userProfileForm]);

  // Load saved preferences from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedFontSize = localStorage.getItem('fontSize');
    const savedShareUsageData = localStorage.getItem('shareUsageData');
    const savedAllowThirdPartyCookies = localStorage.getItem('allowThirdPartyCookies');
    
    if (savedTheme) setSelectedTheme(savedTheme);
    if (savedFontSize) setSelectedFontSize(savedFontSize);
    if (savedShareUsageData) setShareUsageData(savedShareUsageData === 'true');
    if (savedAllowThirdPartyCookies) setAllowThirdPartyCookies(savedAllowThirdPartyCookies === 'true');
  }, []);

  return (
    <Layout>
      <Navbar2 />
      <div className="flex flex-col w-full min-h-screen">
        <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="max-w-6xl w-full mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                  Manage your account settings and preferences.
                </p>
              </div>
              
              {/* Success/error notifications */}
              <div className="w-full md:w-auto mt-4 md:mt-0">
                {saveSuccess && (
                  <Alert className="bg-green-50 border-green-200 text-green-800">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>{saveSuccess}</AlertDescription>
                  </Alert>
                )}
                
                {saveError && (
                  <Alert className="bg-red-50 border-red-200 text-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{saveError}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <TabsTrigger value="farm">Farm Profile</TabsTrigger>
                <TabsTrigger value="user">User Profile</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
              </TabsList>
              
              {/* Farm Profile Settings */}
              <TabsContent value="farm" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Farm Information</CardTitle>
                    <CardDescription>
                      Update your farm details and location information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...farmProfileForm}>
                      <form onSubmit={farmProfileForm.handleSubmit(onSubmitFarmProfile)} className="space-y-4">
                        <FormField
                          control={farmProfileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Farm Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Farm Name" {...field} />
                              </FormControl>
                              <FormDescription>
                                This will be displayed throughout the application.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={farmProfileForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Farm Location</FormLabel>
                              <FormControl>
                                <Input placeholder="Farm Location" {...field} />
                              </FormControl>
                              <FormDescription>
                                Enter the primary location of your farm.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={farmProfileForm.control}
                          name="includeSatellite"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-6">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div>
                                <FormLabel>Include satellite farm locations</FormLabel>
                                <FormDescription>
                                  Enable this if you manage multiple farm locations.
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <div className="pt-4">
                          <Button 
                            type="submit" 
                            className="flex gap-2"
                            disabled={updateFarmMutation.isPending || !farmProfileForm.formState.isDirty}
                          >
                            {updateFarmMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4" />
                                Save Farm Details
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* User Profile Settings */}
              <TabsContent value="user" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">User Profile</CardTitle>
                    <CardDescription>
                      Update your personal information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...userProfileForm}>
                      <form onSubmit={userProfileForm.handleSubmit(onSubmitUserProfile)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={userProfileForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="First Name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={userProfileForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Last Name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={userProfileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={userProfileForm.control}
                          name="contact"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Phone Number" {...field} />
                              </FormControl>
                              <FormDescription>
                                This will be used for important notifications and alerts.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="pt-4">
                          <Button 
                            type="submit" 
                            className="flex gap-2"
                            disabled={updateUserMutation.isPending || !userProfileForm.formState.isDirty}
                          >
                            {updateUserMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4" />
                                Save Profile
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Security Settings */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Security Settings</CardTitle>
                    <CardDescription>
                      Update your password and security preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...securityForm}>
                      <form onSubmit={securityForm.handleSubmit(onSubmitSecurity)} className="space-y-4">
                        <FormField
                          control={securityForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Enter current password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={securityForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Enter new password" {...field} />
                              </FormControl>
                              <FormDescription>
                                Password must be at least 6 characters long.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={securityForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Confirm new password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="pt-4">
                          <Button 
                            type="submit" 
                            className="flex gap-2"
                            disabled={changePasswordMutation.isPending}
                          >
                            {changePasswordMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Changing Password...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4" />
                                Change Password
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                    
                    <Separator className="my-8" />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Login Sessions</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage your active login sessions across devices.
                      </p>
                      
                      <div className="rounded-md border p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Current Session</p>
                            <p className="text-sm text-muted-foreground">
                              {navigator.userAgent}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Last active: {new Date().toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs">Active Now</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button variant="outline" className="w-full">
                        Log Out All Other Devices
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Notification Settings */}
              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Notification Settings</CardTitle>
                    <CardDescription>
                      Configure how and when you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-4">Notification Mode</h3>
                      <div className="grid gap-2">
                        <div 
                          className={`-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-gray-100 ${selectedNotification === "everything" ? "bg-gray-100 text-gray-900" : ""}`}
                          onClick={() => setSelectedNotification("everything")}
                        >
                          <BellIcon className="mt-px h-5 w-5" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">Everything</p>
                            <p className="text-sm text-gray-500">Email digest, mentions & all activity.</p>
                          </div>
                        </div>
                        <div 
                          className={`-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-gray-100 ${selectedNotification === "available" ? "bg-gray-100 text-gray-900" : ""}`}
                          onClick={() => setSelectedNotification("available")}
                        >
                          <AtSignIcon className="mt-px h-5 w-5" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">Available</p>
                            <p className="text-sm text-gray-500">Only mentions and important alerts.</p>
                          </div>
                        </div>
                        <div 
                          className={`-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-gray-100 ${selectedNotification === "ignoring" ? "bg-gray-100 text-gray-900" : ""}`}
                          onClick={() => setSelectedNotification("ignoring")}
                        >
                          <EyeOffIcon className="mt-px h-5 w-5" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">Ignoring</p>
                            <p className="text-sm text-gray-500">Turn off all notifications.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <Form {...notificationForm}>
                      <form onSubmit={notificationForm.handleSubmit(onSubmitNotifications)} className="space-y-6">
                        <h3 className="text-lg font-medium">Notification Preferences</h3>
                        
                        <FormField
                          control={notificationForm.control}
                          name="emailNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 p-4 border rounded-md">
                              <div className="space-y-0.5">
                                <FormLabel>Email Notifications</FormLabel>
                                <FormDescription>
                                  Receive notifications via email
                                </FormDescription>
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
                        
                        <div className="pl-6 space-y-4">
                          <FormField
                            control={notificationForm.control}
                            name="stockAlerts"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 p-2 rounded-md">
                                <div className="space-y-0.5">
                                  <FormLabel>Stock Alerts</FormLabel>
                                  <FormDescription>
                                    Get notified when stock levels are below threshold
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={!notificationForm.watch("emailNotifications")}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={notificationForm.control}
                            name="productionAlerts"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 p-2 rounded-md">
                                <div className="space-y-0.5">
                                  <FormLabel>Production Alerts</FormLabel>
                                  <FormDescription>
                                    Get notified about changes in production metrics
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={!notificationForm.watch("emailNotifications")}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={notificationForm.control}
                            name="healthAlerts"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 p-2 rounded-md">
                                <div className="space-y-0.5">
                                  <FormLabel>Health Alerts</FormLabel>
                                  <FormDescription>
                                    Get notified about bird health issues and diagnoses
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={!notificationForm.watch("emailNotifications")}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <h3 className="text-lg font-medium">Report Schedules</h3>
                        
                        <div className="pl-6 space-y-4">
                          <FormField
                            control={notificationForm.control}
                            name="dailyReports"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 p-2 rounded-md">
                                <div className="space-y-0.5">
                                  <FormLabel>Daily Reports</FormLabel>
                                  <FormDescription>
                                    Receive daily summary reports
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={!notificationForm.watch("emailNotifications")}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={notificationForm.control}
                            name="weeklyReports"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 p-2 rounded-md">
                                <div className="space-y-0.5">
                                  <FormLabel>Weekly Reports</FormLabel>
                                  <FormDescription>
                                    Receive weekly summary reports
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={!notificationForm.watch("emailNotifications")}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="pt-4">
                          <Button 
                            type="submit" 
                            className="flex gap-2"
                            disabled={updateNotificationsMutation.isPending}
                          >
                            {updateNotificationsMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4" />
                                Save Notification Settings
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Appearance Settings */}
              <TabsContent value="appearance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Appearance</CardTitle>
                    <CardDescription>
                      Customize the look and feel of the application
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      <div className="flex flex-col space-y-2">
                        <h3 className="text-lg font-medium">Theme</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Choose between light and dark mode
                        </p>
                        
                        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                          <div 
                            className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer ${selectedTheme === 'light' ? 'border-primary bg-accent/50' : 'hover:bg-accent/20'}`}
                            onClick={() => setSelectedTheme('light')}
                          >
                            <div className="h-24 w-24 rounded-md bg-white border shadow-sm mb-2 flex items-center justify-center">
                              <SunIcon className="h-8 w-8 text-amber-500" />
                            </div>
                            <span className="text-sm font-medium">Light</span>
                          </div>
                          
                          <div 
                            className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer ${selectedTheme === 'dark' ? 'border-primary bg-accent/50' : 'hover:bg-accent/20'}`}
                            onClick={() => setSelectedTheme('dark')}
                          >
                            <div className="h-24 w-24 rounded-md bg-gray-900 border border-gray-800 shadow-sm mb-2 flex items-center justify-center">
                              <MoonIcon className="h-8 w-8 text-blue-300" />
                            </div>
                            <span className="text-sm font-medium">Dark</span>
                          </div>
                          
                          <div 
                            className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer ${selectedTheme === 'system' ? 'border-primary bg-accent/50' : 'hover:bg-accent/20'}`}
                            onClick={() => setSelectedTheme('system')}
                          >
                            <div className="h-24 w-24 rounded-md bg-gradient-to-br from-white to-gray-900 border shadow-sm mb-2 flex items-center justify-center">
                              <MonitorIcon className="h-8 w-8 text-gray-600" />
                            </div>
                            <span className="text-sm font-medium">System</span>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Font Size</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Adjust the font size to your preference
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div 
                            className={`p-4 border rounded-lg cursor-pointer flex flex-col items-center justify-center ${selectedFontSize === 'small' ? 'border-primary bg-accent/50' : 'hover:bg-accent/20'}`}
                            onClick={() => setSelectedFontSize('small')}
                          >
                            <TextIcon className="h-6 w-6 mb-2" />
                            <span className="text-xs font-medium">Small</span>
                          </div>
                          
                          <div
                            className={`p-4 border rounded-lg cursor-pointer flex flex-col items-center justify-center ${selectedFontSize === 'medium' ? 'border-primary bg-accent/50' : 'hover:bg-accent/20'}`}
                            onClick={() => setSelectedFontSize('medium')}
                          >
                            <TextIcon className="h-8 w-8 mb-2" />
                            <span className="text-sm font-medium">Medium</span>
                          </div>
                          
                          <div
                            className={`p-4 border rounded-lg cursor-pointer flex flex-col items-center justify-center ${selectedFontSize === 'large' ? 'border-primary bg-accent/50' : 'hover:bg-accent/20'}`}
                            onClick={() => setSelectedFontSize('large')}
                          >
                            <TextIcon className="h-10 w-10 mb-2" />
                            <span className="text-base font-medium">Large</span>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="pt-4">
                        <Button 
                          onClick={saveThemePreferences}
                          className="flex gap-2"
                        >
                          <Save className="h-4 w-4" />
                          Save Appearance Settings
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Privacy</CardTitle>
                    <CardDescription>Manage your privacy settings</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Share Usage Data</p>
                        <p className="text-sm text-muted-foreground">
                          Help us improve the product by sharing anonymous usage data.
                        </p>
                      </div>
                      <Switch 
                        checked={shareUsageData} 
                        onCheckedChange={setShareUsageData} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Allow Third-Party Cookies</p>
                        <p className="text-sm text-muted-foreground">
                          Enable third-party cookies for personalized content.
                        </p>
                      </div>
                      <Switch 
                        checked={allowThirdPartyCookies} 
                        onCheckedChange={setAllowThirdPartyCookies} 
                      />
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        onClick={savePrivacySettings}
                        className="flex gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save Privacy Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </Layout>
  );
}