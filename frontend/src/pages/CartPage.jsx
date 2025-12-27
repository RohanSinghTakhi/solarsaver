import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useCart } from '../App';

const CartPage = () => {
    const navigate = useNavigate();
    const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

    if (cart.length === 0) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                    <ShoppingBag className="w-20 h-20 mx-auto text-muted-foreground/30 mb-6" />
                    <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
                    <p className="text-muted-foreground mb-6">Looks like you haven't added any products yet.</p>
                    <Link to="/shop"><Button className="btn-primary">Browse Products</Button></Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20">
            <div className="container-solar py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Link to="/shop" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6"><ChevronLeft className="w-4 h-4" />Continue Shopping</Link>
                    <h1 className="text-2xl font-bold mb-8">Shopping Cart ({cartCount} items)</h1>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-4">
                        {cart.map((item, index) => (
                            <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-card rounded-xl border p-4 md:p-6">
                                <div className="flex gap-4">
                                    <Link to={`/product/${item.id}`} className="shrink-0">
                                        <img src={item.image_url || 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=200'} alt={item.name} className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg" />
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between gap-4">
                                            <div><Link to={`/product/${item.id}`} className="font-semibold hover:text-primary line-clamp-2">{item.name}</Link>
                                                <p className="text-sm text-muted-foreground mt-1">{item.system_size_kw} kW • {item.brand}</p></div>
                                            <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive shrink-0"><Trash2 className="w-5 h-5" /></button>
                                        </div>
                                        <div className="flex flex-wrap items-end justify-between gap-4 mt-4">
                                            <div className="flex items-center border rounded-lg">
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:bg-secondary"><Minus className="w-4 h-4" /></button>
                                                <span className="w-10 text-center font-medium">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-secondary"><Plus className="w-4 h-4" /></button>
                                            </div>
                                            <p className="text-xl font-bold">₹{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
                        <div className="bg-card rounded-xl border p-6 sticky top-24">
                            <h2 className="font-semibold text-lg mb-6">Order Summary</h2>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal ({cartCount} items)</span><span>₹{cartTotal.toLocaleString()}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-accent">Free</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Tax (18% GST)</span><span>₹{Math.round(cartTotal * 0.18).toLocaleString()}</span></div>
                            </div>
                            <div className="border-t my-6" />
                            <div className="flex justify-between text-lg font-bold mb-6"><span>Total</span><span>₹{Math.round(cartTotal * 1.18).toLocaleString()}</span></div>
                            <Button onClick={() => navigate('/checkout')} className="w-full btn-primary">Proceed to Checkout<ArrowRight className="w-4 h-4 ml-2" /></Button>
                            <p className="text-xs text-center text-muted-foreground mt-4">Free delivery on all orders</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
