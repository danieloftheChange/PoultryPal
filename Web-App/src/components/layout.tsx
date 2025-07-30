import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

const Layout = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();

    const accessToken = localStorage.getItem('accessToken');

    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [currentAccessToken, setCurrentAccessToken] = useState(accessToken);

    useEffect(() => {
        if (!user?.id || !currentAccessToken) {
            navigate('/login');
        }
    }, [user, currentAccessToken, navigate]);

    useEffect(() => {
        const handleStorageChange = () => {
            const storedUser = localStorage.getItem('user');
            const storedAccessToken = localStorage.getItem('accessToken');
            setUser(storedUser ? JSON.parse(storedUser) : null);
            setCurrentAccessToken(storedAccessToken);
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return (
        <div className="flex min-h-screen">
            <SidebarProvider>
                <AppSidebar />
                <main className="flex-grow overflow-y-auto w-full">
                    {children}
                </main>
            </SidebarProvider>
        </div>
    );
};

export default Layout;
