import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Clock, MessageSquare, Ticket, Plus, AlertCircle, CheckCircle, Clock as ClockIcon, ChevronDown, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import axios from 'axios';
import { API, useAuth } from '../App';
import { toast } from 'sonner';

const ContactPage = () => {
    const { user, token } = useAuth();
    const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('contact'); // 'contact' or 'tickets'

    // Ticket form state
    const [ticketForm, setTicketForm] = useState({
        subject: '',
        category: 'general',
        priority: 'Medium',
        description: '',
        order_id: ''
    });
    const [ticketLoading, setTicketLoading] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [ticketsLoading, setTicketsLoading] = useState(false);
    const [orders, setOrders] = useState([]);

    // Fetch tickets and orders on mount
    React.useEffect(() => {
        if (user && token) {
            fetchTickets();
            fetchOrders();
        }
    }, [user, token]);

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${API}/api/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data || []);
        } catch (error) {
            console.log('Could not fetch orders');
            setOrders([]);
        }
    };

    const fetchTickets = async () => {
        setTicketsLoading(true);
        try {
            const res = await axios.get(`${API}/api/tickets`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTickets(res.data.map(t => ({
                id: t.id?.substring(0, 8).toUpperCase() || t.id,
                fullId: t.id,
                subject: t.subject,
                category: t.category,
                priority: t.priority?.charAt(0).toUpperCase() + t.priority?.slice(1) || 'Medium',
                status: t.status === 'in_progress' ? 'In Progress' : t.status?.charAt(0).toUpperCase() + t.status?.slice(1),
                date: t.created_at?.split('T')[0],
                lastUpdate: getTimeAgo(t.updated_at)
            })));
        } catch (error) {
            console.log('Using demo tickets');
            setTickets([
                { id: 'TKT-001', subject: 'Solar panel installation query', category: 'Installation', priority: 'High', status: 'Open', date: '2024-12-25', lastUpdate: '2 hours ago' }
            ]);
        }
        setTicketsLoading(false);
    };

    const getTimeAgo = (dateStr) => {
        if (!dateStr) return 'Just now';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hours ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} days ago`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) { toast.error('Please fill required fields'); return; }
        setLoading(true);
        try {
            await axios.post(`${API}/api/contact`, form);
            toast.success('Message sent successfully!');
            setForm({ name: '', email: '', phone: '', subject: '', message: '' });
        } catch (error) { toast.error('Failed to send message'); }
        finally { setLoading(false); }
    };

    const handleTicketSubmit = async (e) => {
        e.preventDefault();
        if (!ticketForm.subject || !ticketForm.description) {
            toast.error('Please fill in subject and description');
            return;
        }
        // Require order selection for non-general categories
        if (ticketForm.category !== 'general' && !ticketForm.order_id) {
            toast.error('Please select an order for this ticket category');
            return;
        }
        setTicketLoading(true);

        try {
            await axios.post(`${API}/api/tickets`, {
                subject: ticketForm.subject,
                message: ticketForm.description,
                category: ticketForm.category,
                order_id: ticketForm.order_id || null
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Support ticket created successfully!');
            setTicketForm({ subject: '', category: 'general', priority: 'Medium', description: '', order_id: '' });
            fetchTickets();
        } catch (error) {
            toast.error('Failed to create ticket');
        }
        setTicketLoading(false);
    };

    // Check if order selection should be shown
    const showOrderSelect = ticketForm.category !== 'general';

    const getStatusColor = (status) => {
        switch (status) {
            case 'Open': return 'bg-blue-500';
            case 'In Progress': return 'bg-yellow-500';
            case 'Resolved': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'text-red-500 bg-red-50 border-red-200';
            case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'Low': return 'text-green-600 bg-green-50 border-green-200';
            default: return '';
        }
    };

    const contactInfo = [
        { icon: MapPin, title: 'Address', content: '123 Solar Street, Green City, GC 12345' },
        { icon: Phone, title: 'Phone', content: '+1 (234) 567-890' },
        { icon: Mail, title: 'Email', content: 'info@solarsavers.com' },
        { icon: Clock, title: 'Hours', content: 'Mon-Sat: 9AM - 6PM' }
    ];

    const ticketCategories = ['General Inquiry', 'Installation', 'Technical Support', 'Billing', 'Warranty', 'Returns'];
    const priorities = ['Low', 'Medium', 'High'];

    return (
        <div className="min-h-screen pt-20">
            <section className="relative h-64 bg-gradient-to-r from-foreground to-foreground/90 flex items-center">
                <div className="container-solar relative z-10 text-white text-center">
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-bold">Contact Us</motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-white/80 mt-2">Get in touch with our solar experts</motion.p>
                </div>
            </section>

            <div className="container-solar py-12 md:py-16">
                {/* Tab Navigation for logged-in users */}
                {user && (
                    <div className="flex gap-4 mb-8 border-b">
                        <button
                            onClick={() => setActiveTab('contact')}
                            className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === 'contact'
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <MessageSquare className="w-4 h-4 inline mr-2" />
                            Contact Form
                            {activeTab === 'contact' && (
                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('tickets')}
                            className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === 'tickets'
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Ticket className="w-4 h-4 inline mr-2" />
                            Support Tickets
                            <Badge className="ml-2 bg-primary/10 text-primary text-xs">{tickets.length}</Badge>
                            {activeTab === 'tickets' && (
                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                            )}
                        </button>
                    </div>
                )}

                {/* Contact Form Tab */}
                {activeTab === 'contact' && (
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border p-6 md:p-8">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary" />Send us a Message</h2>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2"><Label htmlFor="name">Name *</Label><Input id="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-solar" /></div>
                                        <div className="space-y-2"><Label htmlFor="email">Email *</Label><Input id="email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-solar" /></div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2"><Label htmlFor="phone">Phone</Label><Input id="phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-solar" /></div>
                                        <div className="space-y-2"><Label htmlFor="subject">Subject</Label><Input id="subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="input-solar" /></div>
                                    </div>
                                    <div className="space-y-2"><Label htmlFor="message">Message *</Label><Textarea id="message" rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} /></div>
                                    <Button type="submit" disabled={loading} className="btn-primary"><Send className="w-4 h-4 mr-2" />{loading ? 'Sending...' : 'Send Message'}</Button>
                                </form>
                            </motion.div>
                        </div>

                        <div className="space-y-6">
                            {contactInfo.map((info, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="bg-card rounded-xl border p-4 flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><info.icon className="w-5 h-5 text-primary" /></div>
                                    <div><p className="font-semibold">{info.title}</p><p className="text-sm text-muted-foreground">{info.content}</p></div>
                                </motion.div>
                            ))}

                            {!user && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                                    <Ticket className="w-8 h-8 text-blue-500 mb-3" />
                                    <h3 className="font-semibold mb-2">Need a Support Ticket?</h3>
                                    <p className="text-sm text-muted-foreground mb-4">Login to create and track support tickets for faster resolution.</p>
                                    <Link to="/login">
                                        <Button variant="outline" className="w-full border-blue-300 text-blue-600 hover:bg-blue-100">
                                            Login to Create Tickets
                                        </Button>
                                    </Link>
                                </motion.div>
                            )}

                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="bg-primary/10 rounded-xl p-6">
                                <h3 className="font-semibold mb-2">Need Quick Help?</h3>
                                <p className="text-sm text-muted-foreground mb-4">Our AI assistant can help answer common questions instantly.</p>
                                <Button variant="outline" className="w-full">Chat with AI Assistant</Button>
                            </motion.div>
                        </div>
                    </div>
                )}

                {/* Support Tickets Tab - Only for logged-in users */}
                {activeTab === 'tickets' && user && (
                    <div className="space-y-8">
                        {/* Create New Ticket Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card rounded-2xl border p-6 md:p-8"
                        >
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-primary" />
                                Create New Support Ticket
                            </h2>
                            <form onSubmit={handleTicketSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="ticket-subject">Subject *</Label>
                                        <Input
                                            id="ticket-subject"
                                            placeholder="Brief description of your issue"
                                            value={ticketForm.subject}
                                            onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })}
                                            className="input-solar"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ticket-category">Category</Label>
                                        <select
                                            id="ticket-category"
                                            value={ticketForm.category}
                                            onChange={e => setTicketForm({ ...ticketForm, category: e.target.value, order_id: '' })}
                                            className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                                        >
                                            {ticketCategories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Order Selection - Shows when category is not general */}
                                {showOrderSelect && (
                                    <div className="space-y-2">
                                        <Label htmlFor="ticket-order">Select Related Order *</Label>
                                        {orders.length === 0 ? (
                                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                                                <AlertCircle className="w-4 h-4 inline mr-2" />
                                                No orders found. You need to have placed an order to create a ticket for this category.
                                            </div>
                                        ) : (
                                            <select
                                                id="ticket-order"
                                                value={ticketForm.order_id}
                                                onChange={e => setTicketForm({ ...ticketForm, order_id: e.target.value })}
                                                className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                                            >
                                                <option value="">-- Select an Order --</option>
                                                {orders.map(order => (
                                                    <option key={order.id} value={order.id}>
                                                        Order #{order.id?.substring(0, 8).toUpperCase()} - ${order.total_amount?.toLocaleString()} ({order.items?.map(i => i.name || 'Product').join(', ')})
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label>Priority</Label>
                                    <div className="flex gap-3">
                                        {priorities.map(p => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setTicketForm({ ...ticketForm, priority: p })}
                                                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${ticketForm.priority === p
                                                    ? getPriorityColor(p) + ' border-2'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ticket-description">Description *</Label>
                                    <Textarea
                                        id="ticket-description"
                                        rows={5}
                                        placeholder="Please describe your issue in detail..."
                                        value={ticketForm.description}
                                        onChange={e => setTicketForm({ ...ticketForm, description: e.target.value })}
                                    />
                                </div>
                                <Button type="submit" disabled={ticketLoading} className="btn-primary">
                                    <Ticket className="w-4 h-4 mr-2" />
                                    {ticketLoading ? 'Creating...' : 'Create Ticket'}
                                </Button>
                            </form>
                        </motion.div>

                        {/* Existing Tickets List */}
                        <div>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <ClockIcon className="w-5 h-5 text-primary" />
                                Your Tickets
                            </h2>
                            <div className="space-y-4">
                                {tickets.map((ticket, index) => (
                                    <motion.div
                                        key={ticket.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-card rounded-xl border p-5 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="font-mono text-sm text-muted-foreground">{ticket.id}</span>
                                                    <Badge className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                                                        {ticket.priority}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">{ticket.category}</Badge>
                                                </div>
                                                <h3 className="font-semibold">{ticket.subject}</h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Created: {ticket.date} • Last update: {ticket.lastUpdate}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className={`px-3 py-1.5 rounded-full text-white text-sm font-medium flex items-center gap-2 ${getStatusColor(ticket.status)}`}>
                                                    {ticket.status === 'Open' && <AlertCircle className="w-4 h-4" />}
                                                    {ticket.status === 'In Progress' && <ClockIcon className="w-4 h-4" />}
                                                    {ticket.status === 'Resolved' && <CheckCircle className="w-4 h-4" />}
                                                    {ticket.status}
                                                </div>
                                                <Button variant="outline" size="sm">
                                                    View Details
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 rounded-2xl overflow-hidden h-64 bg-secondary">
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <MapPin className="w-8 h-8 mr-2" /> Map placeholder - Add Google Maps integration
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ContactPage;
