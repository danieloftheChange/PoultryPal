/**
 * Navbar.tsx
 *
 * Responsive navigation bar for PoultryPal application.
 * Supports:
 *  - Desktop menu with dropdowns (uses NavigationMenu)
 *  - Mobile menu sheet with accordion (uses Sheet + Accordion)
 *  - Theme toggle (light/dark/system) via DropdownMenu
 *  - Authentication links (login/signup)
 *  - Logo link back to home
 */
import { useState } from "react";
import { Book, Menu, Shield, Phone, Sun, Moon, Monitor } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}
// Props for Navbar component including logo, menu items, and auth links
interface Navbar1Props {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  menu?: MenuItem[];
  mobileExtraLinks?: {
    name: string;
    url: string;
  }[];
  auth?: {
    login: {
      text: string;
      url: string;
    };
    signup: {
      text: string;
      url: string;
    };
  };
}

const Navbar = ({
  logo = {
    url: "/",
    src: "https://www.shadcnblocks.com/images/block/block-1.svg",
    alt: "logo",
    title: "PoultryPal",
  },
  menu = [
    { title: "Home", url: "/" },
    {
      title: "Features",
      url: "#",
      items: [
        {
          title: "Disease Diagnosis",
          description: "AI-powered disease detection for early intervention",
          icon: <Shield className="size-5 shrink-0" />,
          url: "/diagnosis",
        },
        {
          title: "Production Tracking",
          description: "Monitor egg production and mortality rates efficiently",
          icon: <Book className="size-5 shrink-0" />,
          url: "/production",
        },
        {
          title: "Environmental Monitoring",
          description: "Track temperature, humidity, and other vital conditions",
          icon: <Monitor className="size-5 shrink-0" />,
          url: "/monitoring",
        },
      ],
    },
    {
      title: "Resources",
      url: "#",
      items: [
        {
          title: "Help Center",
          description: "Find answers to common questions about PoultryPal",
          icon: <Book className="size-5 shrink-0" />,
          url: "#",
        },
        {
          title: "Contact Us",
          description: "Get in touch with our support team for assistance",
          icon: <Phone className="size-5 shrink-0" />,
          url: "#",
        },
      ],
    },
    {
      title: "About Us",
      url: "#",
    },
  ],
  auth = {
    login: { text: "Log in", url: "/login" },
    signup: { text: "Sign up", url: "/signup" },
  },
}: Navbar1Props) => {
  const [activeTheme, setActiveTheme] = useState<string>("light");

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="container py-3 px-4 mx-auto">
        {/* Desktop Menu */}
        <nav className="hidden justify-between items-center lg:flex">
          <div className="flex items-center gap-8">
            <a href={logo.url} className="flex items-center gap-2">
              <img src={logo.src} className="w-8" alt={logo.alt} />
              <span className="text-xl font-semibold text-green-700">{logo.title}</span>
            </a>
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList>
                  {menu.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle activeTheme={activeTheme} setActiveTheme={setActiveTheme} />
            <Button asChild variant="outline" size="sm" className="border-green-700 text-green-700 hover:bg-green-50">
              <a href={auth.login.url}>{auth.login.text}</a>
            </Button>
            <Button asChild size="sm" className="bg-green-700 hover:bg-green-800">
              <a href={auth.signup.url}>{auth.signup.text}</a>
            </Button>
          </div>
        </nav>
        {/* Mobile Menu */}
        <div className="flex items-center justify-between lg:hidden">
          <a href={logo.url} className="flex items-center gap-2">
            <img src={logo.src} className="w-8" alt={logo.alt} />
            <span className="text-lg font-semibold text-green-700">{logo.title}</span>
          </a>
          <div className="flex items-center gap-2">
            <ThemeToggle activeTheme={activeTheme} setActiveTheme={setActiveTheme} />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Menu className="size-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader className="mb-6">
                  <SheetTitle>
                    <a href={logo.url} className="flex items-center gap-2">
                      <img src={logo.src} className="w-8" alt={logo.alt} />
                      <span className="text-lg font-semibold text-green-700">{logo.title}</span>
                    </a>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 p-4">
                  <Accordion
                    type="single"
                    collapsible
                    className="flex w-full flex-col gap-4"
                  >
                    {menu.map((item) => renderMobileMenuItem(item))}
                  </Accordion>

                  <div className="flex flex-col gap-3 mt-4">
                    <Button asChild variant="outline" className="w-full border-green-700 text-green-700">
                      <a href={auth.login.url}>{auth.login.text}</a>
                    </Button>
                    <Button asChild className="w-full bg-green-700 hover:bg-green-800">
                      <a href={auth.signup.url}>{auth.signup.text}</a>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

const ThemeToggle = ({ activeTheme, setActiveTheme }: { 
  activeTheme: string, 
  setActiveTheme: (theme: string) => void 
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full w-9 h-9">
          {activeTheme === "light" ? (
            <Sun className="h-5 w-5" />
          ) : activeTheme === "dark" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Monitor className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={activeTheme} onValueChange={setActiveTheme}>
          <DropdownMenuRadioItem value="light">
            <Sun className="mr-2 h-4 w-4" />
            Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon className="mr-2 h-4 w-4" />
            Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Monitor className="mr-2 h-4 w-4" />
            System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title} className="text-muted-foreground">
        <NavigationMenuTrigger className="bg-transparent hover:bg-gray-100 hover:text-green-700">
          {item.title}
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          <div className="grid grid-cols-1 gap-3 p-4 md:w-[400px] lg:w-[500px]">
            {item.items.map((subItem) => (
              <NavigationMenuLink asChild key={subItem.title} className="w-full">
                <SubMenuLink item={subItem} />
              </NavigationMenuLink>
            ))}
          </div>
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink asChild>
        <a
          className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-green-700"
          href={item.url}
        >
          {item.title}
        </a>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="text-md py-2 font-medium hover:text-green-700 hover:no-underline">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2 space-y-3">
          {item.items.map((subItem) => (
            <a 
              key={subItem.title} 
              href={subItem.url} 
              className="flex items-start p-2 rounded-md hover:bg-gray-100"
            >
              {subItem.icon && <div className="mr-3 text-green-700">{subItem.icon}</div>}
              <div>
                <div className="font-medium">{subItem.title}</div>
                {subItem.description && (
                  <p className="text-sm text-gray-500">{subItem.description}</p>
                )}
              </div>
            </a>
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <a 
      key={item.title} 
      href={item.url} 
      className="text-md py-2 font-medium hover:text-green-700"
    >
      {item.title}
    </a>
  );
};
// SubMenuLink: used inside desktop dropdown to show icon, title, and description
const SubMenuLink = ({ item }: { item: MenuItem }) => {
  return (
    <a
      className="flex flex-row gap-4 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-gray-100 hover:text-green-700"
      href={item.url}
    >
      <div className="text-green-700">{item.icon}</div>
      <div>
        <div className="text-sm font-medium">{item.title}</div>
        {item.description && (
          <p className="text-sm leading-snug text-gray-500">
            {item.description}
          </p>
        )}
      </div>
    </a>
  );
};

export default Navbar;