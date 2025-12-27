import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import axios from 'axios';
import {
    Sun, Zap, Building2, Calculator, ArrowRight,
    Shield, Users, Award, Leaf, Star, ChevronRight,
    Home as HomeIcon, CheckCircle2, TrendingUp
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import ProductCard from '../components/ProductCard';
import { API } from '../App';
import { toast } from 'sonner';

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 1500, suffix = '', prefix = '' }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (isInView) {
            let start = 0;
            const end = parseFloat(value);
            const incrementTime = duration / end;
            const timer = setInterval(() => {
                start += 1;
                setCount(start);
                if (start >= end) clearInterval(timer);
            }, Math.max(incrementTime, 10));
            return () => clearInterval(timer);
        }
    }, [isInView, value, duration]);

    return (
        <span ref={ref} className="font-mono">
            {prefix}{count.toLocaleString()}{suffix}
        </span>
    );
};

// Section Animation Wrapper
const AnimatedSection = ({ children, className = '', delay = 0 }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

const HomePage = () => {
    const navigate = useNavigate();
    const [homeProducts, setHomeProducts] = useState([]);
    const [commercialProducts, setCommercialProducts] = useState([]);
    const [calcForm, setCalcForm] = useState({
        monthly_bill: '',
        property_type: 'home',
        city: '',
        backup_required: false
    });
    const [calcResult, setCalcResult] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const [homeRes, commercialRes] = await Promise.all([
                axios.get(`${API}/products/featured?category=home&limit=4`),
                axios.get(`${API}/products/featured?category=commercial&limit=4`)
            ]);
            setHomeProducts(homeRes.data);
            setCommercialProducts(commercialRes.data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    };

    const handleCalculate = async () => {
        if (!calcForm.monthly_bill || !calcForm.city) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsCalculating(true);
        try {
            const response = await axios.post(`${API}/calculator`, {
                monthly_bill: parseFloat(calcForm.monthly_bill),
                property_type: calcForm.property_type,
                city: calcForm.city,
                backup_required: calcForm.backup_required
            });
            setCalcResult(response.data);
        } catch (error) {
            toast.error('Calculation failed. Please try again.');
        } finally {
            setIsCalculating(false);
        }
    };

    const testimonials = [
        {
            name: 'Rajesh Kumar',
            role: 'Homeowner, Delhi',
            content: 'SolarSavers helped us reduce our electricity bill by 80%. The installation was seamless and the support team is always responsive.',
            rating: 5,
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
        },
        {
            name: 'Priya Sharma',
            role: 'Business Owner, Mumbai',
            content: 'We installed a 50kW commercial system for our factory. ROI was achieved in just 3 years. Highly recommend SolarSavers!',
            rating: 5,
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
        },
        {
            name: 'Amit Patel',
            role: 'Architect, Bangalore',
            content: 'The team at SolarSavers understands both aesthetics and functionality. Our clients love the solar installations we recommend.',
            rating: 5,
            image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
        }
    ];

    const benefits = [
        {
            icon: Zap,
            title: 'High Efficiency Panels',
            description: 'Industry-leading solar panels with 22%+ efficiency ratings for maximum power generation.'
        },
        {
            icon: Users,
            title: 'Trusted Vendors',
            description: 'Verified and certified vendors ensuring quality products and reliable service.'
        },
        {
            icon: Award,
            title: 'Government Subsidy Guidance',
            description: 'Expert assistance to help you avail maximum government subsidies and benefits.'
        },
        {
            icon: Shield,
            title: 'Warranty & Support',
            description: '25-year panel warranty with dedicated after-sales support and maintenance.'
        }
    ];

    const partnerLogos = [
        'Tata Power Solar', 'Adani Solar', 'Waaree', 'Vikram Solar',
        'Loom Solar', 'Luminous', 'Havells', 'Microtek'
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center pt-20 overflow-hidden hero-bg">
                {/* Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                        className="absolute top-20 right-20 opacity-10"
                    >
                        <Sun className="w-64 h-64 text-primary" />
                    </motion.div>
                </div>

                <div className="container-solar relative z-10 py-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="text-white space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm"
                            >
                                <Leaf className="w-4 h-4 text-accent" />
                                <span className="text-sm">Clean Energy for a Better Tomorrow</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
                            >
                                Power Smarter with{' '}
                                <span className="solar-text-gradient">SolarSavers</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-lg md:text-xl text-white/80 max-w-lg"
                            >
                                Smart solar solutions for homes and businesses. Save money, save the planet,
                                and secure your energy future with India's most trusted solar marketplace.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="flex flex-wrap gap-4"
                            >
                                <Link to="/calculator">
                                    <Button className="btn-primary text-lg px-8 py-6">
                                        <Calculator className="w-5 h-5 mr-2" />
                                        Calculate My Solar
                                    </Button>
                                </Link>
                                <Link to="/shop">
                                    <Button variant="outline" className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10">
                                        View Products
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </Link>
                            </motion.div>

                            {/* Stats */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10"
                            >
                                <div>
                                    <div className="text-3xl font-bold text-primary">
                                        <AnimatedCounter value={5000} suffix="+" />
                                    </div>
                                    <p className="text-white/60 text-sm">Happy Customers</p>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-primary">
                                        <AnimatedCounter value={50} suffix="MW+" />
                                    </div>
                                    <p className="text-white/60 text-sm">Solar Installed</p>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-primary">
                                        <AnimatedCounter value={100} suffix="+" />
                                    </div>
                                    <p className="text-white/60 text-sm">Cities Served</p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right - Hero Image */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="relative hidden lg:block"
                        >
                            <div className="relative">
                                <img
                                    src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600"
                                    alt="Solar Panels"
                                    className="rounded-2xl shadow-2xl"
                                />
                                <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                                            <TrendingUp className="w-6 h-6 text-accent" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Average Savings</p>
                                            <p className="text-xl font-bold">₹15,000/month</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" className="w-full h-20 fill-background">
                        <path d="M0,40 C480,120 960,0 1440,80 L1440,120 L0,120 Z" />
                    </svg>
                </div>
            </section>

            {/* Solar Calculator Section */}
            <section className="py-16 md:py-24 -mt-10 relative z-10">
                <div className="container-solar">
                    <AnimatedSection>
                        <div className="calculator-card max-w-4xl mx-auto">
                            <div className="text-center mb-8">
                                <h2 className="section-title">
                                    <Calculator className="w-8 h-8 inline-block mr-2 text-primary" />
                                    Solar Calculator
                                </h2>
                                <p className="section-subtitle">Find out how much you can save with solar energy</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Calculator Form */}
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="monthly_bill">Monthly Electricity Bill (₹)</Label>
                                        <Input
                                            id="monthly_bill"
                                            type="number"
                                            placeholder="e.g., 5000"
                                            value={calcForm.monthly_bill}
                                            onChange={(e) => setCalcForm({ ...calcForm, monthly_bill: e.target.value })}
                                            className="input-solar"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Property Type</Label>
                                        <Select
                                            value={calcForm.property_type}
                                            onValueChange={(value) => setCalcForm({ ...calcForm, property_type: value })}
                                        >
                                            <SelectTrigger className="input-solar">
                                                <SelectValue placeholder="Select property type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="home">
                                                    <div className="flex items-center gap-2">
                                                        <HomeIcon className="w-4 h-4" />
                                                        Home / Residential
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="commercial">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="w-4 h-4" />
                                                        Commercial / Industrial
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="city">City / State</Label>
                                        <Input
                                            id="city"
                                            type="text"
                                            placeholder="e.g., Delhi"
                                            value={calcForm.city}
                                            onChange={(e) => setCalcForm({ ...calcForm, city: e.target.value })}
                                            className="input-solar"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                                        <div>
                                            <Label htmlFor="backup">Battery Backup Required</Label>
                                            <p className="text-sm text-muted-foreground">For power during outages</p>
                                        </div>
                                        <Switch
                                            id="backup"
                                            checked={calcForm.backup_required}
                                            onCheckedChange={(checked) => setCalcForm({ ...calcForm, backup_required: checked })}
                                        />
                                    </div>

                                    <Button
                                        onClick={handleCalculate}
                                        disabled={isCalculating}
                                        className="w-full btn-primary py-6"
                                    >
                                        {isCalculating ? 'Calculating...' : 'Calculate Savings'}
                                    </Button>
                                </div>

                                {/* Results */}
                                <div className="bg-secondary/30 rounded-2xl p-6 space-y-6">
                                    <h3 className="font-semibold text-lg">Your Solar Estimate</h3>

                                    {calcResult ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="space-y-4"
                                        >
                                            <div className="p-4 bg-card rounded-xl border border-border">
                                                <p className="text-sm text-muted-foreground">Recommended System Size</p>
                                                <p className="text-3xl font-bold text-primary animate-count-up">
                                                    {calcResult.recommended_size_kw} kW
                                                </p>
                                            </div>

                                            <div className="p-4 bg-card rounded-xl border border-border">
                                                <p className="text-sm text-muted-foreground">Estimated Cost</p>
                                                <p className="text-3xl font-bold animate-count-up">
                                                    ₹{calcResult.estimated_cost?.toLocaleString()}
                                                </p>
                                            </div>

                                            <div className="p-4 bg-accent/10 rounded-xl border border-accent/30">
                                                <p className="text-sm text-accent">Annual Savings</p>
                                                <p className="text-3xl font-bold text-accent animate-count-up">
                                                    ₹{calcResult.annual_savings?.toLocaleString()}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div className="p-3 bg-card rounded-lg">
                                                    <p className="text-muted-foreground">Payback Period</p>
                                                    <p className="font-semibold">{calcResult.payback_years} years</p>
                                                </div>
                                                <div className="p-3 bg-card rounded-lg">
                                                    <p className="text-muted-foreground">CO₂ Reduction</p>
                                                    <p className="font-semibold">{calcResult.co2_reduction_kg} kg/year</p>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={() => navigate(`/shop?size=${calcResult.recommended_size_kw}`)}
                                                className="w-full"
                                                variant="outline"
                                            >
                                                View Recommended Products
                                                <ChevronRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </motion.div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-12">
                                            <Sun className="w-16 h-16 mb-4 text-primary/30" />
                                            <p>Enter your details to see personalized solar recommendations</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* Home Solar Products */}
            <section className="py-16 md:py-24 bg-secondary/30">
                <div className="container-solar">
                    <AnimatedSection>
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h2 className="section-title flex items-center gap-3">
                                    <HomeIcon className="w-8 h-8 text-primary" />
                                    Solar Solutions for Homes
                                </h2>
                                <p className="section-subtitle">Premium solar systems for residential properties (1kW - 10kW)</p>
                            </div>
                            <Link to="/shop/home" className="hidden md:flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
                                View All <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {homeProducts.map((product, index) => (
                                <ProductCard key={product.id} product={product} index={index} />
                            ))}
                        </div>

                        <div className="mt-8 text-center md:hidden">
                            <Link to="/shop/home">
                                <Button variant="outline">View All Home Solar</Button>
                            </Link>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* Commercial Solar Products */}
            <section className="py-16 md:py-24">
                <div className="container-solar">
                    <AnimatedSection>
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h2 className="section-title flex items-center gap-3">
                                    <Building2 className="w-8 h-8 text-primary" />
                                    Commercial & Industrial Solar
                                </h2>
                                <p className="section-subtitle">High-capacity solar solutions for businesses (10kW - 100kW+)</p>
                            </div>
                            <Link to="/shop/commercial" className="hidden md:flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
                                View All <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {commercialProducts.map((product, index) => (
                                <ProductCard key={product.id} product={product} index={index} />
                            ))}
                        </div>

                        <div className="mt-8 text-center md:hidden">
                            <Link to="/shop/commercial">
                                <Button variant="outline">View All Commercial Solar</Button>
                            </Link>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* About Section */}
            <section className="py-16 md:py-24 bg-secondary/30">
                <div className="container-solar">
                    <AnimatedSection>
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="section-title mb-6">
                                    About <span className="solar-text-gradient">SolarSavers</span>
                                </h2>
                                <p className="text-muted-foreground mb-6 leading-relaxed">
                                    SolarSavers is India's leading multi-vendor marketplace for solar energy solutions.
                                    We connect homeowners and businesses with certified solar vendors, ensuring you get
                                    the best quality products at competitive prices.
                                </p>
                                <p className="text-muted-foreground mb-8 leading-relaxed">
                                    Our mission is to accelerate the adoption of clean energy across India by making
                                    solar accessible, affordable, and hassle-free. With our network of trusted vendors
                                    and comprehensive support, going solar has never been easier.
                                </p>

                                <div className="grid grid-cols-3 gap-6">
                                    <div className="text-center">
                                        <div className="w-14 h-14 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
                                            <Award className="w-7 h-7 text-primary" />
                                        </div>
                                        <p className="font-semibold">10+ Years</p>
                                        <p className="text-sm text-muted-foreground">Experience</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-14 h-14 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
                                            <Shield className="w-7 h-7 text-primary" />
                                        </div>
                                        <p className="font-semibold">Quality</p>
                                        <p className="text-sm text-muted-foreground">Certified</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-14 h-14 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
                                            <Users className="w-7 h-7 text-primary" />
                                        </div>
                                        <p className="font-semibold">Expert</p>
                                        <p className="text-sm text-muted-foreground">Installers</p>
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <img
                                    src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600"
                                    alt="Solar Installation"
                                    className="rounded-2xl shadow-xl"
                                />
                                <div className="absolute -bottom-6 -right-6 bg-primary p-6 rounded-xl text-primary-foreground shadow-xl">
                                    <p className="text-4xl font-bold">50MW+</p>
                                    <p className="text-sm">Installed Capacity</p>
                                </div>
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-16 md:py-24">
                <div className="container-solar">
                    <AnimatedSection>
                        <div className="text-center mb-12">
                            <h2 className="section-title">Why Choose SolarSavers?</h2>
                            <p className="section-subtitle max-w-2xl mx-auto">
                                We're committed to providing the best solar experience with quality products,
                                expert guidance, and unmatched support.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {benefits.map((benefit, index) => {
                                const Icon = benefit.icon;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                        className="bg-card p-6 rounded-2xl border border-border hover:border-primary/50 transition-colors group"
                                    >
                                        <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                            <Icon className="w-7 h-7 text-primary" />
                                        </div>
                                        <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                                        <p className="text-muted-foreground text-sm">{benefit.description}</p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-16 md:py-24 bg-secondary/30">
                <div className="container-solar">
                    <AnimatedSection>
                        <div className="text-center mb-12">
                            <h2 className="section-title">What Our Customers Say</h2>
                            <p className="section-subtitle">Join thousands of satisfied customers who made the switch to solar</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {testimonials.map((testimonial, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="testimonial-card"
                                >
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 ${i < testimonial.rating ? 'fill-primary text-primary' : 'text-muted'}`} />
                                        ))}
                                    </div>
                                    <p className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.content}"</p>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={testimonial.image}
                                            alt={testimonial.name}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="font-semibold">{testimonial.name}</p>
                                            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* Partner Brands */}
            <section className="py-12 border-t border-border">
                <div className="container-solar">
                    <AnimatedSection>
                        <p className="text-center text-muted-foreground mb-8">Trusted by leading solar brands</p>
                        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                            {partnerLogos.map((brand, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    viewport={{ once: true }}
                                    className="text-xl font-semibold text-muted-foreground/50 hover:text-primary transition-colors"
                                >
                                    {brand}
                                </motion.div>
                            ))}
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 md:py-24 bg-gradient-to-r from-primary to-primary/80">
                <div className="container-solar text-center">
                    <AnimatedSection>
                        <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                            Ready to Go Solar?
                        </h2>
                        <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                            Start your solar journey today and join thousands of satisfied customers
                            saving money while saving the planet.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link to="/calculator">
                                <Button className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg">
                                    Get Free Quote
                                </Button>
                            </Link>
                            <Link to="/contact">
                                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg">
                                    Contact Us
                                </Button>
                            </Link>
                        </div>
                    </AnimatedSection>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
