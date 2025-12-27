import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Sun, Mail, Phone, MapPin,
    Facebook, Twitter, Instagram, Linkedin, Youtube,
    ArrowRight
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';

const Footer = () => {
    const [email, setEmail] = useState('');

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        if (email) {
            toast.success('Thank you for subscribing to our newsletter!');
            setEmail('');
        }
    };

    const footerLinks = {
        company: [
            { name: 'About Us', path: '/about' },
            { name: 'Our Team', path: '/team' },
            { name: 'Careers', path: '/careers' },
            { name: 'Press', path: '/press' },
        ],
        solutions: [
            { name: 'Home Solar', path: '/shop/home' },
            { name: 'Commercial Solar', path: '/shop/commercial' },
            { name: 'Solar Calculator', path: '/calculator' },
            { name: 'Installation', path: '/installation' },
        ],
        support: [
            { name: 'Contact Us', path: '/contact' },
            { name: 'FAQs', path: '/faqs' },
            { name: 'Warranty', path: '/warranty' },
            { name: 'Maintenance', path: '/maintenance' },
        ],
        legal: [
            { name: 'Privacy Policy', path: '/privacy' },
            { name: 'Terms of Service', path: '/terms' },
            { name: 'Cookie Policy', path: '/cookies' },
        ],
    };

    const socialLinks = [
        { icon: Facebook, href: '#', label: 'Facebook' },
        { icon: Twitter, href: '#', label: 'Twitter' },
        { icon: Instagram, href: '#', label: 'Instagram' },
        { icon: Linkedin, href: '#', label: 'LinkedIn' },
        { icon: Youtube, href: '#', label: 'YouTube' },
    ];

    return (
        <footer className="bg-foreground text-background">
            {/* Main Footer */}
            <div className="container-solar py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">

                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <Sun className="w-10 h-10 text-primary" />
                            <span className="text-2xl font-bold">
                                <span className="text-primary">Solar</span>
                                <span>Savers</span>
                            </span>
                        </Link>
                        <p className="text-background/70 mb-6 max-w-sm">
                            Empowering homes and businesses with clean, sustainable solar energy solutions.
                            Join the renewable energy revolution today.
                        </p>

                        {/* Newsletter */}
                        <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                            <p className="font-semibold text-sm">Subscribe to our newsletter</p>
                            <div className="flex gap-2">
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-background/10 border-background/20 text-background placeholder:text-background/50"
                                />
                                <Button type="submit" className="btn-primary shrink-0">
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="text-background/70 hover:text-primary transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Solutions Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Solutions</h4>
                        <ul className="space-y-3">
                            {footerLinks.solutions.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="text-background/70 hover:text-primary transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Support</h4>
                        <ul className="space-y-3">
                            {footerLinks.support.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="text-background/70 hover:text-primary transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-semibold mb-4">Contact</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <span className="text-background/70 text-sm">
                                    123 Solar Street, Green City, GC 12345
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-primary shrink-0" />
                                <a href="tel:+1234567890" className="text-background/70 hover:text-primary transition-colors">
                                    +1 (234) 567-890
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-primary shrink-0" />
                                <a href="mailto:info@solarsavers.com" className="text-background/70 hover:text-primary transition-colors">
                                    info@solarsavers.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-background/10">
                <div className="container-solar py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                        {/* Copyright */}
                        <p className="text-background/60 text-sm text-center md:text-left">
                            © {new Date().getFullYear()} SolarSavers. All rights reserved.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-4">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <motion.a
                                        key={social.label}
                                        href={social.href}
                                        aria-label={social.label}
                                        className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </motion.a>
                                );
                            })}
                        </div>

                        {/* Legal Links */}
                        <div className="flex items-center gap-4 text-sm">
                            {footerLinks.legal.map((link, index) => (
                                <React.Fragment key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="text-background/60 hover:text-primary transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                    {index < footerLinks.legal.length - 1 && (
                                        <span className="text-background/30">|</span>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
