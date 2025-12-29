import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Mail, Lock, User, Building2, Phone, FileText, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import axios from 'axios';
import { API } from '../App';
import { toast } from 'sonner';

const VendorRegisterPage = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', business_name: '', description: '', phone: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password || !form.business_name || !form.phone) { toast.error('Please fill all required fields'); return; }
        if (!acceptTerms) { toast.error('Please accept the terms and conditions'); return; }
        setLoading(true);
        try {
            await axios.post(`${API}/api/vendors/register`, form);
            toast.success('Vendor registration submitted! Please wait for approval.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Registration failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen pt-20 flex items-center justify-center py-12 px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6">
                        <Sun className="w-10 h-10 text-primary" />
                        <span className="text-2xl font-bold"><span className="solar-text-gradient">Solar</span>Savers</span>
                    </Link>
                    <h1 className="text-2xl font-bold">Become a Vendor</h1>
                    <p className="text-muted-foreground mt-2">Sell your solar products on SolarSavers</p>
                </div>

                <div className="bg-card rounded-2xl border p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input id="name" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="pl-10" /></div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input id="email" type="email" placeholder="you@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="pl-10" /></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password *</Label>
                            <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="pl-10 pr-10" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="business_name">Business Name *</Label>
                                <div className="relative"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input id="business_name" placeholder="Your Company" value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} className="pl-10" /></div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone *</Label>
                                <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input id="phone" placeholder="+1234567890" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="pl-10" /></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Business Description</Label>
                            <Textarea id="description" rows={3} placeholder="Describe your solar business..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                        </div>

                        <div className="flex items-start gap-3">
                            <Checkbox id="terms" checked={acceptTerms} onCheckedChange={setAcceptTerms} />
                            <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">I agree to the <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:underline">Vendor Agreement</Link></label>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full btn-primary">{loading ? 'Submitting...' : 'Submit Application'}</Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">Already registered? </span>
                        <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default VendorRegisterPage;
