import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { CreditCard, Truck, CheckCircle, Shield, ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { useCart, useAuth, API } from '../App';
import { toast } from 'sonner';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cart, cartTotal, clearCart } = useCart();
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        address: '', city: '', state: '', pincode: '', phone: '',
        payment_method: 'cod'
    });
    const [orderPlaced, setOrderPlaced] = useState(false);

    const handlePlaceOrder = async () => {
        if (!form.address || !form.city || !form.state || !form.pincode || !form.phone) { toast.error('Please fill all address fields'); return; }
        setLoading(true);
        try {
            await axios.post(`${API}/api/orders`, {
                items: cart.map(item => ({ product_id: item.id, quantity: item.quantity })),
                shipping_address: `${form.address}, ${form.city}, ${form.state} - ${form.pincode}`,
                payment_method: form.payment_method
            }, { headers: { Authorization: `Bearer ${token}` } });
            setOrderPlaced(true);
            clearCart();
        } catch (error) { toast.error('Failed to place order'); }
        finally { setLoading(false); }
    };

    if (orderPlaced) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md mx-auto p-8">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="w-20 h-20 mx-auto bg-accent/10 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="w-10 h-10 text-accent" />
                    </motion.div>
                    <h1 className="text-2xl font-bold mb-2">Order Placed Successfully!</h1>
                    <p className="text-muted-foreground mb-6">Thank you for your order. We'll send you a confirmation email shortly.</p>
                    <div className="space-y-3">
                        <Link to="/dashboard"><Button className="w-full btn-primary">View My Orders</Button></Link>
                        <Link to="/shop"><Button variant="outline" className="w-full">Continue Shopping</Button></Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (cart.length === 0) {
        navigate('/cart');
        return null;
    }

    const total = Math.round(cartTotal * 1.18);

    return (
        <div className="min-h-screen pt-20 bg-secondary/30">
            <div className="container-solar py-8">
                <Link to="/cart" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6"><ChevronLeft className="w-4 h-4" />Back to Cart</Link>
                <h1 className="text-2xl font-bold mb-8">Checkout</h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shipping Address */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border p-6">
                            <h2 className="font-semibold text-lg mb-6 flex items-center gap-2"><Truck className="w-5 h-5 text-primary" />Shipping Address</h2>
                            <div className="grid gap-4">
                                <div className="space-y-2"><Label>Full Address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="House/Flat No, Street, Landmark" /></div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>City</Label><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
                                    <div className="space-y-2"><Label>State</Label><Input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} /></div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>PIN Code</Label><Input value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} /></div>
                                    <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Payment Method */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border p-6">
                            <h2 className="font-semibold text-lg mb-6 flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" />Payment Method</h2>
                            <RadioGroup value={form.payment_method} onValueChange={v => setForm({ ...form, payment_method: v })} className="space-y-3">
                                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:border-primary cursor-pointer"><RadioGroupItem value="cod" id="cod" /><Label htmlFor="cod" className="cursor-pointer flex-1"><span className="font-medium">Cash on Delivery</span><p className="text-sm text-muted-foreground">Pay when your order arrives</p></Label></div>
                                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:border-primary cursor-pointer"><RadioGroupItem value="online" id="online" /><Label htmlFor="online" className="cursor-pointer flex-1"><span className="font-medium">Online Payment</span><p className="text-sm text-muted-foreground">Pay with UPI, Card, or Netbanking</p></Label></div>
                            </RadioGroup>
                        </motion.div>
                    </div>

                    {/* Order Summary */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
                        <div className="bg-card rounded-xl border p-6 sticky top-24">
                            <h2 className="font-semibold text-lg mb-6">Order Summary</h2>
                            <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
                                {cart.map(item => (
                                    <div key={item.id} className="flex items-center gap-3 text-sm">
                                        <img src={item.image_url || 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=100'} alt={item.name} className="w-12 h-12 object-cover rounded" />
                                        <div className="flex-1 min-w-0"><p className="font-medium truncate">{item.name}</p><p className="text-muted-foreground">Qty: {item.quantity}</p></div>
                                        <p className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t pt-4 space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{cartTotal.toLocaleString()}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-accent">Free</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">GST (18%)</span><span>₹{Math.round(cartTotal * 0.18).toLocaleString()}</span></div>
                            </div>
                            <div className="border-t my-4" />
                            <div className="flex justify-between text-lg font-bold mb-6"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
                            <Button onClick={handlePlaceOrder} disabled={loading} className="w-full btn-primary py-6">{loading ? 'Placing Order...' : 'Place Order'}</Button>
                            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground"><Shield className="w-4 h-4" />Secure checkout</div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
