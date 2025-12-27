import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Mail, Shield, Ban, CheckCircle, X, Eye } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DataTable from '../components/dashboard/DataTable';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

const AdminUsers = () => {
    const [users, setUsers] = useState([
        { id: 1, name: 'John Smith', email: 'john@example.com', role: 'customer', status: 'active', orders: 12, joined: '2024-10-15' },
        { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', role: 'customer', status: 'active', orders: 8, joined: '2024-11-02' },
        { id: 3, name: 'Mike Brown', email: 'mike@vendor.com', role: 'vendor', status: 'active', orders: 45, joined: '2024-09-20' },
        { id: 4, name: 'Emily Davis', email: 'emily@example.com', role: 'customer', status: 'banned', orders: 3, joined: '2024-11-15' },
        { id: 5, name: 'Chris Wilson', email: 'chris@admin.com', role: 'admin', status: 'active', orders: 0, joined: '2024-08-01' },
        { id: 6, name: 'Lisa Taylor', email: 'lisa@example.com', role: 'customer', status: 'active', orders: 15, joined: '2024-10-28' },
        { id: 7, name: 'David Lee', email: 'david@vendor.com', role: 'vendor', status: 'active', orders: 67, joined: '2024-07-10' },
        { id: 8, name: 'Anna White', email: 'anna@example.com', role: 'customer', status: 'inactive', orders: 1, joined: '2024-12-01' },
    ]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [roleFilter, setRoleFilter] = useState('all');

    const toggleUserStatus = (userId, newStatus) => {
        setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        toast.success(`User status updated to ${newStatus}`);
    };

    const changeUserRole = (userId, newRole) => {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        if (selectedUser && selectedUser.id === userId) {
            setSelectedUser({ ...selectedUser, role: newRole });
        }
        toast.success(`User role changed to ${newRole}`);
    };

    const filteredUsers = roleFilter === 'all' ? users : users.filter(u => u.role === roleFilter);

    const columns = [
        {
            key: 'name',
            label: 'User',
            render: (value, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-primary">{value.charAt(0)}</span>
                    </div>
                    <div>
                        <p className="font-medium">{value}</p>
                        <p className="text-xs text-muted-foreground">{row.email}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'role',
            label: 'Role',
            render: (value) => {
                const roleColors = {
                    customer: 'bg-blue-100 text-blue-700',
                    vendor: 'bg-purple-100 text-purple-700',
                    admin: 'bg-orange-100 text-orange-700'
                };
                return <Badge className={roleColors[value]}>{value}</Badge>;
            }
        },
        {
            key: 'status',
            label: 'Status',
            render: (value) => {
                const statusColors = {
                    active: 'bg-green-100 text-green-700',
                    inactive: 'bg-gray-100 text-gray-700',
                    banned: 'bg-red-100 text-red-700'
                };
                return <Badge className={statusColors[value]}>{value}</Badge>;
            }
        },
        {
            key: 'orders',
            label: 'Orders',
            render: (value) => value
        },
        {
            key: 'joined',
            label: 'Joined',
            render: (value) => new Date(value).toLocaleDateString()
        }
    ];

    const tableActions = [
        { label: 'View Details', icon: Eye, onClick: (row) => setSelectedUser(row) },
        {
            label: 'Ban User',
            icon: Ban,
            variant: 'destructive',
            onClick: (row) => toggleUserStatus(row.id, row.status === 'banned' ? 'active' : 'banned')
        }
    ];

    return (
        <DashboardLayout userRole="admin">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">User Management</h1>
                        <p className="text-muted-foreground mt-1">Manage all platform users</p>
                    </div>
                </div>

                {/* Stats & Filters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['all', 'customer', 'vendor', 'admin'].map((role) => {
                        const count = role === 'all' ? users.length : users.filter(u => u.role === role).length;
                        const isActive = roleFilter === role;
                        return (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={`bg-card rounded-lg border p-4 text-left transition-all ${isActive ? 'ring-2 ring-primary' : 'hover:border-primary/50'
                                    }`}
                            >
                                <p className="text-sm text-muted-foreground capitalize">{role === 'all' ? 'All Users' : `${role}s`}</p>
                                <p className="text-2xl font-bold">{count}</p>
                            </button>
                        );
                    })}
                </div>

                {/* Users Table */}
                <DataTable
                    columns={columns}
                    data={filteredUsers}
                    actions={tableActions}
                    searchPlaceholder="Search users..."
                    onRowClick={(row) => setSelectedUser(row)}
                />

                {/* User Detail Modal */}
                <AnimatePresence>
                    {selectedUser && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                            onClick={() => setSelectedUser(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-card rounded-2xl shadow-xl w-full max-w-lg"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-6 border-b flex items-center justify-between">
                                    <h2 className="text-xl font-bold">User Details</h2>
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedUser(null)}>
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                            <span className="text-2xl font-bold text-primary">{selectedUser.name.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                                            <p className="text-muted-foreground">{selectedUser.email}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-muted/30 rounded-lg p-3">
                                            <p className="text-sm text-muted-foreground">Role</p>
                                            <p className="font-medium capitalize">{selectedUser.role}</p>
                                        </div>
                                        <div className="bg-muted/30 rounded-lg p-3">
                                            <p className="text-sm text-muted-foreground">Status</p>
                                            <p className="font-medium capitalize">{selectedUser.status}</p>
                                        </div>
                                        <div className="bg-muted/30 rounded-lg p-3">
                                            <p className="text-sm text-muted-foreground">Orders</p>
                                            <p className="font-medium">{selectedUser.orders}</p>
                                        </div>
                                        <div className="bg-muted/30 rounded-lg p-3">
                                            <p className="text-sm text-muted-foreground">Joined</p>
                                            <p className="font-medium">{new Date(selectedUser.joined).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Change Role</Label>
                                        <div className="flex gap-2">
                                            {['customer', 'vendor', 'admin'].map((role) => (
                                                <Button
                                                    key={role}
                                                    variant={selectedUser.role === role ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => changeUserRole(selectedUser.id, role)}
                                                    className="capitalize"
                                                >
                                                    {role}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t">
                                        <Button
                                            variant="outline"
                                            className={selectedUser.status === 'banned' ? 'text-green-600' : 'text-red-600'}
                                            onClick={() => {
                                                toggleUserStatus(selectedUser.id, selectedUser.status === 'banned' ? 'active' : 'banned');
                                                setSelectedUser({ ...selectedUser, status: selectedUser.status === 'banned' ? 'active' : 'banned' });
                                            }}
                                        >
                                            {selectedUser.status === 'banned' ? <CheckCircle className="w-4 h-4 mr-2" /> : <Ban className="w-4 h-4 mr-2" />}
                                            {selectedUser.status === 'banned' ? 'Unban User' : 'Ban User'}
                                        </Button>
                                        <Button variant="outline" className="flex-1" onClick={() => setSelectedUser(null)}>
                                            Close
                                        </Button>
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

export default AdminUsers;
