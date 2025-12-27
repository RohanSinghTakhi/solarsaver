import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User, Store, Mail, Phone, MapPin, CreditCard,
    Save, Camera, Shield, Bell, Eye, EyeOff
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../App';
import { toast } from 'sonner';

const VendorProfile = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('business');
    const [showPassword, setShowPassword] = useState(false);

    const [businessInfo, setBusinessInfo] = useState({
        storeName: 'SunPower Solar Solutions',
        description: 'Premium solar panels and complete home solar systems. We provide high-quality, efficient solar products with excellent customer service and support.',
        email: user?.email || 'vendor@solarsavers.com',
        phone: '+1 (555) 123-4567',
        address: '123 Solar Street, Green City, GC 12345',
        website: 'www.sunpowersolar.com'
    });

    const [bankInfo, setBankInfo] = useState({
        accountName: 'SunPower Solar Solutions LLC',
        accountNumber: '****4567',
        bankName: 'First National Bank',
        routingNumber: '****1234'
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [notifications, setNotifications] = useState({
        orderAlerts: true,
        emailNotifications: true,
        smsNotifications: false,
        weeklyReport: true
    });

    const handleSaveBusinessInfo = (e) => {
        e.preventDefault();
        toast.success('Business information updated successfully!');
    };

    const handleSaveBankInfo = (e) => {
        e.preventDefault();
        toast.success('Bank information updated successfully!');
    };

    const handleChangePassword = (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (passwordForm.newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        toast.success('Password changed successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    const handleSaveNotifications = () => {
        toast.success('Notification preferences saved!');
    };

    const tabs = [
        { id: 'business', label: 'Business Info', icon: Store },
        { id: 'payment', label: 'Payment', icon: CreditCard },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell }
    ];

    return (
        <DashboardLayout userRole="vendor">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Vendor Profile</h1>
                    <p className="text-muted-foreground mt-1">Manage your store information and settings</p>
                </div>

                {/* Profile Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-xl border p-6 flex flex-col md:flex-row items-center gap-6"
                >
                    <div className="relative">
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                            <Store className="w-12 h-12 text-primary" />
                        </div>
                        <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/90 transition-colors">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-xl font-bold">{businessInfo.storeName}</h2>
                        <p className="text-muted-foreground">{user?.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                Verified Vendor
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                Member since 2024
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-2 border-b overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* Business Info Tab */}
                    {activeTab === 'business' && (
                        <form onSubmit={handleSaveBusinessInfo} className="bg-card rounded-xl border p-6 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="storeName">Store Name</Label>
                                    <Input
                                        id="storeName"
                                        value={businessInfo.storeName}
                                        onChange={(e) => setBusinessInfo({ ...businessInfo, storeName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={businessInfo.email}
                                        onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={businessInfo.phone}
                                        onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="website">Website</Label>
                                    <Input
                                        id="website"
                                        value={businessInfo.website}
                                        onChange={(e) => setBusinessInfo({ ...businessInfo, website: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    value={businessInfo.address}
                                    onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Store Description</Label>
                                <Textarea
                                    id="description"
                                    value={businessInfo.description}
                                    onChange={(e) => setBusinessInfo({ ...businessInfo, description: e.target.value })}
                                    rows={4}
                                />
                            </div>
                            <Button type="submit" className="btn-primary">
                                <Save className="w-4 h-4 mr-2" /> Save Changes
                            </Button>
                        </form>
                    )}

                    {/* Payment Tab */}
                    {activeTab === 'payment' && (
                        <form onSubmit={handleSaveBankInfo} className="bg-card rounded-xl border p-6 space-y-6">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
                                <p className="font-medium text-yellow-800">Secure Payment Information</p>
                                <p className="text-yellow-700 mt-1">Your bank details are encrypted and securely stored.</p>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="accountName">Account Holder Name</Label>
                                    <Input
                                        id="accountName"
                                        value={bankInfo.accountName}
                                        onChange={(e) => setBankInfo({ ...bankInfo, accountName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bankName">Bank Name</Label>
                                    <Input
                                        id="bankName"
                                        value={bankInfo.bankName}
                                        onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="accountNumber">Account Number</Label>
                                    <Input
                                        id="accountNumber"
                                        value={bankInfo.accountNumber}
                                        onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="routingNumber">Routing Number</Label>
                                    <Input
                                        id="routingNumber"
                                        value={bankInfo.routingNumber}
                                        onChange={(e) => setBankInfo({ ...bankInfo, routingNumber: e.target.value })}
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="btn-primary">
                                <Save className="w-4 h-4 mr-2" /> Update Payment Info
                            </Button>
                        </form>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <form onSubmit={handleChangePassword} className="bg-card rounded-xl border p-6 space-y-6">
                            <h3 className="font-semibold text-lg">Change Password</h3>
                            <div className="space-y-4 max-w-md">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="currentPassword"
                                            type={showPassword ? 'text' : 'password'}
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="btn-primary">
                                <Shield className="w-4 h-4 mr-2" /> Change Password
                            </Button>
                        </form>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="bg-card rounded-xl border p-6 space-y-6">
                            <h3 className="font-semibold text-lg">Notification Preferences</h3>
                            <div className="space-y-4">
                                {[
                                    { key: 'orderAlerts', label: 'Order Alerts', desc: 'Get notified when you receive new orders' },
                                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                                    { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive updates via SMS' },
                                    { key: 'weeklyReport', label: 'Weekly Reports', desc: 'Receive weekly sales and performance reports' }
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                        <div>
                                            <p className="font-medium">{item.label}</p>
                                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={notifications[item.key]}
                                                onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <Button onClick={handleSaveNotifications} className="btn-primary">
                                <Save className="w-4 h-4 mr-2" /> Save Preferences
                            </Button>
                        </div>
                    )}
                </motion.div>
            </div>
        </DashboardLayout>
    );
};

export default VendorProfile;
