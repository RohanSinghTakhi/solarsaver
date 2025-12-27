import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, GitCompare, ArrowRight } from 'lucide-react';
import { useWishlist, useCart, useCompare } from '../App';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const WishlistPage = () => {
    const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
    const { addToCart } = useCart();
    const { addToCompare, isInCompare } = useCompare();

    const handleAddToCart = (product) => {
        addToCart(product);
        toast.success(`${product.name} added to cart!`);
    };

    const handleAddToCompare = (product) => {
        if (isInCompare(product.id)) {
            toast.info('Product already in compare list');
            return;
        }
        addToCompare(product);
        toast.success(`${product.name} added to compare!`);
    };

    const handleRemove = (product) => {
        removeFromWishlist(product.id);
        toast.success('Removed from wishlist');
    };

    if (wishlist.length === 0) {
        return (
            <div className="min-h-screen pt-24 pb-12">
                <div className="container-solar">
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6"
                        >
                            <Heart className="w-12 h-12 text-red-400" />
                        </motion.div>
                        <h2 className="text-2xl font-bold mb-2">Your Wishlist is Empty</h2>
                        <p className="text-muted-foreground mb-6">
                            Save your favorite solar products to view them later
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
                        <h1 className="text-3xl font-bold">My Wishlist</h1>
                        <p className="text-muted-foreground mt-1">{wishlist.length} items saved</p>
                    </div>
                    <Button
                        variant="outline"
                        className="text-destructive hover:bg-destructive hover:text-white"
                        onClick={() => {
                            clearWishlist();
                            toast.success('Wishlist cleared');
                        }}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All
                    </Button>
                </div>

                {/* Wishlist Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {wishlist.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border"
                        >
                            {/* Product Image */}
                            <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden">
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                />
                                {product.original_price && (
                                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                                        -{Math.round((1 - product.price / product.original_price) * 100)}%
                                    </div>
                                )}
                            </Link>

                            {/* Product Info */}
                            <div className="p-4">
                                <p className="text-xs text-primary font-medium mb-1">{product.brand}</p>
                                <Link to={`/product/${product.id}`}>
                                    <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
                                        {product.name}
                                    </h3>
                                </Link>
                                <p className="text-sm text-muted-foreground mt-1">{product.system_size_kw} kW System</p>

                                {/* Price */}
                                <div className="flex items-center gap-2 mt-3">
                                    <span className="text-xl font-bold text-primary">
                                        ${product.price.toLocaleString()}
                                    </span>
                                    {product.original_price && (
                                        <span className="text-sm text-muted-foreground line-through">
                                            ${product.original_price.toLocaleString()}
                                        </span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 mt-4">
                                    <Button
                                        onClick={() => handleAddToCart(product)}
                                        className="flex-1 btn-primary text-sm py-2"
                                    >
                                        <ShoppingCart className="w-4 h-4 mr-1" />
                                        Add to Cart
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleAddToCompare(product)}
                                        className={isInCompare(product.id) ? 'bg-blue-100 border-blue-500' : ''}
                                    >
                                        <GitCompare className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleRemove(product)}
                                        className="text-destructive hover:bg-destructive hover:text-white"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
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

export default WishlistPage;
