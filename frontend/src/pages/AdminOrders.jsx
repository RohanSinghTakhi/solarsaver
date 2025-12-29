import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingCart, Package, Truck, CheckCircle, Clock, XCircle,
    X, Eye, Users, DollarSign, MapPin, AlertCircle, UserCheck
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DataTable from '../components/dashboard/DataTable';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { useAuth, API } from '../App';
import axios from 'axios';
import { toast } from 'sonner';

const AdminOrders = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [availableVendors, setAvailableVendors] = useState([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assignmentNotes, setAssignmentNotes] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/api/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch (error) {
            console.log('Using demo data');
            setOrders([
                { id: 'ORD-001', user_id: 'u1', status: 'pending', total_amount: 8500, shipping_address: '123 Solar St, Green City, CA', created_at: '2024-12-27T10:30:00Z', items: [{ product_id: '1', name: 'Solar Panel 400W', quantity: 10 }] },
                { id: 'ORD-002', user_id: 'u2', status: 'pending', total_amount: 15000, shipping_address: '456 Energy Ave, TX', created_at: '2024-12-26T14:00:00Z', items: [{ product_id: '3', name: '10kW Commercial', quantity: 1 }] },
                { id: 'ORD-003', user_id: 'u3', status: 'assigned', total_amount: 3200, shipping_address: '789 Green Blvd, FL', created_at: '2024-12-25T09:00:00Z', assigned_vendor_id: 'v1', assigned_vendor_name: 'SunPower Vendor', items: [{ product_id: '4', name: 'Battery 10kWh', quantity: 1 }] },
                { id: 'ORD-004', user_id: 'u4', status: 'processing', total_amount: 1800, shipping_address: '321 Power Lane, NY', created_at: '2024-12-24T11:00:00Z', assigned_vendor_id: 'v2', assigned_vendor_name: 'Tesla Vendor', items: [{ product_id: '5', name: 'Inverter 5kW', quantity: 1 }] },
                { id: 'ORD-005', user_id: 'u5', status: 'shipped', total_amount: 25000, shipping_address: '555 Eco Way, WA', created_at: '2024-12-23T08:00:00Z', assigned_vendor_id: 'v1', assigned_vendor_name: 'SunPower Vendor', items: [{ product_id: '3', name: '10kW Commercial', quantity: 1 }] },
                { id: 'ORD-006', user_id: 'u6', status: 'completed', total_amount: 4500, shipping_address: '777 Solar Dr, AZ', created_at: '2024-12-20T15:00:00Z', assigned_vendor_id: 'v3', assigned_vendor_name: 'LG Vendor', items: [{ product_id: '1', name: 'Solar Panel 400W', quantity: 15 }] },
            ]);
        }
        setLoading(false);
    };

    const fetchAvailableVendors = async (orderId) => {
        try {
            const res = await axios.get(`${API}/api/admin/orders/${orderId}/available-vendors`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAvailableVendors(res.data.available_vendors);
        } catch (error) {
            // Demo vendors
            setAvailableVendors([
                { vendor_id: 'v1', vendor_name: 'SunPower Vendor', total_vendor_price: 7200, location: 'California', email: 'sunpower@vendor.com' },
                { vendor_id: 'v2', vendor_name: 'Tesla Energy Store', total_vendor_price: 7500, location: 'Texas', email: 'tesla@vendor.com' },
                { vendor_id: 'v3', vendor_name: 'LG Solar Shop', total_vendor_price: 7800, location: 'New York', email: 'lg@vendor.com' },
            ]);
        }
    };

    const handleAssignClick = async (order) => {
        setSelectedOrder(order);
        await fetchAvailableVendors(order.id);
        setShowAssignModal(true);
    };

    const handleAssignVendor = async (vendorId, vendorName) => {
        try {
            await axios.put(`${API}/api/admin/orders/${selectedOrder.id}/assign`,
                { vendor_id: vendorId, assignment_notes: assignmentNotes },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Order assigned to ${vendorName}`);
            setShowAssignModal(false);
            fetchOrders();
        } catch (error) {
            // Demo mode
            setOrders(orders.map(o =>
                o.id === selectedOrder.id
                    ? { ...o, status: 'assigned', assigned_vendor_id: vendorId, assigned_vendor_name: vendorName }
                    : o
            ));
            toast.success(`Order assigned to ${vendorName}`);
            setShowAssignModal(false);
        }
        setAssignmentNotes('');
    };

    const getStatusConfig = (status) => {
        const configs = {
            pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Pending Assignment' },
            assigned: { color: 'bg-orange-100 text-orange-700', icon: UserCheck, label: 'Assigned' },
            processing: { color: 'bg-blue-100 text-blue-700', icon: Package, label: 'Processing' },
            shipped: { color: 'bg-purple-100 text-purple-700', icon: Truck, label: 'Shipped' },
            completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Completed' },
            cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Cancelled' }
        };
        return configs[status] || configs.pending;
    };

    const filteredOrders = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter);
    const pendingCount = orders.filter(o => o.status === 'pending').length;

    // Helper to get short order ID (6 chars)
    const getShortId = (id) => id?.substring(0, 6).toUpperCase() || id;

    // Check if vendor can be edited (not shipped, delivered, or completed)
    const canEditVendor = (status) => !['shipped', 'delivered', 'completed'].includes(status);

    const columns = [
        { key: 'id', label: 'Order ID', render: (v) => <span className="font-mono font-medium text-primary">#{getShortId(v)}</span> },
        { key: 'total_amount', label: 'Total', render: (v) => <span className="font-semibold">₹{v?.toLocaleString()}</span> },
        {
            key: 'status',
            label: 'Status',
            render: (v) => {
                const c = getStatusConfig(v);
                return <Badge className={`${c.color} gap-1`}><c.icon className="w-3 h-3" />{c.label}</Badge>;
            }
        },
        {
            key: 'assigned_vendor_name',
            label: 'Vendor',
            render: (v, row) => v ? (
                <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-700">
                        <UserCheck className="w-3 h-3 mr-1" />
                        {v}
                    </Badge>
                    {canEditVendor(row.status) && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleAssignClick(row); }}
                            className="text-xs text-blue-600 hover:underline"
                        >
                            Edit
                        </button>
                    )}
                </div>
            ) : (
                <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Needs Assignment
                </Badge>
            )
        },
        { key: 'created_at', label: 'Date', render: (v) => new Date(v).toLocaleDateString() }
    ];

    const tableActions = [
        { label: 'View Details', icon: Eye, onClick: (row) => setSelectedOrder(row) },
        {
            label: (row) => row.assigned_vendor_id ? 'Reassign Vendor' : 'Assign Vendor',
            icon: Users,
            onClick: (row) => handleAssignClick(row),
            disabled: (row) => !canEditVendor(row.status),
            hidden: (row) => !canEditVendor(row.status) && row.assigned_vendor_id
        }
    ];

    return (
        <DashboardLayout userRole="admin">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Order Management</h1>
                        <p className="text-muted-foreground mt-1">Assign vendors to orders and track fulfillment</p>
                    </div>
                    {pendingCount > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                            <span className="text-yellow-800 font-medium">{pendingCount} orders need vendor assignment</span>
                        </div>
                    )}
                </div>

                {/* Status Filters */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    {['all', 'pending', 'assigned', 'processing', 'shipped', 'completed'].map((status) => {
                        const count = status === 'all' ? orders.length : orders.filter(o => o.status === status).length;
                        const isActive = statusFilter === status;
                        return (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`p-3 rounded-lg border transition-all text-left ${isActive ? 'bg-primary text-white' : 'bg-card hover:border-primary/50'
                                    } ${status === 'pending' && count > 0 ? 'ring-2 ring-yellow-400' : ''}`}
                            >
                                <p className="text-xs opacity-80 capitalize">{status === 'all' ? 'All' : status}</p>
                                <p className="text-xl font-bold">{count}</p>
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

                {/* Assign Vendor Modal */}
                <AnimatePresence>
                    {showAssignModal && selectedOrder && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                            onClick={() => setShowAssignModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9 }}
                                className="bg-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-6 border-b sticky top-0 bg-card">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold">Assign Vendor to {selectedOrder.id}</h2>
                                            <p className="text-sm text-muted-foreground">Select a vendor to fulfill this order</p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => setShowAssignModal(false)}>
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Order Summary */}
                                    <div className="bg-muted/30 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm text-muted-foreground">Order Total (Customer Pays)</span>
                                            <span className="text-2xl font-bold">${selectedOrder.total_amount.toLocaleString()}</span>
                                        </div>
                                        <div className="text-sm">
                                            <p className="font-medium">Items:</p>
                                            {selectedOrder.items?.map((item, idx) => (
                                                <p key={idx} className="text-muted-foreground">• {item.name} x{item.quantity}</p>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Available Vendors */}
                                    <div>
                                        <h3 className="font-semibold mb-3">Available Vendors</h3>
                                        {availableVendors.length === 0 ? (
                                            <div className="text-center py-8 bg-red-50 rounded-xl border border-red-200">
                                                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                                <p className="font-medium text-red-800">No vendors available</p>
                                                <p className="text-sm text-red-600">No vendor has these products in stock</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {availableVendors.map((vendor, idx) => {
                                                    const margin = selectedOrder.total_amount - vendor.total_vendor_price;
                                                    const marginPercent = ((margin / selectedOrder.total_amount) * 100).toFixed(1);
                                                    return (
                                                        <div
                                                            key={vendor.vendor_id}
                                                            className={`p-4 rounded-xl border-2 transition-all ${idx === 0 ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-primary/50'
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                                        <Users className="w-5 h-5 text-primary" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <p className="font-semibold">{vendor.vendor_name}</p>
                                                                            {idx === 0 && (
                                                                                <Badge className="bg-green-100 text-green-700 text-xs">Best Price</Badge>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                                            <span className="flex items-center gap-1">
                                                                                <MapPin className="w-3 h-3" /> {vendor.location || 'N/A'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-lg font-bold text-green-600">
                                                                        ${vendor.total_vendor_price.toLocaleString()}
                                                                    </p>
                                                                    <p className="text-xs text-green-600">
                                                                        Margin: ${margin.toLocaleString()} ({marginPercent}%)
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                className="w-full mt-3"
                                                                onClick={() => handleAssignVendor(vendor.vendor_id, vendor.vendor_name)}
                                                            >
                                                                Assign to {vendor.vendor_name}
                                                            </Button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Notes */}
                                    {availableVendors.length > 0 && (
                                        <div className="space-y-2">
                                            <Label>Assignment Notes (optional)</Label>
                                            <Textarea
                                                placeholder="Add any notes for the vendor..."
                                                value={assignmentNotes}
                                                onChange={(e) => setAssignmentNotes(e.target.value)}
                                                rows={2}
                                            />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Order Detail Modal */}
                <AnimatePresence>
                    {selectedOrder && !showAssignModal && (
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
                                className="bg-card rounded-2xl shadow-xl w-full max-w-lg"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-6 border-b flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold">{selectedOrder.id}</h2>
                                        <Badge className={getStatusConfig(selectedOrder.status).color}>
                                            {getStatusConfig(selectedOrder.status).label}
                                        </Badge>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)}>
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Total</span>
                                        <span className="text-2xl font-bold">${selectedOrder.total_amount.toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Shipping Address</p>
                                        <p className="font-medium">{selectedOrder.shipping_address}</p>
                                    </div>
                                    {selectedOrder.assigned_vendor_name && (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-green-700 font-medium">✓ Vendor Assigned</p>
                                                    <p className="font-semibold text-lg">{selectedOrder.assigned_vendor_name}</p>
                                                </div>
                                                {canEditVendor(selectedOrder.status) && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleAssignClick(selectedOrder)}
                                                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                                    >
                                                        <Users className="w-4 h-4 mr-1" /> Reassign
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">Items</p>
                                        {selectedOrder.items?.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm bg-muted/30 p-2 rounded mb-1">
                                                <span>{item.name}</span>
                                                <span>x{item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {!selectedOrder.assigned_vendor_id && (
                                        <Button
                                            className="w-full"
                                            onClick={() => handleAssignClick(selectedOrder)}
                                        >
                                            <Users className="w-4 h-4 mr-2" /> Assign Vendor
                                        </Button>
                                    )}
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
