import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Bell, 
  Search, 
  LogOut, 
  User, 
  Settings, 
  Moon, 
  Sun,
  ChevronDown,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Input } from '@/components/ui/input';

interface NotificationType {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  read: boolean;
  createdAt: string;
}

function Navbar2() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // This would normally come from an API, but for demo we'll use mock data
    const mockNotifications: NotificationType[] = [
      {
        id: '1',
        title: 'Low Stock Alert',
        message: 'Feed stock is running low, please restock soon.',
        type: 'warning',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
      },
      {
        id: '2',
        title: 'Production Update',
        message: 'Production has increased by 15% in House 3.',
        type: 'success',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
      },
      {
        id: '3',
        title: 'Temperature Warning',
        message: 'House 2 temperature is above normal range.',
        type: 'danger',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality here
      console.log('Searching for:', searchQuery);
      // Typically you would navigate to search results or filter content
    }
  };

  // Helper function to format notification time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };

  // Helper function to get notification icon color
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-amber-500';
      case 'danger': return 'text-red-500';
      case 'success': return 'text-green-500';
      default: return 'text-blue-500';
    }
  };

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-30 bg-white border-b shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Left section - Sidebar toggle and search */}
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white" />
            
            {showSearch ? (
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 h-9 pl-8"
                  autoFocus
                />
                <Search 
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" 
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowSearch(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowSearch(true)}
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Search</TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Farm name - only visible on larger screens */}
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {user?.farmName || "PoultryPal Farm"}
            </h1>
          </div>

          {/* Right section - notifications, theme toggle, and profile */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleTheme}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</TooltipContent>
            </Tooltip>

            {/* Notifications */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="relative text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge 
                          className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white p-0"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>
              
              <DropdownMenuContent className="w-80 mr-4" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                  <DropdownMenuLabel className="text-base">Notifications</DropdownMenuLabel>
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Mark all as read
                    </Button>
                  )}
                </div>
                
                <div className="max-h-[300px] overflow-y-auto py-2">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <DropdownMenuItem 
                        key={notification.id}
                        className={cn(
                          "flex flex-col items-start gap-1 p-3 cursor-default",
                          !notification.read && "bg-gray-50 dark:bg-gray-800"
                        )}
                        onSelect={() => markAsRead(notification.id)}
                      >
                        <div className="flex w-full justify-between">
                          <span className={cn(
                            "font-medium",
                            getNotificationColor(notification.type)
                          )}>
                            {notification.title}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {notification.message}
                        </p>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="p-3 flex justify-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  onSelect={() => navigate('/notifications')}
                >
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <div className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full w-8 h-8 flex items-center justify-center">
                    <span className="font-semibold text-sm">
                      {user?.firstName ? user.firstName[0].toUpperCase() : 'U'}
                      {user?.lastName ? user.lastName[0].toUpperCase() : ''}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user?.email 
                          ? user.email.split('@')[0] 
                          : 'User'
                      }
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.role || 'User'}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user?.email 
                        ? user.email 
                        : 'User'
                    }
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email || ''}
                  </p>
                </div>
                
                <DropdownMenuItem 
                  className="flex items-center gap-2 p-2 cursor-pointer"
                  onSelect={() => navigate('/profile')}
                >
                  <User className="h-4 w-4 text-gray-500" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                
                 {user?.role !== "Worker" && (
                <DropdownMenuItem 
                  className="flex items-center gap-2 p-2 cursor-pointer"
                  onSelect={() => navigate('/settings')}
                >
                  <Settings className="h-4 w-4 text-gray-500" />
                  <span>Settings</span>
                </DropdownMenuItem>
                 )}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  className="flex items-center gap-2 p-2 cursor-pointer text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                  onSelect={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}

export default Navbar2;