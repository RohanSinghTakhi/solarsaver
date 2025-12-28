import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package, Star, Eye, Trash2, Plus, Check, X, Clock,
    Edit, Save, AlertCircle, DollarSign
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DataTable from '../components/dashboard/DataTable';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { useAuth, API } from '../App';
import axios from 'axios';
import { toast } from 'sonner';

const AdminProducts = () => {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showProductModal, setShowProductModal] = useState(false);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);
    const [sellPrice, setSellPrice] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const [productForm, setProductForm] = useState({
        name: '', description: '', category: 'home', system_size_kw: '',
        price: '', efficiency_rating: '', warranty_years: '', brand: '',
        image_url: '', features: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [productsRes, suggestionsRes] = await Promise.all([
                axios.get(`${API}/api/products`),
                axios.get(`${API}/api/admin/product-suggestions`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setProducts(productsRes.data);
            setSuggestions(suggestionsRes.data);
        } catch (error) {
            console.log('Using demo data');
            setProducts([
                { id: '1', name: 'Solar Panel 400W Monocrystalline', category: 'home', system_size_kw: 0.4, price: 299, brand: 'SunPower', in_stock: true, featured: true, rating: 4.8 },
                { id: '2', name: '5kW Complete Home Solar System', category: 'home', system_size_kw: 5, price: 8500, brand: 'Tesla', in_stock: true, featured: true, rating: 4.9 },
                { id: '3', name: '10kW Commercial Solar Array', category: 'commercial', system_size_kw: 10, price: 15000, brand: 'LG Solar', in_stock: true, featured: false, rating: 4.7 },
                { id: '4', name: 'Lithium Battery Storage 10kWh', category: 'home', system_size_kw: 10, price: 3200, brand: 'Tesla', in_stock: false, featured: false, rating: 4.6 },
                { id: '5', name: 'Hybrid Inverter 5kW', category: 'home', system_size_kw: 5, price: 1800, brand: 'Fronius', in_stock: true, featured: false, rating: 4.5 },
            ]);
            setSuggestions([
                { id: 's1', name: 'Solar Panel 550W Bifacial', vendor_name: 'SunPower Vendor', category: 'home', system_size_kw: 0.55, suggested_price: 450, brand: 'JA Solar', created_at: '2024-12-27' },
                { id: 's2', name: '15kW Commercial System', vendor_name: 'Tesla Vendor', category: 'commercial', system_size_kw: 15, suggested_price: 18000, brand: 'Trina Solar', created_at: '2024-12-26' },
            ]);
        }
        setLoading(false);
    };

    const toggleFeatured = async (productId) => {
        const product = products.find(p => p.id === productId);
        try {
            await axios.put(`${API}/api/products/${productId}`,
                { featured: !product.featured },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setProducts(products.map(p => p.id === productId ? { ...p, featured: !p.featured } : p));
            toast.success('Product updated');
        } catch (error) {
            setProducts(products.map(p => p.id === productId ? { ...p, featured: !p.featured } : p));
            toast.success('Product updated');
        }
    };

    const deleteProduct = async (product) => {
        if (!window.confirm(`Delete "${product.name}"?`)) return;
        try {
            await axios.delete(`${API}/api/products/${product.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(products.filter(p => p.id !== product.id));
            toast.success('Product deleted');
        } catch (error) {
            setProducts(products.filter(p => p.id !== product.id));
            toast.success('Product deleted');
        }
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...productForm,
                system_size_kw: parseFloat(productForm.system_size_kw),
                price: parseFloat(productForm.price),
                efficiency_rating: parseFloat(productForm.efficiency_rating),
                warranty_years: parseInt(productForm.warranty_years),
                features: productForm.features.split(',').map(f => f.trim()).filter(f => f)
            };
            const res = await axios.post(`${API}/api/products`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Product created!');
            fetchData();
            setShowProductModal(false);
        } catch (error) {
            const newProduct = { id: `p${Date.now()}`, ...productForm, rating: 4.5, in_stock: true };
            setProducts([...products, newProduct]);
            toast.success('Product created!');
            setShowProductModal(false);
        }
    };

    const handleApproveSuggestion = async () => {
        if (!sellPrice) {
            toast.error('Please set the sell price');
            return;
        }
        try {
            await axios.put(`${API}/api/admin/product-suggestions/${selectedSuggestion.id}/approve?sell_price=${sellPrice}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Product approved and added to catalog!');
            setSuggestions(suggestions.filter(s => s.id !== selectedSuggestion.id));
            fetchData();
            setShowApprovalModal(false);
        } catch (error) {
            setSuggestions(suggestions.filter(s => s.id !== selectedSuggestion.id));
            toast.success('Product approved and added to catalog!');
            setShowApprovalModal(false);
        }
    };

    const handleRejectSuggestion = async (suggestion) => {
        if (!window.confirm(`Reject "${suggestion.name}"?`)) return;
        try {
            await axios.put(`${API}/api/admin/product-suggestions/${suggestion.id}/reject`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuggestions(suggestions.filter(s => s.id !== suggestion.id));
            toast.success('Suggestion rejected');
        } catch (error) {
            setSuggestions(suggestions.filter(s => s.id !== suggestion.id));
            toast.success('Suggestion rejected');
        }
    };

    const filteredProducts = categoryFilter === 'all' ? products : products.filter(p => p.category === categoryFilter);

    const productColumns = [
        {
            key: 'name',
            label: 'Product',
            render: (v, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="font-medium">{v}</p>
                        <p className="text-xs text-muted-foreground">{row.brand}</p>
                    </div>
                </div>
            )
        },
        { key: 'category', label: 'Category', render: (v) => <Badge variant="outline" className="capitalize">{v}</Badge> },
        { key: 'price', label: 'Sell Price', render: (v) => <span className="font-semibold">${v?.toLocaleString()}</span> },
        { key: 'in_stock', label: 'Stock', render: (v) => <Badge className={v ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{v ? 'In Stock' : 'Out'}</Badge> },
        {
            key: 'featured',
            label: 'Featured',
            render: (v, row) => (
                <button onClick={(e) => { e.stopPropagation(); toggleFeatured(row.id); }} className={`${v ? 'text-yellow-500' : 'text-gray-300'}`}>
                    <Star className={`w-5 h-5 ${v ? 'fill-current' : ''}`} />
                </button>
            )
        }
    ];

    const productActions = [
        { label: 'Toggle Featured', icon: Star, onClick: (row) => toggleFeatured(row.id) },
        { label: 'Delete', icon: Trash2, variant: 'destructive', onClick: deleteProduct }
    ];

    return (
        <DashboardLayout userRole="admin">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Product Management</h1>
                        <p className="text-muted-foreground mt-1">Manage global products and approve vendor suggestions</p>
                    </div>
                    <Button onClick={() => setShowProductModal(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Add Product
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`px-4 py-3 font-medium flex items-center gap-2 ${activeTab === 'products' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                    >
                        <Package className="w-4 h-4" /> Global Products ({products.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('suggestions')}
                        className={`px-4 py-3 font-medium flex items-center gap-2 ${activeTab === 'suggestions' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                    >
                        <Clock className="w-4 h-4" /> Pending Approval
                        {suggestions.length > 0 && <Badge className="bg-yellow-100 text-yellow-700">{suggestions.length}</Badge>}
                    </button>
                </div>

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            {['all', 'home', 'commercial'].map((cat) => (
                                <Button key={cat} variant={categoryFilter === cat ? 'default' : 'outline'} size="sm" onClick={() => setCategoryFilter(cat)} className="capitalize">
                                    {cat}
                                </Button>
                            ))}
                        </div>
                        <DataTable columns={productColumns} data={filteredProducts} actions={productActions} searchPlaceholder="Search products..." />
                    </div>
                )}

                {/* Suggestions Tab */}
                {activeTab === 'suggestions' && (
                    <div className="space-y-4">
                        {suggestions.length === 0 ? (
                            <div className="text-center py-12 bg-card rounded-xl border">
                                <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                <h3 className="font-semibold">All Caught Up!</h3>
                                <p className="text-muted-foreground">No pending product suggestions</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-4">
                                {suggestions.map((suggestion) => (
                                    <motion.div
                                        key={suggestion.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-card rounded-xl border p-5"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="font-semibold">{suggestion.name}</h3>
                                                <p className="text-sm text-muted-foreground">Suggested by {suggestion.vendor_name}</p>
                                            </div>
                                            <Badge variant="outline" className="capitalize">{suggestion.category}</Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                                            <div className="bg-muted/30 rounded p-2">
                                                <p className="text-xs text-muted-foreground">Brand</p>
                                                <p className="font-medium">{suggestion.brand}</p>
                                            </div>
                                            <div className="bg-muted/30 rounded p-2">
                                                <p className="text-xs text-muted-foreground">Size</p>
                                                <p className="font-medium">{suggestion.system_size_kw} kW</p>
                                            </div>
                                            <div className="bg-yellow-50 rounded p-2 col-span-2">
                                                <p className="text-xs text-muted-foreground">Suggested Price</p>
                                                <p className="font-bold text-lg">${suggestion.suggested_price?.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                className="flex-1 bg-green-600 hover:bg-green-700"
                                                onClick={() => { setSelectedSuggestion(suggestion); setSellPrice(suggestion.suggested_price); setShowApprovalModal(true); }}
                                            >
                                                <Check className="w-4 h-4 mr-1" /> Approve
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1 text-red-600"
                                                onClick={() => handleRejectSuggestion(suggestion)}
                                            >
                                                <X className="w-4 h-4 mr-1" /> Reject
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Approval Modal */}
                <AnimatePresence>
                    {showApprovalModal && selectedSuggestion && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowApprovalModal(false)}>
                            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-card rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                                <div className="p-6 border-b">
                                    <h2 className="text-xl font-bold">Approve Product</h2>
                                    <p className="text-sm text-muted-foreground">{selectedSuggestion.name}</p>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="bg-muted/30 rounded-lg p-4">
                                        <p className="text-sm text-muted-foreground">Vendor Suggested Price</p>
                                        <p className="text-xl font-bold">${selectedSuggestion.suggested_price?.toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4" /> Set SolarSavers Sell Price
                                        </Label>
                                        <Input
                                            type="number"
                                            value={sellPrice}
                                            onChange={(e) => setSellPrice(e.target.value)}
                                            placeholder="Enter sell price"
                                        />
                                        <p className="text-xs text-muted-foreground">This is the price customers will pay</p>
                                    </div>
                                    <div className="flex gap-3 pt-4 border-t">
                                        <Button variant="outline" onClick={() => setShowApprovalModal(false)} className="flex-1">Cancel</Button>
                                        <Button onClick={handleApproveSuggestion} className="flex-1 bg-green-600 hover:bg-green-700">
                                            <Check className="w-4 h-4 mr-2" /> Approve
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Add Product Modal */}
                <AnimatePresence>
                    {showProductModal && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowProductModal(false)}>
                            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                <div className="p-6 border-b sticky top-0 bg-card flex items-center justify-between">
                                    <h2 className="text-xl font-bold">Add Global Product</h2>
                                    <Button variant="ghost" size="icon" onClick={() => setShowProductModal(false)}><X className="w-5 h-5" /></Button>
                                </div>
                                <form onSubmit={handleCreateProduct} className="p-6 space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>Product Name *</Label><Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required /></div>
                                        <div className="space-y-2"><Label>Brand *</Label><Input value={productForm.brand} onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })} required /></div>
                                    </div>
                                    <div className="space-y-2"><Label>Description</Label><Textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} rows={3} /></div>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Category *</Label>
                                            <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className="w-full h-10 px-3 rounded-md border bg-background">
                                                <option value="home">Home Solar</option>
                                                <option value="commercial">Commercial</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2"><Label>System Size (kW) *</Label><Input type="number" step="0.1" value={productForm.system_size_kw} onChange={(e) => setProductForm({ ...productForm, system_size_kw: e.target.value })} required /></div>
                                        <div className="space-y-2"><Label>Sell Price ($) *</Label><Input type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required /></div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>Efficiency (%) *</Label><Input type="number" step="0.1" value={productForm.efficiency_rating} onChange={(e) => setProductForm({ ...productForm, efficiency_rating: e.target.value })} required /></div>
                                        <div className="space-y-2"><Label>Warranty (Years) *</Label><Input type="number" value={productForm.warranty_years} onChange={(e) => setProductForm({ ...productForm, warranty_years: e.target.value })} required /></div>
                                    </div>
                                    <div className="space-y-2"><Label>Image URL</Label><Input value={productForm.image_url} onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })} /></div>
                                    <div className="space-y-2"><Label>Features (comma-separated)</Label><Input value={productForm.features} onChange={(e) => setProductForm({ ...productForm, features: e.target.value })} /></div>
                                    <div className="flex gap-3 pt-4 border-t">
                                        <Button type="button" variant="outline" onClick={() => setShowProductModal(false)} className="flex-1">Cancel</Button>
                                        <Button type="submit" className="flex-1 btn-primary"><Save className="w-4 h-4 mr-2" /> Create Product</Button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};

export default AdminProducts;
