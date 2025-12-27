import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign, Users, Store, Package, ShoppingCart,
    TrendingUp, Activity, AlertCircle, CheckCircle, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import StatsCard from '../components/dashboard/StatsCard';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../App';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalRevenue: 125450,
        totalUsers: 1250,
        totalVendors: 45,
        totalProducts: 320,
        totalOrders: 890,
        pendingVendors: 5
    });

    const [recentActivities, setRecentActivities] = useState([
        { type: 'new_order', message: 'New order #ORD-890 received', time: '5 min ago', icon: ShoppingCart },
        { type: 'new_vendor', message: 'New vendor application from "Green Solar Co"', time: '15 min ago', icon: Store },
        { type: 'new_user', message: 'New user registration: john@example.com', time: '1 hour ago', icon: Users },
        { type: 'product', message: 'Product "Solar Panel 500W" added by SunPower', time: '2 hours ago', icon: Package },
        { type: 'order_complete', message: 'Order #ORD-885 marked as completed', time: '3 hours ago', icon: CheckCircle },
    ]);

    const [pendingVendors, setPendingVendors] = useState([
        { id: 1, name: 'Green Solar Co', email: 'info@greensolar.com', date: '2024-12-27' },
        { id: 2, name: 'EcoEnergy Solutions', email: 'contact@ecoenergy.com', date: '2024-12-26' },
        { id: 3, name: 'SolarTech Plus', email: 'hello@solartech.com', date: '2024-12-25' },
    ]);

    const [topVendors, setTopVendors] = useState([
        { name: 'SunPower Solar', orders: 156, revenue: 45250 },
        { name: 'Tesla Energy', orders: 134, revenue: 38900 },
        { name: 'LG Solar Shop', orders: 98, revenue: 29500 },
        { name: 'Canadian Solar', orders: 87, revenue: 25800 },
    ]);

    return (
        <DashboardLayout userRole="admin">
            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Welcome back, {user?.name || 'Admin'}! Here's your platform overview.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    <StatsCard
                        title="Total Revenue"
                        value={`$${stats.totalRevenue.toLocaleString()}`}
                        change="+15% this month"
                        changeType="increase"
                        icon={DollarSign}
                        color="green"
                    />
                    <StatsCard
                        title="Total Users"
                        value={stats.totalUsers.toLocaleString()}
                        change="+120 this month"
                        changeType="increase"
                        icon={Users}
                        color="blue"
                    />
                    <StatsCard
                        title="Vendors"
                        value={stats.totalVendors}
                        change="+5 this month"
                        changeType="increase"
                        icon={Store}
                        color="purple"
                    />
                    <StatsCard
                        title="Products"
                        value={stats.totalProducts}
                        change="+32 this month"
                        changeType="increase"
                        icon={Package}
                        color="orange"
                    />
                    <StatsCard
                        title="Orders"
                        value={stats.totalOrders}
                        change="+89 this month"
                        changeType="increase"
                        icon={ShoppingCart}
                        color="primary"
                    />
                    <StatsCard
                        title="Pending Approval"
                        value={stats.pendingVendors}
                        change="Vendors awaiting"
                        changeType="decrease"
                        icon={AlertCircle}
                        color="red"
                    />
                </div>

                {/* Main Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Recent Activities */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2 bg-card rounded-xl border shadow-sm"
                    >
                        <div className="p-4 md:p-6 border-b flex items-center justify-between">
                            <h2 className="font-semibold text-lg flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary" />
                                Recent Activity
                            </h2>
                        </div>
                        <div className="p-4 space-y-3">
                            {recentActivities.map((activity, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <activity.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm">{activity.message}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Top Vendors */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-card rounded-xl border shadow-sm"
                    >
                        <div className="p-4 md:p-6 border-b flex items-center justify-between">
                            <h2 className="font-semibold text-lg">Top Vendors</h2>
                            <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="p-4 space-y-3">
                            {topVendors.map((vendor, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{vendor.name}</p>
                                        <p className="text-xs text-muted-foreground">{vendor.orders} orders</p>
                                    </div>
                                    <p className="font-semibold text-sm text-green-600">${vendor.revenue.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Pending Vendor Approvals */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-card rounded-xl border shadow-sm"
                >
                    <div className="p-4 md:p-6 border-b flex items-center justify-between">
                        <h2 className="font-semibold text-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-orange-500" />
                            Pending Vendor Approvals
                        </h2>
                        <Link to="/admin/vendors">
                            <Button variant="ghost" size="sm">
                                View All <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Vendor Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Date Applied</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingVendors.map((vendor) => (
                                    <tr key={vendor.id} className="border-t hover:bg-muted/30">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                                    <Store className="w-4 h-4 text-primary" />
                                                </div>
                                                <span className="font-medium">{vendor.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">{vendor.email}</td>
                                        <td className="px-4 py-3 text-sm">{vendor.date}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
                                                    Approve
                                                </Button>
                                                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                                                    Reject
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 border"
                >
                    <h3 className="font-semibold mb-4">Quick Actions</h3>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/admin/users">
                            <Button variant="outline" size="sm" className="bg-white">
                                <Users className="w-4 h-4 mr-2" /> Manage Users
                            </Button>
                        </Link>
                        <Link to="/admin/vendors">
                            <Button variant="outline" size="sm" className="bg-white">
                                <Store className="w-4 h-4 mr-2" /> Manage Vendors
                            </Button>
                        </Link>
                        <Link to="/admin/products">
                            <Button variant="outline" size="sm" className="bg-white">
                                <Package className="w-4 h-4 mr-2" /> View Products
                            </Button>
                        </Link>
                        <Link to="/admin/orders">
                            <Button variant="outline" size="sm" className="bg-white">
                                <ShoppingCart className="w-4 h-4 mr-2" /> View Orders
                            </Button>
                        </Link>
                        <Link to="/admin/settings">
                            <Button variant="outline" size="sm" className="bg-white">
                                Settings
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
