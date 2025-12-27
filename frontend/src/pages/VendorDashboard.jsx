import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Package, DollarSign, ShoppingCart, TrendingUp, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { useAuth, API } from '../App';
import { toast } from 'sonner';

const VendorDashboard = () => {
    const { user, token } = useAuth();
    const [stats, setStats] = useState({ total_products: 0, total_orders: 0, total_earnings: 0 });
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [productForm, setProductForm] = useState({ name: '', description: '', category: 'home', system_size_kw: '', price: '', efficiency_rating: '', warranty_years: '', brand: '', image_url: '', features: '' });
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [statsRes, productsRes, ordersRes] = await Promise.all([
                axios.get(`${API}/vendor/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API}/vendor/products`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API}/vendor/orders`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setStats(statsRes.data);
            setProducts(productsRes.data);
            setOrders(ordersRes.data);
        } catch (error) { console.error('Failed to fetch data:', error); }
        finally { setLoading(false); }
    };

    const handleCreateProduct = async () => {
        try {
            await axios.post(`${API}/products`, {
                ...productForm,
                system_size_kw: parseFloat(productForm.system_size_kw),
                price: parseFloat(productForm.price),
                efficiency_rating: parseFloat(productForm.efficiency_rating),
                warranty_years: parseInt(productForm.warranty_years),
                features: productForm.features.split('\n').filter(f => f.trim())
            }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Product created!');
            setDialogOpen(false);
            fetchData();
            setProductForm({ name: '', description: '', category: 'home', system_size_kw: '', price: '', efficiency_rating: '', warranty_years: '', brand: '', image_url: '', features: '' });
        } catch (error) { toast.error('Failed to create product'); }
    };

    const handleDeleteProduct = async (id) => {
        if (!confirm('Delete this product?')) return;
        try {
            await axios.delete(`${API}/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Product deleted');
            fetchData();
        } catch (error) { toast.error('Failed to delete product'); }
    };

    const statCards = [
        { icon: Package, label: 'Products', value: stats.total_products, color: 'text-blue-500 bg-blue-100' },
        { icon: ShoppingCart, label: 'Orders', value: stats.total_orders, color: 'text-purple-500 bg-purple-100' },
        { icon: DollarSign, label: 'Earnings', value: `₹${stats.total_earnings?.toLocaleString()}`, color: 'text-green-500 bg-green-100' }
    ];

    return (
        <div className="min-h-screen pt-20 bg-secondary/30">
            <div className="container-solar py-8">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
                        <p className="text-muted-foreground">Welcome back, {user?.name}</p>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild><Button className="btn-primary"><Plus className="w-4 h-4 mr-2" />Add Product</Button></DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader><DialogTitle>Add New Product</DialogTitle></DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Product Name</Label><Input value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} /></div>
                                    <div className="space-y-2"><Label>Brand</Label><Input value={productForm.brand} onChange={e => setProductForm({ ...productForm, brand: e.target.value })} /></div>
                                </div>
                                <div className="space-y-2"><Label>Description</Label><Textarea value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Category</Label>
                                        <Select value={productForm.category} onValueChange={v => setProductForm({ ...productForm, category: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent><SelectItem value="home">Home</SelectItem><SelectItem value="commercial">Commercial</SelectItem></SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2"><Label>System Size (kW)</Label><Input type="number" value={productForm.system_size_kw} onChange={e => setProductForm({ ...productForm, system_size_kw: e.target.value })} /></div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2"><Label>Price (₹)</Label><Input type="number" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} /></div>
                                    <div className="space-y-2"><Label>Efficiency (%)</Label><Input type="number" value={productForm.efficiency_rating} onChange={e => setProductForm({ ...productForm, efficiency_rating: e.target.value })} /></div>
                                    <div className="space-y-2"><Label>Warranty (Years)</Label><Input type="number" value={productForm.warranty_years} onChange={e => setProductForm({ ...productForm, warranty_years: e.target.value })} /></div>
                                </div>
                                <div className="space-y-2"><Label>Image URL</Label><Input value={productForm.image_url} onChange={e => setProductForm({ ...productForm, image_url: e.target.value })} placeholder="https://..." /></div>
                                <div className="space-y-2"><Label>Features (one per line)</Label><Textarea value={productForm.features} onChange={e => setProductForm({ ...productForm, features: e.target.value })} rows={3} /></div>
                                <Button onClick={handleCreateProduct} className="btn-primary">Create Product</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {statCards.map((stat, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card rounded-xl border p-6">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}><stat.icon className="w-6 h-6" /></div>
                                <div><p className="text-sm text-muted-foreground">{stat.label}</p><p className="text-2xl font-bold">{stat.value}</p></div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <Tabs defaultValue="products">
                    <TabsList><TabsTrigger value="products">Products</TabsTrigger><TabsTrigger value="orders">Orders</TabsTrigger></TabsList>

                    <TabsContent value="products" className="mt-6">
                        <div className="bg-card rounded-xl border overflow-hidden">
                            <Table>
                                <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Category</TableHead><TableHead>Size</TableHead><TableHead>Price</TableHead><TableHead>Stock</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {products.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell><Badge variant="secondary">{product.category}</Badge></TableCell>
                                            <TableCell>{product.system_size_kw} kW</TableCell>
                                            <TableCell>₹{product.price?.toLocaleString()}</TableCell>
                                            <TableCell><Badge className={product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{product.in_stock ? 'In Stock' : 'Out'}</Badge></TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                                                    <Button variant="ghost" size="icon"><Edit2 className="w-4 h-4" /></Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {products.length === 0 && <div className="text-center py-12 text-muted-foreground">No products yet. Add your first product!</div>}
                        </div>
                    </TabsContent>

                    <TabsContent value="orders" className="mt-6">
                        <div className="bg-card rounded-xl border overflow-hidden">
                            <Table>
                                <TableHeader><TableRow><TableHead>Order ID</TableHead><TableHead>Customer</TableHead><TableHead>Items</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {orders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-mono text-sm">#{order.id.slice(-8)}</TableCell>
                                            <TableCell>{order.user_name || 'Customer'}</TableCell>
                                            <TableCell>{order.items?.length || 0} items</TableCell>
                                            <TableCell>₹{order.total_amount?.toLocaleString()}</TableCell>
                                            <TableCell><Badge>{order.status}</Badge></TableCell>
                                            <TableCell className="text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {orders.length === 0 && <div className="text-center py-12 text-muted-foreground">No orders yet.</div>}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default VendorDashboard;
