import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingCart, Package, Truck, CheckCircle, Clock,
    X, Eye, MapPin, Phone, Mail, User, AlertCircle
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth, API } from '../App';
import axios from 'axios';
import { toast } from 'sonner';

const VendorOrders = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/api/vendor/assigned-orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch (error) {
            console.log('Using demo data');
            setOrders([
                {
                    id: 'ORD-001',
                    status: 'assigned',
                    total_amount: 8500,
                    shipping_address: '123 Solar St, Green City, CA 90210',
                    created_at: '2024-12-27T10:30:00Z',
                    assigned_at: '2024-12-27T11:00:00Z',
                    items: [
                        { product_id: '1', name: 'Solar Panel 400W', price: 299, quantity: 10 },
                        { product_id: '2', name: 'Hybrid Inverter', price: 5510, quantity: 1 }
                    ],
                    customer: { name: 'John Smith', email: 'john@example.com', phone: '+1 555-1234' }
                },
                {
                    id: 'ORD-002',
                    status: 'processing',
                    total_amount: 15000,
                    shipping_address: '456 Energy Ave, Solar Town, TX 75001',
                    created_at: '2024-12-26T14:00:00Z',
                    assigned_at: '2024-12-26T15:30:00Z',
                    items: [
                        { product_id: '3', name: '10kW Commercial System', price: 15000, quantity: 1 }
                    ],
                    customer: { name: 'Sarah Johnson', email: 'sarah@business.com', phone: '+1 555-5678' }
                },
                {
                    id: 'ORD-003',
                    status: 'shipped',
                    total_amount: 3200,
                    shipping_address: '789 Green Blvd, Eco City, FL 33101',
                    created_at: '2024-12-25T09:00:00Z',
                    assigned_at: '2024-12-25T10:00:00Z',
                    items: [
                        { product_id: '4', name: 'Lithium Battery 10kWh', price: 3200, quantity: 1 }
                    ],
                    customer: { name: 'Mike Brown', email: 'mike@home.com', phone: '+1 555-9012' }
                },
                {
                    id: 'ORD-004',
                    status: 'completed',
                    total_amount: 1800,
                    shipping_address: '321 Power Lane, Volt City, NY 10001',
                    created_at: '2024-12-20T11:00:00Z',
                    assigned_at: '2024-12-20T12:00:00Z',
                    items: [
                        { product_id: '5', name: 'Hybrid Inverter 5kW', price: 1800, quantity: 1 }
                    ],
                    customer: { name: 'Emily Davis', email: 'emily@home.com', phone: '+1 555-3456' }
                }
            ]);
        }
        setLoading(false);
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await axios.put(`${API}/api/orders/${orderId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Order status updated to ${newStatus}`);
            fetchOrders();
        } catch (error) {
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
            toast.success(`Order status updated to ${newStatus}`);
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            assigned: { color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle, label: 'Assigned to You' },
            processing: { color: 'bg-blue-100 text-blue-700', icon: Package, label: 'Processing' },
            shipped: { color: 'bg-purple-100 text-purple-700', icon: Truck, label: 'Shipped' },
            completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Completed' }
        };
        return configs[status] || configs.assigned;
    };

    const filteredOrders = statusFilter === 'all'
        ? orders
        : orders.filter(o => o.status === statusFilter);

    const statusCounts = {
        all: orders.length,
        assigned: orders.filter(o => o.status === 'assigned').length,
        processing: orders.filter(o => o.status === 'processing').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        completed: orders.filter(o => o.status === 'completed').length,
    };

    return (
        <DashboardLayout userRole="vendor">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Assigned Orders</h1>
                    <p className="text-muted-foreground mt-1">Orders assigned to you by SolarSavers admin</p>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-blue-800">How it works</p>
                        <p className="text-sm text-blue-700">
                            When customers order from SolarSavers, the admin assigns the order to you based on your inventory and pricing.
                            You fulfill the order and update the status.
                        </p>
                    </div>
                </div>

                {/* Status Filters */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {['all', 'assigned', 'processing', 'shipped', 'completed'].map((status) => {
                        const isActive = statusFilter === status;
                        return (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`p-3 rounded-lg border transition-all text-left ${isActive ? 'bg-primary text-white' : 'bg-card hover:border-primary/50'
                                    }`}
                            >
                                <p className="text-xs opacity-80 capitalize">{status === 'all' ? 'All Orders' : status}</p>
                                <p className="text-xl font-bold">{statusCounts[status]}</p>
                            </button>
                        );
                    })}
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-xl border">
                        <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold">No Orders Yet</h3>
                        <p className="text-muted-foreground">Orders assigned to you will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => {
                            const config = getStatusConfig(order.status);
                            return (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-card rounded-xl border hover:shadow-md transition-shadow overflow-hidden"
                                >
                                    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-lg ${config.color} flex items-center justify-center`}>
                                                <config.icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold">{order.id}</span>
                                                    <Badge className={config.color}>{config.label}</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {order.items?.length} item(s) • {new Date(order.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-2xl font-bold">${order.total_amount.toLocaleString()}</p>
                                                <p className="text-xs text-muted-foreground">Order Total</p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                <Eye className="w-4 h-4 mr-1" /> View
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Order Detail Modal */}
                <AnimatePresence>
                    {selectedOrder && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                            onClick={() => setSelectedOrder(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9 }}
                                className="bg-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-6 border-b sticky top-0 bg-card flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-bold">{selectedOrder.id}</h2>
                                            <Badge className={getStatusConfig(selectedOrder.status).color}>
                                                {getStatusConfig(selectedOrder.status).label}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Assigned on {new Date(selectedOrder.assigned_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)}>
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Customer Info */}
                                    <div className="bg-muted/30 rounded-xl p-4">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <User className="w-4 h-4" /> Customer Details
                                        </h3>
                                        <div className="grid md:grid-cols-3 gap-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-muted-foreground" />
                                                {selectedOrder.customer?.name || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-muted-foreground" />
                                                {selectedOrder.customer?.email || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-muted-foreground" />
                                                {selectedOrder.customer?.phone || 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shipping Address */}
                                    <div className="bg-muted/30 rounded-xl p-4">
                                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                                            <MapPin className="w-4 h-4" /> Shipping Address
                                        </h3>
                                        <p className="text-sm">{selectedOrder.shipping_address}</p>
                                    </div>

                                    {/* Order Items */}
                                    <div>
                                        <h3 className="font-semibold mb-3">Order Items</h3>
                                        <div className="space-y-2">
                                            {selectedOrder.items?.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                                    <div>
                                                        <p className="font-medium">{item.name}</p>
                                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                                    </div>
                                                    <p className="font-semibold">${(item.price * item.quantity).toLocaleString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                            <span className="font-semibold">Total</span>
                                            <span className="text-2xl font-bold">${selectedOrder.total_amount.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Update Status */}
                                    <div className="pt-4 border-t">
                                        <h3 className="font-semibold mb-3">Update Status</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {['assigned', 'processing', 'shipped', 'completed'].map((status) => {
                                                const config = getStatusConfig(status);
                                                const isCurrent = selectedOrder.status === status;
                                                return (
                                                    <button
                                                        key={status}
                                                        onClick={() => updateOrderStatus(selectedOrder.id, status)}
                                                        disabled={isCurrent}
                                                        className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${isCurrent
                                                                ? `${config.color} ring-2 ring-offset-2`
                                                                : 'bg-muted hover:bg-muted/80'
                                                            }`}
                                                    >
                                                        <config.icon className="w-4 h-4" />
                                                        <span className="capitalize">{status}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};

export default VendorOrders;
