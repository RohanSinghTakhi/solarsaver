import React, { useState } from 'react';
import { Settings, Globe, CreditCard, Mail, Percent, Save, Bell, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState('general');

    const [general, setGeneral] = useState({
        siteName: 'SolarSavers',
        tagline: 'Your Solar Energy Marketplace',
        email: 'admin@solarsavers.com',
        phone: '+1 (555) 000-0000',
        address: '123 Solar Street, Green City, GC 12345'
    });

    const [commission, setCommission] = useState({
        rate: 10,
        minPayout: 100,
        payoutFrequency: 'weekly'
    });

    const [notifications, setNotifications] = useState({
        newOrders: true,
        newVendors: true,
        lowStock: true,
        weeklyReport: true
    });

    const handleSave = (section) => {
        toast.success(`${section} settings saved successfully!`);
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Globe },
        { id: 'commission', label: 'Commission', icon: Percent },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield }
    ];

    return (
        <DashboardLayout userRole="admin">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Platform Settings</h1>
                    <p className="text-muted-foreground mt-1">Configure your marketplace settings</p>
                </div>

                <div className="flex gap-2 border-b overflow-x-auto">
                    {tabs.map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === tab.id ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                            <tab.icon className="w-4 h-4" /> {tab.label}
                        </button>
                    ))}
                </div>

                <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    {activeTab === 'general' && (
                        <div className="bg-card rounded-xl border p-6 space-y-6">
                            <h3 className="font-semibold text-lg flex items-center gap-2"><Globe className="w-5 h-5" /> General Settings</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Site Name</Label><Input value={general.siteName} onChange={(e) => setGeneral({ ...general, siteName: e.target.value })} /></div>
                                <div className="space-y-2"><Label>Tagline</Label><Input value={general.tagline} onChange={(e) => setGeneral({ ...general, tagline: e.target.value })} /></div>
                                <div className="space-y-2"><Label>Admin Email</Label><Input type="email" value={general.email} onChange={(e) => setGeneral({ ...general, email: e.target.value })} /></div>
                                <div className="space-y-2"><Label>Phone</Label><Input value={general.phone} onChange={(e) => setGeneral({ ...general, phone: e.target.value })} /></div>
                            </div>
                            <div className="space-y-2"><Label>Address</Label><Textarea value={general.address} onChange={(e) => setGeneral({ ...general, address: e.target.value })} /></div>
                            <Button onClick={() => handleSave('General')} className="btn-primary"><Save className="w-4 h-4 mr-2" /> Save Changes</Button>
                        </div>
                    )}

                    {activeTab === 'commission' && (
                        <div className="bg-card rounded-xl border p-6 space-y-6">
                            <h3 className="font-semibold text-lg flex items-center gap-2"><Percent className="w-5 h-5" /> Commission Settings</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Commission Rate (%)</Label>
                                    <Input type="number" value={commission.rate} onChange={(e) => setCommission({ ...commission, rate: e.target.value })} />
                                    <p className="text-xs text-muted-foreground">Platform takes this % from each sale</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Minimum Payout ($)</Label>
                                    <Input type="number" value={commission.minPayout} onChange={(e) => setCommission({ ...commission, minPayout: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Payout Frequency</Label>
                                    <select value={commission.payoutFrequency} onChange={(e) => setCommission({ ...commission, payoutFrequency: e.target.value })} className="w-full h-10 px-3 rounded-md border bg-background">
                                        <option value="weekly">Weekly</option>
                                        <option value="biweekly">Bi-weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                </div>
                            </div>
                            <Button onClick={() => handleSave('Commission')} className="btn-primary"><Save className="w-4 h-4 mr-2" /> Save Changes</Button>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="bg-card rounded-xl border p-6 space-y-6">
                            <h3 className="font-semibold text-lg flex items-center gap-2"><Bell className="w-5 h-5" /> Notification Settings</h3>
                            <div className="space-y-4">
                                {[
                                    { key: 'newOrders', label: 'New Orders', desc: 'Get notified when new orders are placed' },
                                    { key: 'newVendors', label: 'New Vendors', desc: 'Get notified when vendors apply' },
                                    { key: 'lowStock', label: 'Low Stock Alerts', desc: 'Get notified when products are low on stock' },
                                    { key: 'weeklyReport', label: 'Weekly Reports', desc: 'Receive weekly platform performance reports' }
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                        <div><p className="font-medium">{item.label}</p><p className="text-sm text-muted-foreground">{item.desc}</p></div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={notifications[item.key]} onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <Button onClick={() => handleSave('Notification')} className="btn-primary"><Save className="w-4 h-4 mr-2" /> Save Preferences</Button>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-card rounded-xl border p-6 space-y-6">
                            <h3 className="font-semibold text-lg flex items-center gap-2"><Shield className="w-5 h-5" /> Security Settings</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="font-medium text-green-800">SSL Certificate Active</p>
                                    <p className="text-sm text-green-700">Your site is secured with HTTPS</p>
                                </div>
                                <div className="p-4 bg-muted/30 rounded-lg">
                                    <p className="font-medium">Two-Factor Authentication</p>
                                    <p className="text-sm text-muted-foreground mb-3">Add an extra layer of security to your account</p>
                                    <Button variant="outline">Enable 2FA</Button>
                                </div>
                                <div className="p-4 bg-muted/30 rounded-lg">
                                    <p className="font-medium">Session Management</p>
                                    <p className="text-sm text-muted-foreground mb-3">View and manage active sessions</p>
                                    <Button variant="outline">View Sessions</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </DashboardLayout>
    );
};

export default AdminSettings;
