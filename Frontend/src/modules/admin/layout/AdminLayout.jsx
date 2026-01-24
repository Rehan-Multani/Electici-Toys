import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, User, Bell, Search, LogOut } from 'lucide-react';
import { Button } from '../../user/components/ui/button';
import { useAdminAuthStore } from '../store/adminAuthStore';

export default function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { admin, logout } = useAdminAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-background">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={handleLogout} />

            <div className="lg:ml-72 flex flex-col min-h-screen">
                {/* Header */}
                <header className="h-20 border-b border-secondary/20 flex items-center justify-between px-8 bg-background/80 backdrop-blur-md sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 hover:bg-secondary/20 rounded-xl transition-all"
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        <div className="hidden md:flex items-center bg-secondary/30 rounded-full px-4 py-2 gap-3 min-w-[300px] border border-transparent focus-within:border-primary/30 transition-all">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search products, orders..."
                                className="bg-transparent border-none outline-none text-xs w-full uppercase tracking-widest font-bold"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full relative"
                            onClick={() => navigate('/admin/notifications')}
                        >
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full" />
                        </Button>

                        <div className="h-8 w-[1px] bg-secondary/20 mx-2" />

                        <div className="flex items-center gap-4 pl-2">
                            <div className="hidden md:block text-right">
                                <p className="text-xs font-black italic uppercase tracking-tighter">{admin?.fullName || 'Admin Panel'}</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Administrator</p>
                            </div>
                            <div className="h-10 w-10 rounded-2xl bg-primary/20 flex items-center justify-center p-0.5 border border-primary/20 overflow-hidden">
                                {admin?.avatar ? (
                                    <img src={admin.avatar} alt="Admin" className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    <User className="h-5 w-5 text-primary" />
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 bg-secondary/5">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
