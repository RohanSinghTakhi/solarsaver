import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
    Filter, Grid3X3, List, SlidersHorizontal, X, Search,
    Sun, Building2, ChevronDown, Star
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { Badge } from '../components/ui/badge';
import ProductCard from '../components/ProductCard';
import { API } from '../App';

const ShopPage = () => {
    const { category } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [brands, setBrands] = useState([]);
    const [viewMode, setViewMode] = useState('grid');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    // Filter states
    const [filters, setFilters] = useState({
        category: category || searchParams.get('category') || '',
        minPrice: parseInt(searchParams.get('minPrice')) || 0,
        maxPrice: parseInt(searchParams.get('maxPrice')) || 500000,
        minSize: parseFloat(searchParams.get('minSize')) || 0,
        maxSize: parseFloat(searchParams.get('maxSize')) || 100,
        brands: searchParams.get('brands')?.split(',').filter(Boolean) || [],
        minRating: parseInt(searchParams.get('minRating')) || 0,
        inStock: searchParams.get('inStock') === 'true'
    });

    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'featured');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchProducts();
        fetchBrands();
    }, [filters, sortBy, category]);

    useEffect(() => {
        if (category) {
            setFilters(prev => ({ ...prev, category }));
        }
    }, [category]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.category) params.append('category', filters.category);
            if (filters.minPrice > 0) params.append('min_price', filters.minPrice);
            if (filters.maxPrice < 500000) params.append('max_price', filters.maxPrice);
            if (filters.minSize > 0) params.append('min_size', filters.minSize);
            if (filters.maxSize < 100) params.append('max_size', filters.maxSize);
            if (filters.brands.length > 0) params.append('brand', filters.brands[0]);
            if (filters.inStock) params.append('in_stock', 'true');

            const response = await axios.get(`${API}/products?${params.toString()}`);
            let data = response.data;

            // Client-side sorting
            if (sortBy === 'price_low') {
                data.sort((a, b) => a.price - b.price);
            } else if (sortBy === 'price_high') {
                data.sort((a, b) => b.price - a.price);
            } else if (sortBy === 'rating') {
                data.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            } else if (sortBy === 'size_low') {
                data.sort((a, b) => a.system_size_kw - b.system_size_kw);
            } else if (sortBy === 'size_high') {
                data.sort((a, b) => b.system_size_kw - a.system_size_kw);
            }

            // Client-side search
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                data = data.filter(p =>
                    p.name.toLowerCase().includes(query) ||
                    p.description?.toLowerCase().includes(query) ||
                    p.brand?.toLowerCase().includes(query)
                );
            }

            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBrands = async () => {
        try {
            const response = await axios.get(`${API}/brands`);
            setBrands(response.data);
        } catch (error) {
            console.error('Failed to fetch brands:', error);
        }
    };

    const handleBrandToggle = (brand) => {
        setFilters(prev => ({
            ...prev,
            brands: prev.brands.includes(brand)
                ? prev.brands.filter(b => b !== brand)
                : [...prev.brands, brand]
        }));
    };

    const clearFilters = () => {
        setFilters({
            category: '',
            minPrice: 0,
            maxPrice: 500000,
            minSize: 0,
            maxSize: 100,
            brands: [],
            minRating: 0,
            inStock: false
        });
    };

    const activeFilterCount = [
        filters.category,
        filters.minPrice > 0,
        filters.maxPrice < 500000,
        filters.minSize > 0,
        filters.maxSize < 100,
        filters.brands.length > 0,
        filters.minRating > 0,
        filters.inStock
    ].filter(Boolean).length;

    const FilterSidebar = () => (
        <div className="space-y-6">
            {/* Category */}
            <div className="space-y-3">
                <Label className="text-sm font-semibold">Category</Label>
                <div className="space-y-2">
                    <button
                        onClick={() => setFilters(prev => ({ ...prev, category: '' }))}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${!filters.category ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
                            }`}
                    >
                        <Sun className="w-5 h-5" />
                        All Products
                    </button>
                    <button
                        onClick={() => setFilters(prev => ({ ...prev, category: 'home' }))}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${filters.category === 'home' ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
                            }`}
                    >
                        <Sun className="w-5 h-5" />
                        Home Solar
                    </button>
                    <button
                        onClick={() => setFilters(prev => ({ ...prev, category: 'commercial' }))}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${filters.category === 'commercial' ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
                            }`}
                    >
                        <Building2 className="w-5 h-5" />
                        Commercial Solar
                    </button>
                </div>
            </div>

            {/* System Size */}
            <div className="space-y-3">
                <Label className="text-sm font-semibold">System Size (kW)</Label>
                <div className="px-2">
                    <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[filters.minSize, filters.maxSize]}
                        onValueChange={([min, max]) => setFilters(prev => ({ ...prev, minSize: min, maxSize: max }))}
                        className="my-4"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{filters.minSize} kW</span>
                        <span>{filters.maxSize} kW</span>
                    </div>
                </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
                <Label className="text-sm font-semibold">Price Range</Label>
                <div className="px-2">
                    <Slider
                        min={0}
                        max={500000}
                        step={5000}
                        value={[filters.minPrice, filters.maxPrice]}
                        onValueChange={([min, max]) => setFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }))}
                        className="my-4"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>₹{filters.minPrice.toLocaleString()}</span>
                        <span>₹{filters.maxPrice.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Brands */}
            <div className="space-y-3">
                <Label className="text-sm font-semibold">Brands</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {brands.map((brand) => (
                        <div key={brand} className="flex items-center gap-3">
                            <Checkbox
                                id={brand}
                                checked={filters.brands.includes(brand)}
                                onCheckedChange={() => handleBrandToggle(brand)}
                            />
                            <label htmlFor={brand} className="text-sm cursor-pointer">{brand}</label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Rating */}
            <div className="space-y-3">
                <Label className="text-sm font-semibold">Minimum Rating</Label>
                <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                        <button
                            key={rating}
                            onClick={() => setFilters(prev => ({ ...prev, minRating: rating }))}
                            className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${filters.minRating === rating ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
                                }`}
                        >
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-primary text-primary' : 'text-muted'}`} />
                                ))}
                            </div>
                            <span className="text-sm">& up</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* In Stock */}
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                <Checkbox
                    id="inStock"
                    checked={filters.inStock}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, inStock: checked }))}
                />
                <label htmlFor="inStock" className="text-sm cursor-pointer">In Stock Only</label>
            </div>

            {/* Clear Filters */}
            {activeFilterCount > 0 && (
                <Button variant="outline" onClick={clearFilters} className="w-full">
                    Clear All Filters ({activeFilterCount})
                </Button>
            )}
        </div>
    );

    return (
        <div className="min-h-screen pt-20">
            {/* Hero Banner */}
            <section className="relative h-48 md:h-64 bg-gradient-to-r from-foreground to-foreground/90 flex items-center">
                <div className="absolute inset-0 opacity-20">
                    <img
                        src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200"
                        alt="Solar Panels"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="container-solar relative z-10 text-white">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-4xl font-bold mb-2"
                    >
                        {filters.category === 'home'
                            ? 'Home Solar Solutions'
                            : filters.category === 'commercial'
                                ? 'Commercial Solar Solutions'
                                : 'Solar Products'
                        }
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-white/80"
                    >
                        Browse our selection of premium solar systems and panels
                    </motion.p>
                </div>
            </section>

            <div className="container-solar py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar - Desktop */}
                    <aside className="hidden lg:block w-72 shrink-0">
                        <div className="sticky top-24 bg-card rounded-2xl border border-border p-6">
                            <h2 className="font-semibold text-lg mb-6 flex items-center gap-2">
                                <Filter className="w-5 h-5" />
                                Filters
                            </h2>
                            <FilterSidebar />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            {/* Search */}
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Mobile Filter Button */}
                                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" className="lg:hidden relative">
                                            <SlidersHorizontal className="w-5 h-5 mr-2" />
                                            Filters
                                            {activeFilterCount > 0 && (
                                                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                                                    {activeFilterCount}
                                                </Badge>
                                            )}
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="left" className="w-80 overflow-y-auto">
                                        <SheetHeader>
                                            <SheetTitle className="flex items-center gap-2">
                                                <Filter className="w-5 h-5" />
                                                Filters
                                            </SheetTitle>
                                        </SheetHeader>
                                        <div className="mt-6">
                                            <FilterSidebar />
                                        </div>
                                    </SheetContent>
                                </Sheet>

                                {/* Sort */}
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="featured">Featured</SelectItem>
                                        <SelectItem value="price_low">Price: Low to High</SelectItem>
                                        <SelectItem value="price_high">Price: High to Low</SelectItem>
                                        <SelectItem value="rating">Top Rated</SelectItem>
                                        <SelectItem value="size_low">Size: Low to High</SelectItem>
                                        <SelectItem value="size_high">Size: High to Low</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* View Mode */}
                                <div className="hidden md:flex items-center border rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
                                    >
                                        <Grid3X3 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
                                    >
                                        <List className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Active Filters */}
                        {activeFilterCount > 0 && (
                            <div className="flex flex-wrap items-center gap-2 mb-6">
                                <span className="text-sm text-muted-foreground">Active filters:</span>
                                {filters.category && (
                                    <Badge variant="secondary" className="gap-1">
                                        {filters.category}
                                        <X
                                            className="w-3 h-3 cursor-pointer"
                                            onClick={() => setFilters(prev => ({ ...prev, category: '' }))}
                                        />
                                    </Badge>
                                )}
                                {filters.brands.map(brand => (
                                    <Badge key={brand} variant="secondary" className="gap-1">
                                        {brand}
                                        <X
                                            className="w-3 h-3 cursor-pointer"
                                            onClick={() => handleBrandToggle(brand)}
                                        />
                                    </Badge>
                                ))}
                                {(filters.minPrice > 0 || filters.maxPrice < 500000) && (
                                    <Badge variant="secondary" className="gap-1">
                                        ₹{filters.minPrice.toLocaleString()} - ₹{filters.maxPrice.toLocaleString()}
                                        <X
                                            className="w-3 h-3 cursor-pointer"
                                            onClick={() => setFilters(prev => ({ ...prev, minPrice: 0, maxPrice: 500000 }))}
                                        />
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Products Count */}
                        <p className="text-muted-foreground mb-6">
                            Showing {products.length} products
                        </p>

                        {/* Products Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden animate-pulse">
                                        <div className="aspect-square bg-secondary" />
                                        <div className="p-4 space-y-3">
                                            <div className="h-4 bg-secondary rounded w-1/4" />
                                            <div className="h-6 bg-secondary rounded w-3/4" />
                                            <div className="h-4 bg-secondary rounded w-1/2" />
                                            <div className="h-6 bg-secondary rounded w-1/3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <div className={viewMode === 'grid'
                                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                                : 'space-y-4'
                            }>
                                {products.map((product, index) => (
                                    <ProductCard key={product.id} product={product} index={index} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <Sun className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                                <p className="text-muted-foreground mb-6">Try adjusting your filters to find what you're looking for.</p>
                                <Button onClick={clearFilters} variant="outline">Clear All Filters</Button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ShopPage;
