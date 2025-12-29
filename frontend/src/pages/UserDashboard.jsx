import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { User, Package, Settings, LogOut, ChevronRight, ShoppingBag, Clock, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { useAuth, API } from '../App';

const UserDashboard = () => {
    const { user, token, logout } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${API}/api/orders`, { headers: { Authorization: `Bearer ${token}` } });
            setOrders(response.data);
        } catch (error) { console.error('Failed to fetch orders:', error); }
        finally { setLoading(false); }
    };

    const getStatusColor = (status) => {
        const colors = { pending: 'bg-yellow-100 text-yellow-800', processing: 'bg-blue-100 text-blue-800', shipped: 'bg-purple-100 text-purple-800', delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800' };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen pt-20">
            <div className="container-solar py-8">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
                        <div className="bg-card rounded-2xl border p-6 sticky top-24">
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                    <User className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-lg">{user?.name}</h2>
                                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                                </div>
                            </div>
                            <nav className="space-y-2">
                                <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary"><Package className="w-5 h-5" />My Orders</Link>
                                <Link to="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"><Settings className="w-5 h-5" />Settings</Link>
                                <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"><LogOut className="w-5 h-5" />Logout</button>
                            </nav>
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3">
                        <h1 className="text-2xl font-bold mb-6">My Orders</h1>

                        {loading ? (
                            <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="bg-card rounded-xl border p-6 animate-pulse"><div className="h-4 bg-secondary rounded w-1/4 mb-4" /><div className="h-6 bg-secondary rounded w-1/2" /></div>)}</div>
                        ) : orders.length > 0 ? (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div key={order.id} className="bg-card rounded-xl border p-6">
                                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Order #{order.id.slice(-8)}</p>
                                                <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                                        </div>
                                        <div className="space-y-2">
                                            {order.items?.map((item, i) => (
                                                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 bg-secondary rounded-lg" />
                                                        <div>
                                                            <p className="font-medium">{item.name}</p>
                                                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                    <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                            <span className="font-semibold">Total: ₹{order.total_amount?.toLocaleString()}</span>
                                            <Link to={`/order/${order.id}`}><Button variant="outline" size="sm">View Details<ChevronRight className="w-4 h-4 ml-1" /></Button></Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-card rounded-xl border">
                                <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                                <p className="text-muted-foreground mb-6">Start shopping for solar solutions!</p>
                                <Link to="/shop"><Button className="btn-primary">Browse Products</Button></Link>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
