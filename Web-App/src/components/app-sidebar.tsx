// Web-App/src/components/app-sidebar.tsx

import * as React from "react"
import { useEffect, useState } from "react"
import {
  BarChart, Calendar, Home, Package, Search, PlusCircle,
  Settings, Users, Menu, ChevronRight, X,
  FlaskConical
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { useNavigate } from "react-router-dom";

// Full navigation menu for managers (admins)
const fullNav = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart,
  },
  {
    title: "Birds and Housing",
    url: "",
    icon: Home,
    items: [
      {
        title: "Birds",
        url: "/birds",
      },
      {
        title: "Housing",
        url: "/houses",
      },
    ],
  },
  {
    title: "Production",
    url: "/production",
    icon: Calendar,
  },
  {
    title: "Stock",
    url: "/stock",
    icon: Package,
  },
  {
    title: "Feed Formulas", // New menu item for feed formulas
    url: "",
    icon: FlaskConical,
    items: [
      {
        title: "All Formulas",
        url: "/feed-formula",
      },
      {
        title: "Create Formula",
        url: "/feed-formula/create",
      },
    ],
  },
  {
    title: "Immunization",
    url: "/immunization",
    icon: PlusCircle,
  },
  {
    title: "Disease Diagnosis",
    url: "/diagnosis",
    icon: Search,
  },
  {
    title: "Staff",
    url: "/staff",
    icon: Users,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

// Limited navigation menu for workers
const workerNav = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart,
  },
  {
    title: "Production",
    url: "/production",
    icon: Calendar,
  },
  {
    title: "Stock",
    url: "/stock",
    icon: Package,
  },
  {
    title: "Feed Formulas", // Also add to worker menu with fewer options
    url: "/feed-formula",
    icon: FlaskConical,
  },
  {
    title: "Immunization",
    url: "/immunization",
    icon: PlusCircle,
  },
  {
    title: "Disease Diagnosis",
    url: "/diagnosis",
    icon: Search,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [menuItems, setMenuItems] = useState(fullNav)
  const [activeItem, setActiveItem] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { state, toggleSidebar } = useSidebar()
  const navigate = useNavigate();

  // Load sidebar state from localStorage on component mount
  useEffect(() => {
    // Check if user has a stored preference for sidebar state
    const storedSidebarState = localStorage.getItem("sidebar_state")
    if (storedSidebarState) {
      // We don't directly set state here as the sidebar already has its own state management
      // but we could use this information if needed
    }

    // Set the active item based on current URL
    const path = window.location.pathname
    setActiveItem(path)

    // Get user role and set appropriate menu items
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      if (user.role === "Worker") {
        setMenuItems(workerNav)
      } else {
        setMenuItems(fullNav)
      }
    }
  }, [])

  // Save sidebar state when it changes
  useEffect(() => {
    localStorage.setItem("sidebar_state", state)
  }, [state])

  // Mobile menu overlay
  const MobileMenu = () => (
    <div
      className={`fixed inset-0 bg-black/50 z-40 md:hidden ${isMobileMenuOpen ? "block" : "hidden"}`}
      onClick={() => setIsMobileMenuOpen(false)}
    >
      <div
        className="fixed left-0 top-0 h-full w-64 bg-sidebar p-4 z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <BarChart className="size-4" />
            </div>
            <span className="text-lg font-semibold">PoultryPal</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-1">
          {menuItems.map((item) => (
            <div key={item.title} className="mb-1">
              {item.items ? (
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-between"
                    onClick={() => {
                      if (item.url) {
                        navigate(item.url);
                        setIsMobileMenuOpen(false)
                      }
                    }}
                  >
                    <div className="flex items-center">
                      {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                      {item.title}
                    </div>
                    {item.items && <ChevronRight className="h-4 w-4" />}
                  </Button>

                  {item.items && (
                    <div className="ml-6 space-y-1 border-l pl-3 border-sidebar-border">
                      {item.items.map((subItem) => (
                        <Button
                          key={subItem.title}
                          variant="ghost"
                          className={cn(
                            "w-full justify-start",
                            activeItem === subItem.url && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          )}
                          onClick={() => {
                            navigate(subItem.url);
                            setIsMobileMenuOpen(false)
                          }}
                        >
                          {subItem.title}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    activeItem === item.url && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  )}
                  onClick={() => {
                    window.location.href = item.url
                    setIsMobileMenuOpen(false)
                  }}
                >
                  {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                  {item.title}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // Mobile menu toggle button - shown only on small screens
  const MobileMenuToggle = () => (
    <Button
      variant="ghost"
      size="icon"
      className="fixed top-3 left-3 z-30 md:hidden"
      onClick={() => setIsMobileMenuOpen(true)}
    >
      <Menu className="h-5 w-5" />
    </Button>
  )

  return (
    <TooltipProvider delayDuration={300}>
      {/* Mobile menu components */}
      <MobileMenuToggle />
      <MobileMenu />

      {/* Main sidebar for desktop */}
      <Sidebar {...props} className="hidden md:block">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="/dashboard" className="flex items-center gap-2">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <BarChart className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">PoultryPal</span>
                    <span className="text-xs opacity-70">v1.0.0</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={activeItem === item.url || 
                             (item.items && item.items.some(subItem => activeItem === subItem.url))}
                    tooltip={item.title}
                  >
                    <div
                      role="button"
                      className={cn(
                        "font-medium relative",
                        (activeItem === item.url || 
                        (item.items && item.items.some(subItem => activeItem === subItem.url))) && 
                        "before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-green-600 before:rounded-r-sm"
                      )}
                      onClick={() => {
                        if (item.url) {
                          setActiveItem(item.url);
                          navigate(item.url);;
                        }
                      }}
                    >
                      {item.icon && <item.icon className="mr-2 size-4" />}
                      {item.title}
                    </div>
                  </SidebarMenuButton>

                  {item.items?.length ? (
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={`${subItem.title}-${subItem.url}`}>
                          <SidebarMenuSubButton
                            asChild
                            className={cn(
                              activeItem === subItem.url && "bg-sidebar-accent font-medium"
                            )}
                          >
                            <a
                              role="button"
                              onClick={() => {
                                setActiveItem(subItem.url);
                                navigate(subItem.url);
                              }}
                            >
                              {subItem.title}
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <div className="mt-auto p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between items-center"
                onClick={toggleSidebar}
              >
                <span className="group-data-[collapsible=icon]:hidden">
                  {state === "expanded" ? "Collapse" : "Expand"}
                </span>
                <ChevronRight className={`h-4 w-4 transition-transform ${state === 'collapsed' ? 'rotate-0' : 'rotate-180'}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {state === "expanded" ? "Collapse Sidebar" : "Expand Sidebar"}
            </TooltipContent>
          </Tooltip>
        </div>

        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  )
}