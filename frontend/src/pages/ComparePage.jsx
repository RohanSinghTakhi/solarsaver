import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GitCompare, X, ShoppingCart, Heart, ArrowRight, Check, Minus } from 'lucide-react';
import { useCompare, useCart, useWishlist } from '../App';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const ComparePage = () => {
    const { compareList, removeFromCompare, clearCompare } = useCompare();
    const { addToCart } = useCart();
    const { addToWishlist, isInWishlist } = useWishlist();

    const handleAddToCart = (product) => {
        addToCart(product);
        toast.success(`${product.name} added to cart!`);
    };

    const handleAddToWishlist = (product) => {
        if (isInWishlist(product.id)) {
            toast.info('Product already in wishlist');
            return;
        }
        addToWishlist(product);
        toast.success(`${product.name} added to wishlist!`);
    };

    const handleRemove = (product) => {
        removeFromCompare(product.id);
        toast.success('Removed from comparison');
    };

    // Comparison attributes
    const comparisonFields = [
        { key: 'system_size_kw', label: 'System Size', format: (v) => `${v} kW` },
        { key: 'price', label: 'Price', format: (v) => `$${v.toLocaleString()}` },
        { key: 'original_price', label: 'Original Price', format: (v) => v ? `$${v.toLocaleString()}` : '-' },
        { key: 'efficiency_rating', label: 'Efficiency Rating', format: (v) => `${v}%` },
        { key: 'warranty_years', label: 'Warranty', format: (v) => `${v} Years` },
        { key: 'brand', label: 'Brand', format: (v) => v },
        { key: 'category', label: 'Category', format: (v) => v === 'home' ? 'Home Solar' : 'Commercial Solar' },
        { key: 'in_stock', label: 'Availability', format: (v) => v ? 'In Stock' : 'Out of Stock' },
        { key: 'rating', label: 'Rating', format: (v) => `${v} / 5` },
    ];

    if (compareList.length === 0) {
        return (
            <div className="min-h-screen pt-24 pb-12">
                <div className="container-solar">
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6"
                        >
                            <GitCompare className="w-12 h-12 text-blue-400" />
                        </motion.div>
                        <h2 className="text-2xl font-bold mb-2">No Products to Compare</h2>
                        <p className="text-muted-foreground mb-6">
                            Add products to compare their specifications side by side
                        </p>
                        <Link to="/shop">
                            <Button className="btn-primary">
                                Browse Products
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12">
            <div className="container-solar">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Compare Products</h1>
                        <p className="text-muted-foreground mt-1">
                            Comparing {compareList.length} of 4 products (max 4)
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/shop">
                            <Button variant="outline">
                                Add More Products
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            className="text-destructive hover:bg-destructive hover:text-white"
                            onClick={() => {
                                clearCompare();
                                toast.success('Comparison cleared');
                            }}
                        >
                            Clear All
                        </Button>
                    </div>
                </div>

                {/* Comparison Table */}
                <div className="bg-card rounded-2xl border overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            {/* Product Headers */}
                            <thead>
                                <tr className="border-b bg-muted/30">
                                    <th className="p-4 text-left font-semibold min-w-[200px] sticky left-0 bg-muted/30">
                                        Product
                                    </th>
                                    {compareList.map((product, index) => (
                                        <th key={product.id} className="p-4 text-center min-w-[250px]">
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="relative"
                                            >
                                                {/* Remove Button */}
                                                <button
                                                    onClick={() => handleRemove(product)}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>

                                                {/* Product Image */}
                                                <Link to={`/product/${product.id}`}>
                                                    <div className="w-40 h-40 mx-auto rounded-xl overflow-hidden mb-3">
                                                        <img
                                                            src={product.image_url}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover hover:scale-110 transition-transform"
                                                        />
                                                    </div>
                                                </Link>

                                                {/* Product Name */}
                                                <Link to={`/product/${product.id}`}>
                                                    <h3 className="font-semibold text-sm hover:text-primary transition-colors line-clamp-2">
                                                        {product.name}
                                                    </h3>
                                                </Link>
                                            </motion.div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            {/* Comparison Rows */}
                            <tbody>
                                {comparisonFields.map((field, fieldIndex) => (
                                    <tr key={field.key} className={fieldIndex % 2 === 0 ? 'bg-muted/10' : ''}>
                                        <td className="p-4 font-medium text-muted-foreground sticky left-0 bg-inherit">
                                            {field.label}
                                        </td>
                                        {compareList.map((product) => {
                                            const value = product[field.key];
                                            const formattedValue = field.format(value);

                                            // Find best value for highlighting
                                            let isBest = false;
                                            if (['system_size_kw', 'efficiency_rating', 'warranty_years', 'rating'].includes(field.key)) {
                                                const maxValue = Math.max(...compareList.map(p => p[field.key] || 0));
                                                isBest = value === maxValue && compareList.length > 1;
                                            } else if (field.key === 'price') {
                                                const minValue = Math.min(...compareList.map(p => p.price));
                                                isBest = value === minValue && compareList.length > 1;
                                            }

                                            return (
                                                <td
                                                    key={product.id}
                                                    className={`p-4 text-center ${isBest ? 'text-green-600 font-semibold' : ''}`}
                                                >
                                                    {field.key === 'in_stock' ? (
                                                        value ? (
                                                            <span className="inline-flex items-center gap-1 text-green-600">
                                                                <Check className="w-4 h-4" /> In Stock
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-red-500">
                                                                <Minus className="w-4 h-4" /> Out of Stock
                                                            </span>
                                                        )
                                                    ) : (
                                                        formattedValue
                                                    )}
                                                    {isBest && <span className="ml-1 text-xs">★</span>}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}

                                {/* Features Row */}
                                <tr className="bg-muted/10">
                                    <td className="p-4 font-medium text-muted-foreground sticky left-0 bg-inherit">
                                        Features
                                    </td>
                                    {compareList.map((product) => (
                                        <td key={product.id} className="p-4">
                                            <ul className="text-left text-sm space-y-1">
                                                {product.features?.slice(0, 4).map((feature, i) => (
                                                    <li key={i} className="flex items-center gap-2">
                                                        <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                                                        <span className="line-clamp-1">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                    ))}
                                </tr>

                                {/* Action Buttons Row */}
                                <tr className="border-t">
                                    <td className="p-4 font-medium text-muted-foreground sticky left-0 bg-inherit">
                                        Actions
                                    </td>
                                    {compareList.map((product) => (
                                        <td key={product.id} className="p-4">
                                            <div className="flex flex-col gap-2">
                                                <Button
                                                    onClick={() => handleAddToCart(product)}
                                                    className="btn-primary w-full"
                                                >
                                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                                    Add to Cart
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleAddToWishlist(product)}
                                                    className={`w-full ${isInWishlist(product.id) ? 'bg-red-50 border-red-200 text-red-500' : ''}`}
                                                >
                                                    <Heart className={`w-4 h-4 mr-2 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                                                    {isInWishlist(product.id) ? 'In Wishlist' : 'Add to Wishlist'}
                                                </Button>
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Comparison Tips */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="font-semibold text-blue-900 mb-2">💡 Comparison Tips</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• <strong>System Size:</strong> Choose based on your energy needs. Larger systems generate more power.</li>
                        <li>• <strong>Efficiency Rating:</strong> Higher efficiency means more power from the same panel area.</li>
                        <li>• <strong>Warranty:</strong> Longer warranties offer better protection for your investment.</li>
                        <li>• Best values in each category are highlighted with ★</li>
                    </ul>
                </div>

                {/* Continue Shopping */}
                <div className="mt-12 text-center">
                    <Link to="/shop">
                        <Button variant="outline" size="lg">
                            Continue Shopping
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ComparePage;
