import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, CheckCircle, XCircle, Clock, Eye, X, Mail, Phone, Globe } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DataTable from '../components/dashboard/DataTable';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

const AdminVendors = () => {
    const [vendors, setVendors] = useState([
        { id: 1, name: 'SunPower Solar Solutions', email: 'info@sunpower.com', phone: '+1 555-1234', status: 'approved', products: 24, orders: 156, revenue: 45250, joined: '2024-09-15' },
        { id: 2, name: 'Tesla Energy Store', email: 'sales@tesla.com', phone: '+1 555-2345', status: 'approved', products: 18, orders: 134, revenue: 38900, joined: '2024-08-20' },
        { id: 3, name: 'LG Solar Shop', email: 'contact@lg.com', phone: '+1 555-3456', status: 'approved', products: 32, orders: 98, revenue: 29500, joined: '2024-07-10' },
        { id: 4, name: 'Green Solar Co', email: 'info@greensolar.com', phone: '+1 555-4567', status: 'pending', products: 0, orders: 0, revenue: 0, joined: '2024-12-27' },
        { id: 5, name: 'EcoEnergy Solutions', email: 'hello@ecoenergy.com', phone: '+1 555-5678', status: 'pending', products: 0, orders: 0, revenue: 0, joined: '2024-12-26' },
        { id: 6, name: 'Canadian Solar Inc', email: 'sales@canadian.com', phone: '+1 555-6789', status: 'approved', products: 15, orders: 87, revenue: 25800, joined: '2024-10-01' },
        { id: 7, name: 'Rejected Vendor LLC', email: 'bad@vendor.com', phone: '+1 555-0000', status: 'rejected', products: 0, orders: 0, revenue: 0, joined: '2024-12-20' },
    ]);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');

    const updateVendorStatus = (vendorId, newStatus) => {
        setVendors(vendors.map(v => v.id === vendorId ? { ...v, status: newStatus } : v));
        if (selectedVendor && selectedVendor.id === vendorId) {
            setSelectedVendor({ ...selectedVendor, status: newStatus });
        }
        const statusMessage = newStatus === 'approved' ? 'Vendor approved!' : newStatus === 'rejected' ? 'Vendor rejected' : 'Status updated';
        toast.success(statusMessage);
    };

    const filteredVendors = statusFilter === 'all' ? vendors : vendors.filter(v => v.status === statusFilter);

    const getStatusBadge = (status) => {
        const config = {
            approved: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
            pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
            rejected: { color: 'bg-red-100 text-red-700', icon: XCircle }
        };
        const c = config[status] || config.pending;
        return (
            <Badge className={`${c.color} gap-1`}>
                <c.icon className="w-3 h-3" />
                {status}
            </Badge>
        );
    };

    const columns = [
        {
            key: 'name',
            label: 'Vendor',
            render: (value, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Store className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="font-medium">{value}</p>
                        <p className="text-xs text-muted-foreground">{row.email}</p>
                    </div>
                </div>
            )
        },
        { key: 'status', label: 'Status', render: (value) => getStatusBadge(value) },
        { key: 'products', label: 'Products' },
        { key: 'orders', label: 'Orders' },
        { key: 'revenue', label: 'Revenue', render: (value) => `$${value.toLocaleString()}` },
        { key: 'joined', label: 'Joined', render: (value) => new Date(value).toLocaleDateString() }
    ];

    const tableActions = [
        { label: 'View Details', icon: Eye, onClick: (row) => setSelectedVendor(row) }
    ];

    return (
        <DashboardLayout userRole="admin">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Vendor Management</h1>
                    <p className="text-muted-foreground mt-1">Manage vendors and applications</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['all', 'pending', 'approved', 'rejected'].map((status) => {
                        const count = status === 'all' ? vendors.length : vendors.filter(v => v.status === status).length;
                        return (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`bg-card rounded-lg border p-4 text-left transition-all ${statusFilter === status ? 'ring-2 ring-primary' : 'hover:border-primary/50'}`}
                            >
                                <p className="text-sm text-muted-foreground capitalize">{status === 'all' ? 'All Vendors' : status}</p>
                                <p className="text-2xl font-bold">{count}</p>
                            </button>
                        );
                    })}
                </div>

                <DataTable columns={columns} data={filteredVendors} actions={tableActions} searchPlaceholder="Search vendors..." onRowClick={(row) => setSelectedVendor(row)} />

                <AnimatePresence>
                    {selectedVendor && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedVendor(null)}>
                            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-card rounded-2xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                                <div className="p-6 border-b flex items-center justify-between">
                                    <h2 className="text-xl font-bold">Vendor Details</h2>
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedVendor(null)}><X className="w-5 h-5" /></Button>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center"><Store className="w-8 h-8 text-primary" /></div>
                                        <div>
                                            <h3 className="text-lg font-semibold">{selectedVendor.name}</h3>
                                            {getStatusBadge(selectedVendor.status)}
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /> {selectedVendor.email}</p>
                                        <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /> {selectedVendor.phone}</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-muted/30 rounded-lg p-3 text-center">
                                            <p className="text-2xl font-bold">{selectedVendor.products}</p>
                                            <p className="text-xs text-muted-foreground">Products</p>
                                        </div>
                                        <div className="bg-muted/30 rounded-lg p-3 text-center">
                                            <p className="text-2xl font-bold">{selectedVendor.orders}</p>
                                            <p className="text-xs text-muted-foreground">Orders</p>
                                        </div>
                                        <div className="bg-muted/30 rounded-lg p-3 text-center">
                                            <p className="text-2xl font-bold text-green-600">${selectedVendor.revenue.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground">Revenue</p>
                                        </div>
                                    </div>
                                    {selectedVendor.status === 'pending' && (
                                        <div className="flex gap-3 pt-4 border-t">
                                            <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => updateVendorStatus(selectedVendor.id, 'approved')}>
                                                <CheckCircle className="w-4 h-4 mr-2" /> Approve
                                            </Button>
                                            <Button variant="outline" className="flex-1 text-red-600" onClick={() => updateVendorStatus(selectedVendor.id, 'rejected')}>
                                                <XCircle className="w-4 h-4 mr-2" /> Reject
                                            </Button>
                                        </div>
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

export default AdminVendors;
