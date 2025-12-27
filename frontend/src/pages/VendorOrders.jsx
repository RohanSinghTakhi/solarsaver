import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingCart, Clock, Truck, CheckCircle, XCircle, Eye,
    Package, User, MapPin, Phone, X, ArrowRight
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DataTable from '../components/dashboard/DataTable';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth, API } from '../App';
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
        // Demo data
        setOrders([
            {
                id: 'ORD-001',
                customer: { name: 'John Smith', email: 'john@example.com', phone: '+1 234 567 890' },
                products: [{ name: 'Solar Panel 400W', quantity: 12, price: 299 }],
                total: 3588,
                status: 'Pending',
                payment_status: 'Paid',
                shipping_address: '123 Green Street, Solar City, SC 12345',
                created_at: '2024-12-27T10:30:00',
                updated_at: '2024-12-27T10:30:00'
            },
            {
                id: 'ORD-002',
                customer: { name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1 345 678 901' },
                products: [{ name: '5kW Complete Home Solar System', quantity: 1, price: 8500 }],
                total: 8500,
                status: 'Processing',
                payment_status: 'Paid',
                shipping_address: '456 Sun Avenue, Bright City, BC 67890',
                created_at: '2024-12-26T14:20:00',
                updated_at: '2024-12-27T09:15:00'
            },
            {
                id: 'ORD-003',
                customer: { name: 'Mike Brown', email: 'mike@example.com', phone: '+1 456 789 012' },
                products: [{ name: '10kW Commercial Solar Array', quantity: 1, price: 15000 }],
                total: 15000,
                status: 'Shipped',
                payment_status: 'Paid',
                shipping_address: '789 Power Blvd, Energy Town, ET 11223',
                created_at: '2024-12-25T09:00:00',
                updated_at: '2024-12-26T16:45:00'
            },
            {
                id: 'ORD-004',
                customer: { name: 'Emily Davis', email: 'emily@example.com', phone: '+1 567 890 123' },
                products: [
                    { name: 'Lithium Battery 10kWh', quantity: 2, price: 3200 },
                    { name: 'Hybrid Inverter 5kW', quantity: 1, price: 1800 }
                ],
                total: 8200,
                status: 'Completed',
                payment_status: 'Paid',
                shipping_address: '321 Volt Lane, Current City, CC 44556',
                created_at: '2024-12-24T11:45:00',
                updated_at: '2024-12-27T08:00:00'
            },
            {
                id: 'ORD-005',
                customer: { name: 'Chris Wilson', email: 'chris@example.com', phone: '+1 678 901 234' },
                products: [{ name: 'Solar Panel 400W', quantity: 6, price: 299 }],
                total: 1794,
                status: 'Cancelled',
                payment_status: 'Refunded',
                shipping_address: '654 Watt Road, Amp City, AC 77889',
                created_at: '2024-12-23T16:30:00',
                updated_at: '2024-12-24T10:00:00'
            },
        ]);
        setLoading(false);
    };

    const getStatusConfig = (status) => {
        const config = {
            'Pending': { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
            'Processing': { color: 'bg-blue-100 text-blue-700', icon: Package },
            'Shipped': { color: 'bg-purple-100 text-purple-700', icon: Truck },
            'Completed': { color: 'bg-green-100 text-green-700', icon: CheckCircle },
            'Cancelled': { color: 'bg-red-100 text-red-700', icon: XCircle },
        };
        return config[status] || config['Pending'];
    };

    const updateOrderStatus = (orderId, newStatus) => {
        setOrders(orders.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
        ));
        if (selectedOrder && selectedOrder.id === orderId) {
            setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        toast.success(`Order ${orderId} status updated to ${newStatus}`);
    };

    const statusOptions = ['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'];

    const filteredOrders = statusFilter === 'all'
        ? orders
        : orders.filter(o => o.status === statusFilter);

    const columns = [
        {
            key: 'id',
            label: 'Order ID',
            render: (value) => <span className="font-mono font-medium">{value}</span>
        },
        {
            key: 'customer',
            label: 'Customer',
            render: (value) => (
                <div>
                    <p className="font-medium">{value.name}</p>
                    <p className="text-xs text-muted-foreground">{value.email}</p>
                </div>
            )
        },
        {
            key: 'products',
            label: 'Items',
            render: (value) => (
                <div>
                    <p className="font-medium">{value.length} item{value.length > 1 ? 's' : ''}</p>
                    <p className="text-xs text-muted-foreground">{value[0].name}</p>
                </div>
            )
        },
        {
            key: 'total',
            label: 'Total',
            render: (value) => <span className="font-semibold">${value.toLocaleString()}</span>
        },
        {
            key: 'status',
            label: 'Status',
            render: (value) => {
                const config = getStatusConfig(value);
                return (
                    <Badge className={`${config.color} gap-1`}>
                        <config.icon className="w-3 h-3" />
                        {value}
                    </Badge>
                );
            }
        },
        {
            key: 'created_at',
            label: 'Date',
            render: (value) => new Date(value).toLocaleDateString()
        }
    ];

    const tableActions = [
        {
            label: 'View Details',
            icon: Eye,
            onClick: (row) => setSelectedOrder(row)
        }
    ];

    return (
        <DashboardLayout userRole="vendor">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Orders</h1>
                        <p className="text-muted-foreground mt-1">Manage and track customer orders</p>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {['all', ...statusOptions.slice(0, 4)].map((status) => {
                        const count = status === 'all' ? orders.length : orders.filter(o => o.status === status).length;
                        const isActive = statusFilter === status;
                        return (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`bg-card rounded-lg border p-4 text-left transition-all ${isActive ? 'ring-2 ring-primary' : 'hover:border-primary/50'
                                    }`}
                            >
                                <p className="text-sm text-muted-foreground capitalize">{status === 'all' ? 'All Orders' : status}</p>
                                <p className="text-2xl font-bold">{count}</p>
                            </button>
                        );
                    })}
                </div>

                {/* Orders Table */}
                <DataTable
                    columns={columns}
                    data={filteredOrders}
                    actions={tableActions}
                    searchPlaceholder="Search orders..."
                    onRowClick={(row) => setSelectedOrder(row)}
                />

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
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-card">
                                    <div>
                                        <h2 className="text-xl font-bold">Order {selectedOrder.id}</h2>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(selectedOrder.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)}>
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Status Update */}
                                    <div className="bg-muted/30 rounded-xl p-4">
                                        <p className="text-sm font-medium mb-3">Update Status</p>
                                        <div className="flex flex-wrap gap-2">
                                            {statusOptions.map((status) => {
                                                const config = getStatusConfig(status);
                                                const isActive = selectedOrder.status === status;
                                                return (
                                                    <button
                                                        key={status}
                                                        onClick={() => updateOrderStatus(selectedOrder.id, status)}
                                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-all ${isActive
                                                                ? config.color + ' ring-2 ring-offset-2'
                                                                : 'bg-card border hover:border-primary'
                                                            }`}
                                                    >
                                                        <config.icon className="w-4 h-4" />
                                                        {status}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Customer Info */}
                                    <div className="bg-muted/30 rounded-xl p-4">
                                        <p className="text-sm font-medium mb-3 flex items-center gap-2">
                                            <User className="w-4 h-4" /> Customer Information
                                        </p>
                                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Name</p>
                                                <p className="font-medium">{selectedOrder.customer.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Email</p>
                                                <p className="font-medium">{selectedOrder.customer.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Phone</p>
                                                <p className="font-medium">{selectedOrder.customer.phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Payment</p>
                                                <Badge className="bg-green-100 text-green-700">{selectedOrder.payment_status}</Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shipping Address */}
                                    <div className="bg-muted/30 rounded-xl p-4">
                                        <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                            <MapPin className="w-4 h-4" /> Shipping Address
                                        </p>
                                        <p className="text-sm">{selectedOrder.shipping_address}</p>
                                    </div>

                                    {/* Order Items */}
                                    <div>
                                        <p className="text-sm font-medium mb-3 flex items-center gap-2">
                                            <Package className="w-4 h-4" /> Order Items
                                        </p>
                                        <div className="space-y-3">
                                            {selectedOrder.products.map((product, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                                    <div>
                                                        <p className="font-medium">{product.name}</p>
                                                        <p className="text-sm text-muted-foreground">Qty: {product.quantity}</p>
                                                    </div>
                                                    <p className="font-semibold">${(product.price * product.quantity).toLocaleString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="flex items-center justify-between p-4 bg-primary/10 rounded-xl">
                                        <p className="font-semibold">Order Total</p>
                                        <p className="text-2xl font-bold text-primary">${selectedOrder.total.toLocaleString()}</p>
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
