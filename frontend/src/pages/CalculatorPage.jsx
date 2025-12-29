import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Calculator, Sun, Home, Building2, Zap, Leaf, TrendingUp, ChevronRight, ShoppingCart, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { API, useCart } from '../App';
import { toast } from 'sonner';

const CalculatorPage = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [form, setForm] = useState({ monthly_bill: '', property_type: 'home', city: '', backup_required: false });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [recommendedProducts, setRecommendedProducts] = useState([]);

    const handleCalculate = async () => {
        if (!form.monthly_bill || !form.city) { toast.error('Please fill all required fields'); return; }
        setLoading(true);
        try {
            const response = await axios.post(`${API}/api/calculator`, { monthly_bill: parseFloat(form.monthly_bill), property_type: form.property_type, city: form.city, backup_required: form.backup_required });
            setResult(response.data);

            // Fetch recommended products based on calculated size
            const sizeKw = response.data.recommended_size_kw;
            try {
                const productsRes = await axios.get(`${API}/api/products`);
                // Find products within ±3 kW of recommended size, sorted by closest match
                const products = productsRes.data
                    .filter(p => p.system_size_kw >= sizeKw - 3 && p.system_size_kw <= sizeKw + 5)
                    .filter(p => form.property_type === 'commercial' ? p.category === 'commercial' : true)
                    .sort((a, b) => Math.abs(a.system_size_kw - sizeKw) - Math.abs(b.system_size_kw - sizeKw))
                    .slice(0, 4);
                setRecommendedProducts(products);
            } catch (err) {
                console.log('Could not fetch product recommendations');
            }
        } catch (error) {
            toast.error('Calculation failed');
            // Demo result
            setResult({
                recommended_size_kw: Math.ceil(parseFloat(form.monthly_bill) / 1000),
                estimated_cost: Math.ceil(parseFloat(form.monthly_bill) / 1000) * 60000,
                annual_savings: parseFloat(form.monthly_bill) * 10,
                payback_years: 4.5,
                co2_reduction_kg: Math.ceil(parseFloat(form.monthly_bill) / 1000) * 1200
            });
        }
        finally { setLoading(false); }
    };

    const handleAddToCart = (product) => {
        addToCart({ ...product, quantity: 1 });
        toast.success(`${product.name} added to cart!`);
    };

    return (
        <div className="min-h-screen pt-20">
            <section className="relative h-64 bg-gradient-to-r from-foreground to-foreground/90 flex items-center">
                <div className="absolute inset-0 opacity-20"><img src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200" alt="Solar" className="w-full h-full object-cover" /></div>
                <div className="container-solar relative z-10 text-white text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm mb-4">
                        <Calculator className="w-5 h-5 text-primary" /><span>Free Solar Estimate</span>
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl md:text-4xl font-bold">Solar Savings Calculator</motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-white/80 mt-2">Find out how much you can save with solar energy</motion.p>
                </div>
            </section>

            <div className="container-solar py-12 md:py-16">
                <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="calculator-card">
                        <h2 className="text-xl font-bold mb-6">Enter Your Details</h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="bill">Monthly Electricity Bill (₹) *</Label>
                                <Input id="bill" type="number" placeholder="e.g., 5000" value={form.monthly_bill} onChange={e => setForm({ ...form, monthly_bill: e.target.value })} className="input-solar" />
                            </div>
                            <div className="space-y-2">
                                <Label>Property Type</Label>
                                <Select value={form.property_type} onValueChange={v => setForm({ ...form, property_type: v })}>
                                    <SelectTrigger className="input-solar"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="home"><div className="flex items-center gap-2"><Home className="w-4 h-4" />Residential</div></SelectItem>
                                        <SelectItem value="commercial"><div className="flex items-center gap-2"><Building2 className="w-4 h-4" />Commercial</div></SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">City / State *</Label>
                                <Input id="city" placeholder="e.g., Delhi" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="input-solar" />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                                <div><Label htmlFor="backup">Battery Backup</Label><p className="text-sm text-muted-foreground">For power during outages</p></div>
                                <Switch id="backup" checked={form.backup_required} onCheckedChange={c => setForm({ ...form, backup_required: c })} />
                            </div>
                            <Button onClick={handleCalculate} disabled={loading} className="w-full btn-primary py-6 text-lg">{loading ? 'Calculating...' : 'Calculate Savings'}</Button>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-secondary/30 rounded-2xl p-8">
                        <h2 className="text-xl font-bold mb-6">Your Solar Estimate</h2>
                        {result ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                <div className="p-4 bg-card rounded-xl border"><p className="text-sm text-muted-foreground">Recommended System Size</p><p className="text-4xl font-bold text-primary">{result.recommended_size_kw} kW</p></div>
                                <div className="p-4 bg-card rounded-xl border"><p className="text-sm text-muted-foreground">Estimated Cost</p><p className="text-3xl font-bold">₹{result.estimated_cost?.toLocaleString()}</p></div>
                                <div className="p-4 bg-accent/10 rounded-xl border border-accent/30"><p className="text-sm text-accent">Annual Savings</p><p className="text-3xl font-bold text-accent">₹{result.annual_savings?.toLocaleString()}</p></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-card rounded-lg"><p className="text-sm text-muted-foreground">Payback</p><p className="font-semibold">{result.payback_years} years</p></div>
                                    <div className="p-3 bg-card rounded-lg"><p className="text-sm text-muted-foreground">CO₂ Reduction</p><p className="font-semibold">{result.co2_reduction_kg} kg/yr</p></div>
                                </div>
                                <Button onClick={() => navigate(`/shop?size=${result.recommended_size_kw}`)} className="w-full" variant="outline">View All Recommended Products<ChevronRight className="w-4 h-4 ml-2" /></Button>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-16">
                                <Sun className="w-20 h-20 mb-4 text-primary/30" />
                                <p>Enter your details to see personalized solar recommendations</p>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Recommended Products Section */}
                {recommendedProducts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-12 max-w-6xl mx-auto"
                    >
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Sun className="w-6 h-6 text-primary" />
                            Recommended Products for Your {result?.recommended_size_kw}kW System
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {recommendedProducts.map((product, i) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    <img src={product.image_url} alt={product.name} className="w-full h-40 object-cover" />
                                    <div className="p-4">
                                        <Badge className="mb-2">{product.system_size_kw} kW</Badge>
                                        <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                                        <p className="text-sm text-muted-foreground mb-2">{product.brand}</p>
                                        <div className="flex items-center gap-1 text-sm mb-3">
                                            <Star className="w-4 h-4 fill-primary text-primary" />
                                            <span>{product.rating || 4.5}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xl font-bold">₹{product.price?.toLocaleString()}</span>
                                            <Button size="sm" onClick={() => handleAddToCart(product)}>
                                                <ShoppingCart className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="text-center mt-6">
                            <Link to={`/shop?size=${result?.recommended_size_kw}`}>
                                <Button variant="outline">View All Matching Products <ChevronRight className="w-4 h-4 ml-1" /></Button>
                            </Link>
                        </div>
                    </motion.div>
                )}

                <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {[{ icon: Zap, title: 'Reduce Bills', desc: 'Cut electricity costs by up to 90%' }, { icon: Leaf, title: 'Go Green', desc: 'Reduce your carbon footprint' }, { icon: TrendingUp, title: 'Great ROI', desc: 'Average payback in 3-5 years' }].map((item, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="text-center p-6 bg-card rounded-xl border">
                            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4"><item.icon className="w-6 h-6 text-primary" /></div>
                            <h3 className="font-semibold mb-2">{item.title}</h3><p className="text-sm text-muted-foreground">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CalculatorPage;
