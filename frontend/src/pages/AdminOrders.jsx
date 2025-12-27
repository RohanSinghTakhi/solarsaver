import React, { useState } from 'react';
import { ShoppingCart, Eye, Clock, Truck, CheckCircle, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DataTable from '../components/dashboard/DataTable';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

const AdminOrders = () => {
    const [orders, setOrders] = useState([
        { id: 'ORD-001', customer: 'John Smith', vendor: 'SunPower Solar', total: 3588, status: 'Pending', date: '2024-12-27' },
        { id: 'ORD-002', customer: 'Sarah Johnson', vendor: 'Tesla Energy', total: 8500, status: 'Processing', date: '2024-12-26' },
        { id: 'ORD-003', customer: 'Mike Brown', vendor: 'LG Solar Shop', total: 15000, status: 'Shipped', date: '2024-12-25' },
        { id: 'ORD-004', customer: 'Emily Davis', vendor: 'Tesla Energy', total: 8200, status: 'Completed', date: '2024-12-24' },
        { id: 'ORD-005', customer: 'Chris Wilson', vendor: 'Canadian Solar', total: 1794, status: 'Cancelled', date: '2024-12-23' },
        { id: 'ORD-006', customer: 'Lisa Taylor', vendor: 'SunPower Solar', total: 4500, status: 'Pending', date: '2024-12-27' },
        { id: 'ORD-007', customer: 'David Lee', vendor: 'LG Solar Shop', total: 2200, status: 'Completed', date: '2024-12-22' },
    ]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');

    const getStatusConfig = (status) => {
        const config = {
            Pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
            Processing: { color: 'bg-blue-100 text-blue-700', icon: ShoppingCart },
            Shipped: { color: 'bg-purple-100 text-purple-700', icon: Truck },
            Completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
            Cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle }
        };
        return config[status] || config.Pending;
    };

    const updateStatus = (orderId, newStatus) => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        toast.success(`Order status updated to ${newStatus}`);
    };

    const filteredOrders = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter);

    const columns = [
        { key: 'id', label: 'Order ID', render: (value) => <span className="font-mono font-medium">{value}</span> },
        { key: 'customer', label: 'Customer' },
        { key: 'vendor', label: 'Vendor' },
        { key: 'total', label: 'Total', render: (value) => <span className="font-semibold">${value.toLocaleString()}</span> },
        {
            key: 'status',
            label: 'Status',
            render: (value) => {
                const c = getStatusConfig(value);
                return <Badge className={`${c.color} gap-1`}><c.icon className="w-3 h-3" />{value}</Badge>;
            }
        },
        { key: 'date', label: 'Date' }
    ];

    const tableActions = [{ label: 'View Details', icon: Eye, onClick: (row) => setSelectedOrder(row) }];

    const statusOptions = ['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'];

    return (
        <DashboardLayout userRole="admin">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">All Orders</h1>
                    <p className="text-muted-foreground mt-1">Platform-wide order management</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {['all', ...statusOptions].map((status) => {
                        const count = status === 'all' ? orders.length : orders.filter(o => o.status === status).length;
                        return (
                            <button key={status} onClick={() => setStatusFilter(status)} className={`bg-card rounded-lg border p-3 text-left transition-all ${statusFilter === status ? 'ring-2 ring-primary' : 'hover:border-primary/50'}`}>
                                <p className="text-xs text-muted-foreground">{status === 'all' ? 'All' : status}</p>
                                <p className="text-xl font-bold">{count}</p>
                            </button>
                        );
                    })}
                </div>

                <DataTable columns={columns} data={filteredOrders} actions={tableActions} searchPlaceholder="Search orders..." onRowClick={(row) => setSelectedOrder(row)} />

                <AnimatePresence>
                    {selectedOrder && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
                            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-card rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                                <div className="p-6 border-b flex items-center justify-between">
                                    <h2 className="text-xl font-bold">Order {selectedOrder.id}</h2>
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)}><X className="w-5 h-5" /></Button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div><p className="text-muted-foreground">Customer</p><p className="font-medium">{selectedOrder.customer}</p></div>
                                        <div><p className="text-muted-foreground">Vendor</p><p className="font-medium">{selectedOrder.vendor}</p></div>
                                        <div><p className="text-muted-foreground">Total</p><p className="font-bold text-lg">${selectedOrder.total.toLocaleString()}</p></div>
                                        <div><p className="text-muted-foreground">Date</p><p className="font-medium">{selectedOrder.date}</p></div>
                                    </div>
                                    <div className="pt-4 border-t">
                                        <p className="text-sm font-medium mb-2">Update Status</p>
                                        <div className="flex flex-wrap gap-2">
                                            {statusOptions.map((status) => {
                                                const c = getStatusConfig(status);
                                                return (
                                                    <button key={status} onClick={() => { updateStatus(selectedOrder.id, status); setSelectedOrder({ ...selectedOrder, status }); }}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${selectedOrder.status === status ? c.color + ' ring-2' : 'bg-muted hover:bg-muted/80'}`}>
                                                        <c.icon className="w-3 h-3" /> {status}
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

export default AdminOrders;
