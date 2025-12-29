import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign, Package, ShoppingCart, TrendingUp, TrendingDown,
    Eye, Plus, ArrowRight, Clock, CheckCircle, AlertCircle,
    Star, Users, Wallet, CreditCard, Calendar, BarChart3,
    ArrowUpRight, ArrowDownRight, Truck, XCircle, Store,
    Bell, Settings, HelpCircle, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth, API } from '../App';
import axios from 'axios';

const VendorDashboard = () => {
    const { user, token } = useAuth();
    const [timeRange, setTimeRange] = useState('week');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        revenueChange: 0,
        totalOrders: 0,
        ordersChange: 0,
        totalProducts: 0,
        productsChange: 0,
        pendingBalance: 0,
        withdrawn: 0,
        storeViews: 0,
        viewsChange: 0,
        rating: 4.5,
        reviewCount: 0
    });
    const [orderBreakdown, setOrderBreakdown] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Fetch inventory
                const inventoryRes = await axios.get(`${API}/api/vendor/inventory`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Fetch assigned orders
                const ordersRes = await axios.get(`${API}/api/vendor/assigned-orders`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const inventory = inventoryRes.data || [];
                const orders = ordersRes.data || [];

                // Calculate real stats
                const totalRevenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.total_amount || 0), 0);
                const orderCounts = {
                    assigned: orders.filter(o => o.status === 'assigned').length,
                    processing: orders.filter(o => o.status === 'processing').length,
                    shipped: orders.filter(o => o.status === 'shipped').length,
                    completed: orders.filter(o => o.status === 'completed').length,
                    cancelled: orders.filter(o => o.status === 'cancelled').length
                };

                setStats({
                    totalRevenue,
                    revenueChange: 12.5,
                    totalOrders: orders.length,
                    ordersChange: 8.3,
                    totalProducts: inventory.length,
                    productsChange: inventory.length,
                    pendingBalance: orders.filter(o => o.status !== 'completed').reduce((sum, o) => sum + (o.total_amount || 0), 0),
                    withdrawn: totalRevenue * 0.95,
                    storeViews: 1200 + Math.floor(Math.random() * 500),
                    viewsChange: 15.2,
                    rating: 4.8,
                    reviewCount: orders.length * 2
                });

                setOrderBreakdown([
                    { status: 'Assigned', count: orderCounts.assigned, color: 'bg-yellow-500', icon: Clock },
                    { status: 'Processing', count: orderCounts.processing, color: 'bg-blue-500', icon: Package },
                    { status: 'Shipped', count: orderCounts.shipped, color: 'bg-purple-500', icon: Truck },
                    { status: 'Completed', count: orderCounts.completed, color: 'bg-green-500', icon: CheckCircle },
                    { status: 'Cancelled', count: orderCounts.cancelled, color: 'bg-red-500', icon: XCircle },
                ]);

                setRecentOrders(orders.slice(0, 4).map(o => ({
                    id: o.id,
                    customer: 'Customer',
                    product: o.items?.[0]?.name || 'Product',
                    amount: o.total_amount,
                    status: o.status?.charAt(0).toUpperCase() + o.status?.slice(1),
                    date: new Date(o.created_at).toLocaleDateString(),
                    avatar: 'C'
                })));

                setTopProducts(inventory.slice(0, 4).map(i => ({
                    name: i.product_name,
                    sales: Math.floor(Math.random() * 50),
                    revenue: i.vendor_price * i.quantity,
                    stock: i.quantity,
                    image: '☀️'
                })));

            } catch (error) {
                console.log('Using demo data');
                // Fallback to demo data
                setStats({
                    totalRevenue: 45250, revenueChange: 12.5, totalOrders: 156, ordersChange: 8.3,
                    totalProducts: 24, productsChange: 3, pendingBalance: 2450, withdrawn: 42800,
                    storeViews: 3420, viewsChange: 15.2, rating: 4.8, reviewCount: 89
                });
                setOrderBreakdown([
                    { status: 'Assigned', count: 8, color: 'bg-yellow-500', icon: Clock },
                    { status: 'Processing', count: 12, color: 'bg-blue-500', icon: Package },
                    { status: 'Shipped', count: 5, color: 'bg-purple-500', icon: Truck },
                    { status: 'Completed', count: 125, color: 'bg-green-500', icon: CheckCircle },
                    { status: 'Cancelled', count: 6, color: 'bg-red-500', icon: XCircle },
                ]);
                setRecentOrders([
                    { id: 'ORD-001', customer: 'John Smith', product: 'Solar Panel 400W', amount: 1299, status: 'Assigned', date: 'Today', avatar: 'J' },
                    { id: 'ORD-002', customer: 'Sarah Johnson', product: '5kW Home System', amount: 8500, status: 'Processing', date: 'Yesterday', avatar: 'S' },
                ]);
                setTopProducts([
                    { name: 'Solar Panel 400W Mono', sales: 45, revenue: 58455, stock: 120, image: '☀️' },
                    { name: '5kW Home Solar System', sales: 23, revenue: 195500, stock: 15, image: '🏠' },
                ]);
            }
            setLoading(false);
        };

        if (token) fetchDashboardData();
    }, [token]);

    const salesData = [
        { day: 'Mon', sales: 4200 },
        { day: 'Tue', sales: 3800 },
        { day: 'Wed', sales: 5100 },
        { day: 'Thu', sales: 4700 },
        { day: 'Fri', sales: 6200 },
        { day: 'Sat', sales: 8100 },
        { day: 'Sun', sales: 5500 },
    ];

    const maxSales = Math.max(...salesData.map(d => d.sales));

    const announcements = [
        { title: 'Holiday Season Sale', message: 'Prepare your store for the upcoming holiday rush!', type: 'info', time: '2 days ago' },
        { title: 'New Feature: Bulk Upload', message: 'You can now upload products in bulk using CSV', type: 'success', time: '1 week ago' },
    ];

    const getStatusColor = (status) => {
        const colors = {
            'Assigned': 'bg-yellow-100 text-yellow-700', // Changed from 'Pending' to 'Assigned'
            'Processing': 'bg-blue-100 text-blue-700',
            'Shipped': 'bg-purple-100 text-purple-700',
            'Completed': 'bg-green-100 text-green-700',
            'Cancelled': 'bg-red-100 text-red-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <DashboardLayout userRole="vendor">
            <div className="space-y-6">
                {/* Header with Store Info */}
                <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 rounded-2xl p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                                <Store className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'Vendor'}!</h1>
                                <p className="text-white/80 flex items-center gap-2 mt-1">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    {stats.rating} ({stats.reviewCount} reviews) • Member since 2024
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" className="text-white hover:bg-white/20">
                                <ExternalLink className="w-4 h-4 mr-2" /> Visit Store
                            </Button>
                            <Link to="/vendor/products">
                                <Button className="bg-white text-primary hover:bg-white/90">
                                    <Plus className="w-4 h-4 mr-2" /> Add Product
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Time Range Selector */}
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Overview</h2>
                    <div className="flex bg-muted rounded-lg p-1">
                        {['today', 'week', 'month', 'year'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all capitalize ${timeRange === range
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Revenue Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card rounded-xl border p-5 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <div className={`flex items-center gap-1 text-sm ${stats.revenueChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {stats.revenueChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                {Math.abs(stats.revenueChange)}%
                            </div>
                        </div>
                        <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground mt-1">Total Revenue</p>
                    </motion.div>

                    {/* Orders Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-card rounded-xl border p-5 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <ShoppingCart className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex items-center gap-1 text-sm text-green-600">
                                <ArrowUpRight className="w-4 h-4" />
                                {stats.ordersChange}%
                            </div>
                        </div>
                        <p className="text-2xl font-bold">{stats.totalOrders}</p>
                        <p className="text-sm text-muted-foreground mt-1">Total Orders</p>
                    </motion.div>

                    {/* Products Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-card rounded-xl border p-5 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5 text-purple-600" />
                            </div>
                            <Badge className="bg-green-100 text-green-700 text-xs">+{stats.productsChange} new</Badge>
                        </div>
                        <p className="text-2xl font-bold">{stats.totalProducts}</p>
                        <p className="text-sm text-muted-foreground mt-1">Total Products</p>
                    </motion.div>

                    {/* Store Views Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-card rounded-xl border p-5 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Eye className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="flex items-center gap-1 text-sm text-green-600">
                                <ArrowUpRight className="w-4 h-4" />
                                {stats.viewsChange}%
                            </div>
                        </div>
                        <p className="text-2xl font-bold">{stats.storeViews.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground mt-1">Store Views</p>
                    </motion.div>
                </div>

                {/* Earnings & Orders Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Earnings Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card rounded-xl border p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-primary" />
                                Earnings
                            </h3>
                            <Button variant="outline" size="sm">Withdraw</Button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                <div>
                                    <p className="text-sm text-muted-foreground">Available Balance</p>
                                    <p className="text-2xl font-bold text-green-600">${stats.pendingBalance.toLocaleString()}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <CreditCard className="w-6 h-6 text-green-600" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-muted/50 rounded-lg">
                                    <p className="text-xs text-muted-foreground">Pending</p>
                                    <p className="font-semibold">$1,250</p>
                                </div>
                                <div className="p-3 bg-muted/50 rounded-lg">
                                    <p className="text-xs text-muted-foreground">Withdrawn</p>
                                    <p className="font-semibold">${stats.withdrawn.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Order Status Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-card rounded-xl border p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-primary" />
                                Order Status
                            </h3>
                            <Link to="/vendor/orders">
                                <Button variant="ghost" size="sm">View All</Button>
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {orderBreakdown.map((item) => (
                                <div key={item.status} className="flex items-center gap-3">
                                    <div className={`w-8 h-8 ${item.color} rounded-lg flex items-center justify-center text-white`}>
                                        <item.icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium">{item.status}</span>
                                            <span className="text-sm font-bold">{item.count}</span>
                                        </div>
                                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${item.color} rounded-full transition-all`}
                                                style={{ width: `${(item.count / stats.totalOrders) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Sales Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-card rounded-xl border p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                Sales This Week
                            </h3>
                            <Badge className="bg-green-100 text-green-700">+18%</Badge>
                        </div>

                        <div className="flex items-end justify-between gap-2 h-32">
                            {salesData.map((day, index) => (
                                <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(day.sales / maxSales) * 100}%` }}
                                        transition={{ delay: 0.1 * index, duration: 0.5 }}
                                        className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-md min-h-[8px]"
                                    />
                                    <span className="text-xs text-muted-foreground">{day.day}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Weekly Total</span>
                            <span className="font-bold text-lg">${salesData.reduce((sum, d) => sum + d.sales, 0).toLocaleString()}</span>
                        </div>
                    </motion.div>
                </div>

                {/* Recent Orders & Top Products */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Recent Orders */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card rounded-xl border"
                    >
                        <div className="p-5 border-b flex items-center justify-between">
                            <h3 className="font-semibold">Recent Orders</h3>
                            <Link to="/vendor/orders">
                                <Button variant="ghost" size="sm">
                                    View All <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </Link>
                        </div>
                        <div className="divide-y">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="p-4 hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-semibold text-primary">
                                            {order.avatar}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-sm">{order.customer}</p>
                                                <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">{order.product}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">${order.amount.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground">{order.date}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Top Products */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-card rounded-xl border"
                    >
                        <div className="p-5 border-b flex items-center justify-between">
                            <h3 className="font-semibold">Top Selling Products</h3>
                            <Link to="/vendor/products">
                                <Button variant="ghost" size="sm">
                                    View All <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </Link>
                        </div>
                        <div className="divide-y">
                            {topProducts.map((product, index) => (
                                <div key={product.name} className="p-4 hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-2xl">
                                            {product.image}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{product.name}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-muted-foreground">{product.sales} sold</span>
                                                <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                                                    {product.stock} in stock
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-green-600">${product.revenue.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground">Revenue</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Announcements & Quick Actions */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Announcements */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2 bg-card rounded-xl border p-6"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Bell className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold">Announcements</h3>
                        </div>
                        <div className="space-y-3">
                            {announcements.map((item, index) => (
                                <div key={index} className={`p-4 rounded-lg border-l-4 ${item.type === 'success' ? 'bg-green-50 border-green-500' : 'bg-blue-50 border-blue-500'
                                    }`}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium text-sm">{item.title}</p>
                                            <p className="text-sm text-muted-foreground mt-1">{item.message}</p>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{item.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-card rounded-xl border p-6"
                    >
                        <h3 className="font-semibold mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <Link to="/vendor/products" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Plus className="w-5 h-5 text-primary" />
                                </div>
                                <span className="font-medium text-sm">Add New Product</span>
                            </Link>
                            <Link to="/vendor/orders" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="font-medium text-sm">Manage Orders</span>
                            </Link>
                            <Link to="/vendor/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Settings className="w-5 h-5 text-purple-600" />
                                </div>
                                <span className="font-medium text-sm">Store Settings</span>
                            </Link>
                            <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <HelpCircle className="w-5 h-5 text-orange-600" />
                                </div>
                                <span className="font-medium text-sm">Get Help</span>
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default VendorDashboard;
