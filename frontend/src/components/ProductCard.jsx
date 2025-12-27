import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Eye, Zap, Heart, GitCompare } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useCart, useWishlist, useCompare } from '../App';
import { toast } from 'sonner';

const ProductCard = ({ product, index = 0 }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { addToCompare, removeFromCompare, isInCompare } = useCompare();

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
        toast.success(`${product.name} added to cart!`);
    };

    const handleWishlistToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
            toast.success('Removed from wishlist');
        } else {
            addToWishlist(product);
            toast.success('Added to wishlist!');
        }
    };

    const handleCompareToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isInCompare(product.id)) {
            removeFromCompare(product.id);
            toast.success('Removed from compare');
        } else {
            addToCompare(product);
            toast.success('Added to compare!');
        }
    };

    const handleCardClick = () => {
        navigate(`/product/${product.id}`);
    };

    const discount = product.original_price
        ? Math.round((1 - product.price / product.original_price) * 100)
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="product-card group relative"
        >
            {/* Wishlist & Compare Buttons - OUTSIDE the clickable area */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleWishlistToggle}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-colors ${isInWishlist(product.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-white/90 hover:bg-red-500 hover:text-white text-gray-600'
                        }`}
                >
                    <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCompareToggle}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-colors ${isInCompare(product.id)
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/90 hover:bg-blue-500 hover:text-white text-gray-600'
                        }`}
                >
                    <GitCompare className="w-4 h-4" />
                </motion.button>
            </div>

            {/* Main clickable card area */}
            <div onClick={handleCardClick} className="cursor-pointer">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-secondary/30">
                    <img
                        src={product.image_url || 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400'}
                        alt={product.name}
                        className="product-image w-full h-full object-cover"
                    />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {discount > 0 && (
                            <Badge className="badge-sale">
                                -{discount}%
                            </Badge>
                        )}
                        {product.efficiency_rating >= 20 && (
                            <Badge className="badge-efficiency">
                                <Zap className="w-3 h-3 mr-1" />
                                High Efficiency
                            </Badge>
                        )}
                    </div>

                    {/* Quick Actions - Centered on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-10">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleAddToCart}
                            className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg"
                        >
                            <ShoppingCart className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCardClick}
                            className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-foreground shadow-lg"
                        >
                            <Eye className="w-5 h-5" />
                        </motion.button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                    {/* Category & Brand */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="uppercase tracking-wide">{product.category}</span>
                        <span>{product.brand}</span>
                    </div>

                    {/* Name */}
                    <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>

                    {/* System Size */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Zap className="w-4 h-4 text-primary" />
                        <span>{product.system_size_kw} kW System</span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.floor(product.rating || 4.5) ? 'star-filled fill-primary' : 'star-empty'}`}
                                />
                            ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                            ({product.review_count || 0})
                        </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2">
                        <span className="price-current">
                            ${product.price?.toLocaleString()}
                        </span>
                        {product.original_price && (
                            <span className="price-original">
                                ${product.original_price?.toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Add to Cart Button - Outside clickable div */}
            <div className="px-4 pb-4">
                <Button
                    onClick={handleAddToCart}
                    className="w-full btn-primary opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                </Button>
            </div>
        </motion.div>
    );
};

export default ProductCard;
