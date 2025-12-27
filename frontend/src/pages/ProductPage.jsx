import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
    Star, ShoppingCart, Minus, Plus, Zap, Shield, Truck,
    RefreshCcw, ChevronRight, CheckCircle2, Store
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Textarea } from '../components/ui/textarea';
import ProductCard from '../components/ProductCard';
import { useCart, useAuth, API } from '../App';
import { toast } from 'sonner';

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user, token } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        fetchProduct();
        fetchReviews();
        window.scrollTo(0, 0);
    }, [id]);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API}/products/${id}`);
            setProduct(response.data);
            const relatedRes = await axios.get(`${API}/products?category=${response.data.category}&limit=4`);
            setRelatedProducts(relatedRes.data.filter(p => p.id !== id));
        } catch (error) {
            toast.error('Product not found');
            navigate('/shop');
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`${API}/products/${id}/reviews`);
            setReviews(response.data);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        }
    };

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, quantity);
            toast.success(`${product.name} added to cart!`);
        }
    };

    const handleSubmitReview = async () => {
        if (!user) { navigate('/login'); return; }
        if (!newReview.comment.trim()) { toast.error('Please write a review'); return; }
        setSubmittingReview(true);
        try {
            await axios.post(`${API}/reviews`, { product_id: id, rating: newReview.rating, comment: newReview.comment },
                { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Review submitted!');
            setNewReview({ rating: 5, comment: '' });
            fetchReviews();
        } catch (error) { toast.error('Failed to submit review'); }
        finally { setSubmittingReview(false); }
    };

    if (loading) return (
        <div className="min-h-screen pt-20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        </div>
    );

    if (!product) return null;
    const discount = product.original_price ? Math.round((1 - product.price / product.original_price) * 100) : 0;

    return (
        <div className="min-h-screen pt-20">
            <div className="container-solar py-8">
                <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                    <Link to="/" className="hover:text-primary">Home</Link>
                    <ChevronRight className="w-4 h-4" />
                    <Link to="/shop" className="hover:text-primary">Shop</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-foreground">{product.name}</span>
                </nav>

                <div className="grid lg:grid-cols-2 gap-12 mb-16">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary/30">
                            <img src={product.image_url || 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800'} alt={product.name} className="w-full h-full object-cover" />
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                {discount > 0 && <Badge className="badge-sale">-{discount}%</Badge>}
                                {product.efficiency_rating >= 20 && <Badge className="badge-efficiency"><Zap className="w-3 h-3 mr-1" />High Efficiency</Badge>}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="flex items-center gap-3 text-sm">
                            <span className="text-muted-foreground uppercase">{product.category}</span>
                            <Separator orientation="vertical" className="h-4" />
                            <span className="text-primary font-medium">{product.brand}</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
                        <div className="flex items-center gap-3">
                            <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating || 4.5) ? 'fill-primary text-primary' : 'text-muted'}`} />)}</div>
                            <span className="text-muted-foreground">{product.rating || 4.5} ({product.review_count || 0} reviews)</span>
                        </div>
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-bold font-mono">₹{product.price?.toLocaleString()}</span>
                            {product.original_price && <span className="text-xl text-muted-foreground line-through font-mono">₹{product.original_price?.toLocaleString()}</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-xl">
                            <div className="flex items-center gap-3"><div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center"><Zap className="w-5 h-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">System Size</p><p className="font-semibold">{product.system_size_kw} kW</p></div></div>
                            <div className="flex items-center gap-3"><div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center"><RefreshCcw className="w-5 h-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">Efficiency</p><p className="font-semibold">{product.efficiency_rating}%</p></div></div>
                            <div className="flex items-center gap-3"><div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center"><Shield className="w-5 h-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">Warranty</p><p className="font-semibold">{product.warranty_years} Years</p></div></div>
                            <div className="flex items-center gap-3"><div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center"><Store className="w-5 h-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">Vendor</p><p className="font-semibold">{product.vendor_name}</p></div></div>
                        </div>

                        {product.features?.length > 0 && (
                            <div className="space-y-2">
                                <p className="font-semibold">Key Features:</p>
                                <ul className="space-y-2">{product.features.map((f, i) => <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />{f}</li>)}</ul>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center border rounded-lg">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-secondary"><Minus className="w-4 h-4" /></button>
                                <span className="w-12 text-center font-semibold">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-secondary"><Plus className="w-4 h-4" /></button>
                            </div>
                            <Button onClick={handleAddToCart} className="btn-primary flex-1"><ShoppingCart className="w-5 h-5 mr-2" />Add to Cart</Button>
                        </div>

                        <div className="flex items-center gap-6 p-4 bg-accent/10 rounded-xl text-sm">
                            <div className="flex items-center gap-2"><Truck className="w-5 h-5 text-accent" /><span>Free Delivery</span></div>
                            <div className="flex items-center gap-2"><RefreshCcw className="w-5 h-5 text-accent" /><span>30-Day Returns</span></div>
                        </div>
                    </motion.div>
                </div>

                <Tabs defaultValue="description" className="mb-16">
                    <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                        <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-3">Description</TabsTrigger>
                        <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-3">Reviews ({reviews.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="description" className="pt-6"><p className="text-muted-foreground leading-relaxed">{product.description}</p></TabsContent>
                    <TabsContent value="reviews" className="pt-6">
                        <div className="space-y-8">
                            <div className="bg-secondary/30 rounded-xl p-6">
                                <h3 className="font-semibold mb-4">Write a Review</h3>
                                <div className="flex items-center gap-1 mb-4">{[1, 2, 3, 4, 5].map(star => <button key={star} onClick={() => setNewReview({ ...newReview, rating: star })}><Star className={`w-6 h-6 ${star <= newReview.rating ? 'fill-primary text-primary' : 'text-muted'}`} /></button>)}</div>
                                <Textarea placeholder="Share your experience..." value={newReview.comment} onChange={e => setNewReview({ ...newReview, comment: e.target.value })} rows={3} className="mb-4" />
                                <Button onClick={handleSubmitReview} disabled={submittingReview} className="btn-primary">{submittingReview ? 'Submitting...' : 'Submit'}</Button>
                            </div>
                            <div className="space-y-6">
                                {reviews.length > 0 ? reviews.map(review => (
                                    <div key={review.id} className="border-b pb-6">
                                        <div className="flex items-start gap-4">
                                            <Avatar><AvatarFallback>{review.user_name?.[0] || 'U'}</AvatarFallback></Avatar>
                                            <div className="flex-1">
                                                <p className="font-semibold">{review.user_name}</p>
                                                <div className="flex items-center gap-1 mb-2">{[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-primary text-primary' : 'text-muted'}`} />)}</div>
                                                <p className="text-muted-foreground">{review.comment}</p>
                                            </div>
                                        </div>
                                    </div>
                                )) : <p className="text-center text-muted-foreground py-8">No reviews yet.</p>}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                {relatedProducts.length > 0 && (
                    <section>
                        <h2 className="section-title mb-8">Related Products</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{relatedProducts.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default ProductPage;
