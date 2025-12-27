import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Package, ShoppingCart, User, Settings,
    LogOut, ChevronLeft, ChevronRight, Sun, Users, Store,
    BarChart3, FileText, CreditCard
} from 'lucide-react';
import { useAuth } from '../../App';
import { Button } from '../ui/button';

const DashboardLayout = ({ children, userRole = 'vendor' }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = React.useState(false);

    const vendorLinks = [
        { name: 'Dashboard', path: '/vendor/dashboard', icon: LayoutDashboard },
        { name: 'Products', path: '/vendor/products', icon: Package },
        { name: 'Orders', path: '/vendor/orders', icon: ShoppingCart },
        { name: 'Profile', path: '/vendor/profile', icon: User },
    ];

    const adminLinks = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Vendors', path: '/admin/vendors', icon: Store },
        { name: 'Products', path: '/admin/products', icon: Package },
        { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
    ];

    const links = userRole === 'admin' ? adminLinks : vendorLinks;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-muted/30 flex">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: collapsed ? 80 : 260 }}
                className="fixed left-0 top-0 h-full bg-card border-r shadow-lg z-40 flex flex-col"
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b">
                    {!collapsed && (
                        <Link to="/" className="flex items-center gap-2">
                            <Sun className="w-8 h-8 text-primary" />
                            <span className="font-bold text-lg">
                                <span className="text-primary">Solar</span>Savers
                            </span>
                        </Link>
                    )}
                    {collapsed && <Sun className="w-8 h-8 text-primary mx-auto" />}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCollapsed(!collapsed)}
                        className="ml-auto"
                    >
                        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </Button>
                </div>

                {/* User Info */}
                <div className={`p-4 border-b ${collapsed ? 'text-center' : ''}`}>
                    <div className={`w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center ${collapsed ? 'mx-auto' : ''}`}>
                        <User className="w-5 h-5 text-primary" />
                    </div>
                    {!collapsed && (
                        <div className="mt-2">
                            <p className="font-semibold text-sm">{user?.name || 'User'}</p>
                            <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {links.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                    } ${collapsed ? 'justify-center' : ''}`}
                            >
                                <link.icon className="w-5 h-5 flex-shrink-0" />
                                {!collapsed && <span className="font-medium">{link.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t">
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className={`w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 ${collapsed ? 'justify-center px-0' : ''}`}
                    >
                        <LogOut className="w-5 h-5" />
                        {!collapsed && <span className="ml-2">Logout</span>}
                    </Button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main
                className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-[260px]'}`}
            >
                <div className="p-6 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
