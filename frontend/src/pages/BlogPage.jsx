import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, Clock, ArrowRight, Search, Tag, TrendingUp } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

// Demo blog posts data
const blogPosts = [
    {
        id: 1,
        title: "The Complete Guide to Solar Panel Installation in 2024",
        excerpt: "Everything you need to know about installing solar panels for your home, from choosing the right system to understanding costs and incentives.",
        image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800",
        category: "Installation",
        author: "Sarah Johnson",
        date: "December 20, 2024",
        readTime: "8 min read",
        featured: true
    },
    {
        id: 2,
        title: "Understanding Net Metering: How to Maximize Your Solar Savings",
        excerpt: "Learn how net metering works and discover strategies to get the most value from your solar energy system through smart energy management.",
        image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800",
        category: "Savings",
        author: "Michael Chen",
        date: "December 15, 2024",
        readTime: "6 min read",
        featured: true
    },
    {
        id: 3,
        title: "Solar Battery Storage: Is It Worth the Investment?",
        excerpt: "We break down the costs, benefits, and ROI of adding battery storage to your solar system. Find out if it's the right choice for you.",
        image: "https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=800",
        category: "Technology",
        author: "Emily Davis",
        date: "December 10, 2024",
        readTime: "10 min read",
        featured: false
    },
    {
        id: 4,
        title: "Commercial Solar: A Business Case Study",
        excerpt: "How a local manufacturing company reduced energy costs by 75% with a commercial solar installation. Real numbers and real results.",
        image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800",
        category: "Commercial",
        author: "David Wilson",
        date: "December 5, 2024",
        readTime: "7 min read",
        featured: false
    },
    {
        id: 5,
        title: "Government Solar Incentives and Tax Credits Explained",
        excerpt: "Navigate the complex world of solar incentives. From federal tax credits to state rebates, learn how to save thousands on your installation.",
        image: "https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=800",
        category: "Finance",
        author: "Jennifer Lee",
        date: "November 28, 2024",
        readTime: "5 min read",
        featured: false
    },
    {
        id: 6,
        title: "Solar Panel Maintenance: Tips for Maximum Efficiency",
        excerpt: "Keep your solar system running at peak performance with these essential maintenance tips and best practices from industry experts.",
        image: "https://images.unsplash.com/photo-1545209463-e2a9e07c8693?w=800",
        category: "Maintenance",
        author: "Robert Taylor",
        date: "November 20, 2024",
        readTime: "4 min read",
        featured: false
    }
];

const categories = ["All", "Installation", "Savings", "Technology", "Commercial", "Finance", "Maintenance"];

const BlogPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Filter posts
    const filteredPosts = blogPosts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const featuredPosts = blogPosts.filter(post => post.featured);

    return (
        <div className="min-h-screen pt-20">
            {/* Hero Section */}
            <section className="hero-gradient py-16 md:py-24">
                <div className="container-solar text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                            Solar Energy <span className="solar-text-gradient">Blog</span>
                        </h1>
                        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
                            Stay informed with the latest solar news, tips, and insights from industry experts
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-xl mx-auto relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 py-6 text-lg rounded-full bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/50"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-8 bg-muted/30 border-b">
                <div className="container-solar">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {categories.map((category) => (
                            <Button
                                key={category}
                                variant={selectedCategory === category ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedCategory(category)}
                                className={selectedCategory === category ? "btn-primary" : ""}
                            >
                                {category}
                            </Button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Posts */}
            {selectedCategory === 'All' && searchQuery === '' && (
                <section className="py-16">
                    <div className="container-solar">
                        <div className="flex items-center gap-2 mb-8">
                            <TrendingUp className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-bold">Featured Articles</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {featuredPosts.map((post, index) => (
                                <motion.article
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border"
                                >
                                    <div className="relative h-64 overflow-hidden">
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <Badge className="absolute top-4 left-4 bg-primary text-white">
                                            {post.category}
                                        </Badge>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {post.date}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {post.readTime}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-muted-foreground mb-4 line-clamp-2">
                                            {post.excerpt}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-sm">
                                                <User className="w-4 h-4" />
                                                {post.author}
                                            </span>
                                            <Button variant="ghost" size="sm" className="text-primary">
                                                Read More <ArrowRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* All Posts Grid */}
            <section className="py-16 bg-muted/30">
                <div className="container-solar">
                    <h2 className="text-2xl font-bold mb-8">
                        {selectedCategory === 'All' ? 'Latest Articles' : `${selectedCategory} Articles`}
                    </h2>

                    {filteredPosts.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground text-lg">No articles found matching your criteria.</p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                            >
                                Reset Filters
                            </Button>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredPosts.map((post, index) => (
                                <motion.article
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border"
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <Badge className="absolute top-3 left-3 bg-primary/90 text-white text-xs">
                                            {post.category}
                                        </Badge>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {post.date}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {post.readTime}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                            {post.excerpt}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <User className="w-3 h-3" />
                                                {post.author}
                                            </span>
                                            <Button variant="link" size="sm" className="text-primary p-0">
                                                Read <ArrowRight className="w-3 h-3 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Newsletter CTA */}
            <section className="py-16">
                <div className="container-solar">
                    <div className="solar-gradient rounded-3xl p-8 md:p-12 text-center text-white">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Subscribe to Our Newsletter
                        </h2>
                        <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                            Get weekly solar tips, industry news, and exclusive offers delivered to your inbox
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 flex-1"
                            />
                            <Button className="bg-white text-primary hover:bg-white/90 font-semibold">
                                Subscribe
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BlogPage;
