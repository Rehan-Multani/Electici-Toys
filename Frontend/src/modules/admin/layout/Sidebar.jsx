import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, BarChart2, User, Bell, LogOut, Layout, FileText, Info, Phone, Play, Home, Tag, Scale, MessageSquare, Truck } from 'lucide-react';
import { cn } from "../../../lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../user/components/ui/sheet';
import { useAdminAuthStore } from '../store/adminAuthStore';

export function Sidebar({ isOpen, onClose, onLogout }) {
    const { admin } = useAdminAuthStore();
    const navItems = [
        { name: 'DASHBOARD', icon: LayoutDashboard, path: '/admin' },
        { name: 'PRODUCTS', icon: Package, path: '/admin/products' },
        { name: 'CATEGORIES', icon: Tag, path: '/admin/categories' },
        { name: 'ORDERS', icon: ShoppingBag, path: '/admin/orders' },
        { name: 'SHIPPING', icon: Truck, path: '/admin/shipping' },
        { name: 'ANALYTICS', icon: BarChart2, path: '/admin/analytics' },
        {
            name: 'CONTENT MANAGEMENT',
            isHeader: true
        },
        { name: 'HOME PAGE', icon: Home, path: '/admin/content/home' },
        { name: 'ABOUT PAGE', icon: Info, path: '/admin/content/about' },
        { name: 'CONTACT PAGE', icon: Phone, path: '/admin/content/contact' },

        { name: 'LEGAL PAGES', icon: Scale, path: '/admin/content/legal' },
        { name: 'NOTIFICATIONS', icon: Bell, path: '/admin/notifications' },
    ];

    const SidebarContent = ({ mobile = false }) => (
        <div className={cn("flex flex-col h-full", mobile ? "p-0" : "p-6")}>
            {!mobile && (
                <div className="flex items-center justify-center mb-10">
                    <span className="text-3xl font-black text-white tracking-tighter italic uppercase drop-shadow-sm">{admin?.fullName || 'ADMIN PANEL'}</span>
                </div>
            )}

            <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-2 custom-scrollbar">
                {navItems.map((item) => (
                    item.isHeader ? (
                        <div key={item.name} className="pt-4 pb-1 px-4 text-[11px] font-black tracking-[0.2em] text-slate-500 uppercase">
                            {item.name}
                        </div>
                    ) : (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/admin'}
                            onClick={() => mobile && onClose()}
                            className={({ isActive }) => cn(
                                "group flex items-center gap-3 px-4 py-3 rounded-xl font-bold uppercase tracking-wide text-[11px] transition-all duration-300 ease-in-out border border-transparent",
                                isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/25 scale-[1.02] border-primary/10"
                                    : "text-slate-400 hover:bg-white/10 hover:text-white hover:shadow-md hover:border-white/5 hover:scale-[1.02]"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    <div className={cn(
                                        "p-2 rounded-xl transition-colors duration-300 shadow-sm",
                                        isActive ? "bg-white/20 shadow-inner" : "bg-white/5 group-hover:bg-primary/20"
                                    )}>
                                        <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400 group-hover:text-primary")} strokeWidth={2.5} />
                                    </div>
                                    <span className="truncate">{item.name}</span>
                                </>
                            )}
                        </NavLink>
                    )
                ))}
            </nav>

            <div className="pt-6 mt-auto px-2">
                <button
                    onClick={onLogout}
                    className="group flex items-center justify-center gap-3 px-6 py-4 w-full rounded-xl font-black italic uppercase tracking-widest text-xs text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300"
                >
                    <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                    <span>LOG OUT</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Sheet */}
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent side="left" className="w-[300px] border-primary/10 bg-[#0f172a] p-8 pt-12">
                    <SheetHeader className="mb-8">
                        <SheetTitle className="text-left text-3xl font-black text-white tracking-tighter italic uppercase">{admin?.fullName || 'Admin Panel'}</SheetTitle>
                    </SheetHeader>
                    <SidebarContent mobile />
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block fixed top-0 left-0 bottom-0 w-72 bg-[#0f172a] border-r border-white/5 z-30 shadow-2xl">
                <SidebarContent />
            </aside>
        </>
    );
}
