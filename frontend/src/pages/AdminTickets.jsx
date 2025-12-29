import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Ticket, MessageSquare, Clock, AlertCircle, CheckCircle,
    X, Send, User, Mail, Filter
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { useAuth, API } from '../App';
import axios from 'axios';
import { toast } from 'sonner';

const AdminTickets = () => {
    const { token } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchTickets();
    }, [statusFilter]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const url = statusFilter === 'all'
                ? `${API}/api/admin/tickets`
                : `${API}/api/admin/tickets?status=${statusFilter}`;
            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTickets(res.data);
        } catch (error) {
            console.log('Using demo tickets');
            setTickets([
                { id: 't1', user_name: 'John Customer', user_email: 'john@example.com', subject: 'Solar panel issue', message: 'My panels are not generating expected output.', category: 'technical', status: 'open', priority: 'high', replies: [], created_at: '2024-12-27T10:00:00Z', updated_at: '2024-12-27T10:00:00Z' },
                { id: 't2', user_name: 'Sarah Smith', user_email: 'sarah@example.com', subject: 'Billing question', message: 'I have a question about my latest invoice.', category: 'billing', status: 'in_progress', priority: 'medium', replies: [{ user_name: 'Admin', is_admin: true, message: 'Hi Sarah, I\'ll look into this.', created_at: '2024-12-26T11:00:00Z' }], created_at: '2024-12-26T09:00:00Z', updated_at: '2024-12-26T11:00:00Z' },
            ]);
        }
        setLoading(false);
    };

    const updateStatus = async (ticketId, newStatus) => {
        try {
            await axios.put(`${API}/api/admin/tickets/${ticketId}/status?status=${newStatus}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Status updated to ${newStatus}`);
            fetchTickets();
            if (selectedTicket) setSelectedTicket({ ...selectedTicket, status: newStatus });
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const updatePriority = async (ticketId, newPriority) => {
        try {
            await axios.put(`${API}/api/admin/tickets/${ticketId}/priority?priority=${newPriority}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Priority updated to ${newPriority}`);
            fetchTickets();
            if (selectedTicket) setSelectedTicket({ ...selectedTicket, priority: newPriority });
        } catch (error) {
            toast.error('Failed to update priority');
        }
    };

    const sendReply = async () => {
        if (!replyText.trim()) return;
        try {
            await axios.post(`${API}/api/tickets/${selectedTicket.id}/reply`,
                { message: replyText },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Reply sent');
            setReplyText('');
            fetchTickets();
            // Refetch selected ticket to show new reply
            const res = await axios.get(`${API}/api/tickets/${selectedTicket.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedTicket(res.data);
        } catch (error) {
            toast.error('Failed to send reply');
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            open: { color: 'bg-blue-100 text-blue-700', icon: AlertCircle, label: 'Open' },
            in_progress: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'In Progress' },
            resolved: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Resolved' },
            closed: { color: 'bg-gray-100 text-gray-700', icon: X, label: 'Closed' }
        };
        return configs[status] || configs.open;
    };

    const getPriorityColor = (priority) => {
        const colors = { high: 'bg-red-100 text-red-700', medium: 'bg-yellow-100 text-yellow-700', low: 'bg-green-100 text-green-700' };
        return colors[priority] || colors.medium;
    };

    const statusCounts = {
        all: tickets.length,
        open: tickets.filter(t => t.status === 'open').length,
        in_progress: tickets.filter(t => t.status === 'in_progress').length,
        resolved: tickets.filter(t => t.status === 'resolved').length,
    };

    return (
        <DashboardLayout userRole="admin">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                        <Ticket className="w-8 h-8 text-primary" /> Support Tickets
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage customer support tickets</p>
                </div>

                {/* Status Filters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['all', 'open', 'in_progress', 'resolved'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`p-3 rounded-lg border transition-all text-left ${statusFilter === status ? 'bg-primary text-white' : 'bg-card hover:border-primary/50'
                                } ${status === 'open' && statusCounts.open > 0 ? 'ring-2 ring-blue-400' : ''}`}
                        >
                            <p className="text-xs opacity-80 capitalize">{status.replace('_', ' ')}</p>
                            <p className="text-xl font-bold">{statusCounts[status] || 0}</p>
                        </button>
                    ))}
                </div>

                {/* Tickets List */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-card rounded-xl border p-5 animate-pulse">
                                <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                                <div className="h-6 bg-muted rounded w-3/4"></div>
                            </div>
                        ))}
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-xl border">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h3 className="font-semibold">No Tickets</h3>
                        <p className="text-muted-foreground">All caught up!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tickets.map((ticket) => {
                            const config = getStatusConfig(ticket.status);
                            return (
                                <motion.div
                                    key={ticket.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-card rounded-xl border p-5 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => setSelectedTicket(ticket)}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge className={config.color}>{config.label}</Badge>
                                                <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                                                <Badge variant="outline">{ticket.category}</Badge>
                                            </div>
                                            <h3 className="font-semibold">{ticket.subject}</h3>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                                <span className="flex items-center gap-1"><User className="w-3 h-3" />{ticket.user_name}</span>
                                                <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{ticket.user_email}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">{new Date(ticket.created_at).toLocaleDateString()}</p>
                                            <p className="text-xs text-muted-foreground">{ticket.replies?.length || 0} replies</p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Ticket Detail Modal */}
                <AnimatePresence>
                    {selectedTicket && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                            onClick={() => setSelectedTicket(null)}
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
                                            <h2 className="text-xl font-bold">{selectedTicket.subject}</h2>
                                            <p className="text-sm text-muted-foreground">{selectedTicket.user_name} • {selectedTicket.user_email}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => setSelectedTicket(null)}>
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Status & Priority Controls */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium mb-2">Status</p>
                                            <div className="flex gap-2">
                                                {['open', 'in_progress', 'resolved', 'closed'].map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => updateStatus(selectedTicket.id, s)}
                                                        className={`px-3 py-1 rounded text-xs font-medium ${selectedTicket.status === s ? getStatusConfig(s).color : 'bg-muted'}`}
                                                    >
                                                        {s.replace('_', ' ')}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium mb-2">Priority</p>
                                            <div className="flex gap-2">
                                                {['low', 'medium', 'high'].map(p => (
                                                    <button
                                                        key={p}
                                                        onClick={() => updatePriority(selectedTicket.id, p)}
                                                        className={`px-3 py-1 rounded text-xs font-medium capitalize ${selectedTicket.priority === p ? getPriorityColor(p) : 'bg-muted'}`}
                                                    >
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Original Message */}
                                    <div className="bg-muted/30 rounded-xl p-4">
                                        <p className="text-sm text-muted-foreground mb-1">Original Message:</p>
                                        <p>{selectedTicket.message}</p>
                                    </div>

                                    {/* Replies */}
                                    {selectedTicket.replies?.length > 0 && (
                                        <div className="space-y-3">
                                            <p className="font-medium">Conversation ({selectedTicket.replies.length})</p>
                                            {selectedTicket.replies.map((reply, idx) => (
                                                <div key={idx} className={`p-3 rounded-lg ${reply.is_admin ? 'bg-primary/10 ml-4' : 'bg-muted/30 mr-4'}`}>
                                                    <div className="flex items-center gap-2 text-sm mb-1">
                                                        <span className="font-medium">{reply.user_name}</span>
                                                        {reply.is_admin && <Badge className="text-xs">Admin</Badge>}
                                                        <span className="text-muted-foreground text-xs">{new Date(reply.created_at).toLocaleString()}</span>
                                                    </div>
                                                    <p className="text-sm">{reply.message}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Reply Form */}
                                    <div className="space-y-3">
                                        <Textarea
                                            placeholder="Write a reply..."
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            rows={3}
                                        />
                                        <Button onClick={sendReply} disabled={!replyText.trim()}>
                                            <Send className="w-4 h-4 mr-2" /> Send Reply
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

export default AdminTickets;
