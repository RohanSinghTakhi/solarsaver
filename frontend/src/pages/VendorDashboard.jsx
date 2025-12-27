import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign, Package, ShoppingCart, TrendingUp,
    Eye, Plus, ArrowRight, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import StatsCard from '../components/dashboard/StatsCard';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth, API } from '../App';
import axios from 'axios';

const VendorDashboard = () => {
    const { user, token } = useAuth();
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        pendingOrders: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch vendor stats
            const statsRes = await axios.get(`${API}/vendor/dashboard-stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (statsRes.data) {
                setStats(statsRes.data);
            }
        } catch (error) {
            console.log('Using demo data');
            // Demo data
            setStats({
                totalRevenue: 45250,
                totalOrders: 156,
                totalProducts: 24,
                pendingOrders: 8
            });
            setRecentOrders([
                { id: 'ORD-001', customer: 'John Smith', product: 'Solar Panel 400W', amount: 1299, status: 'Pending', date: '2024-12-27' },
                { id: 'ORD-002', customer: 'Sarah Johnson', product: '5kW Home System', amount: 8500, status: 'Processing', date: '2024-12-26' },
                { id: 'ORD-003', customer: 'Mike Brown', product: '10kW Commercial', amount: 15000, status: 'Completed', date: '2024-12-25' },
                { id: 'ORD-004', customer: 'Emily Davis', product: 'Battery Storage', amount: 3200, status: 'Pending', date: '2024-12-25' },
                { id: 'ORD-005', customer: 'Chris Wilson', product: 'Inverter 5kW', amount: 1800, status: 'Shipped', date: '2024-12-24' },
            ]);
            setTopProducts([
                { name: 'Solar Panel 400W Monocrystalline', sales: 45, revenue: 58455 },
                { name: '5kW Home Solar System', sales: 23, revenue: 195500 },
                { name: 'Lithium Battery 10kWh', sales: 18, revenue: 57600 },
                { name: 'Hybrid Inverter 5kW', sales: 32, revenue: 57600 },
            ]);
        }
        setLoading(false);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Pending': { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
            'Processing': { color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
            'Shipped': { color: 'bg-purple-100 text-purple-700', icon: Package },
            'Completed': { color: 'bg-green-100 text-green-700', icon: CheckCircle },
        };
        const config = statusConfig[status] || statusConfig['Pending'];
        return (
            <Badge className={`${config.color} gap-1`}>
                <config.icon className="w-3 h-3" />
                {status}
            </Badge>
        );
    };

    return (
        <DashboardLayout userRole="vendor">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {user?.name || 'Vendor'}!</h1>
                        <p className="text-muted-foreground mt-1">Here's what's happening with your store today.</p>
                    </div>
                    <Link to="/vendor/products">
                        <Button className="btn-primary">
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Product
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Total Revenue"
                        value={`$${stats.totalRevenue.toLocaleString()}`}
                        change="+12.5% from last month"
                        changeType="increase"
                        icon={DollarSign}
                        color="green"
                    />
                    <StatsCard
                        title="Total Orders"
                        value={stats.totalOrders}
                        change="+8% from last month"
                        changeType="increase"
                        icon={ShoppingCart}
                        color="blue"
                    />
                    <StatsCard
                        title="Total Products"
                        value={stats.totalProducts}
                        change="+3 new this month"
                        changeType="increase"
                        icon={Package}
                        color="purple"
                    />
                    <StatsCard
                        title="Pending Orders"
                        value={stats.pendingOrders}
                        change="Needs attention"
                        changeType="decrease"
                        icon={Clock}
                        color="orange"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Recent Orders */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2 bg-card rounded-xl border shadow-sm"
                    >
                        <div className="p-4 md:p-6 border-b flex items-center justify-between">
                            <h2 className="font-semibold text-lg">Recent Orders</h2>
                            <Link to="/vendor/orders">
                                <Button variant="ghost" size="sm">
                                    View All <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Order ID</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Customer</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Product</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Amount</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order, index) => (
                                        <tr key={order.id} className="border-t hover:bg-muted/30">
                                            <td className="px-4 py-3 text-sm font-medium">{order.id}</td>
                                            <td className="px-4 py-3 text-sm">{order.customer}</td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">{order.product}</td>
                                            <td className="px-4 py-3 text-sm font-medium">${order.amount.toLocaleString()}</td>
                                            <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* Top Products */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-card rounded-xl border shadow-sm"
                    >
                        <div className="p-4 md:p-6 border-b flex items-center justify-between">
                            <h2 className="font-semibold text-lg">Top Products</h2>
                            <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="p-4 space-y-4">
                            {topProducts.map((product, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{product.name}</p>
                                        <p className="text-xs text-muted-foreground">{product.sales} sales</p>
                                    </div>
                                    <p className="font-semibold text-sm text-green-600">${product.revenue.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 border"
                >
                    <h3 className="font-semibold mb-4">Quick Actions</h3>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/vendor/products">
                            <Button variant="outline" size="sm" className="bg-white">
                                <Plus className="w-4 h-4 mr-2" /> Add Product
                            </Button>
                        </Link>
                        <Link to="/vendor/orders">
                            <Button variant="outline" size="sm" className="bg-white">
                                <ShoppingCart className="w-4 h-4 mr-2" /> View Orders
                            </Button>
                        </Link>
                        <Link to="/vendor/profile">
                            <Button variant="outline" size="sm" className="bg-white">
                                <Eye className="w-4 h-4 mr-2" /> Edit Profile
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </DashboardLayout>
    );
};

export default VendorDashboard;
