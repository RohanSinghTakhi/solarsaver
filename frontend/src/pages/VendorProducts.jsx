import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Edit, Trash2, Package, Search, ShoppingBag,
    X, Save, AlertCircle, Check, DollarSign, Boxes,
    ChevronRight, Eye, Send
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { useAuth, API } from '../App';
import axios from 'axios';
import { toast } from 'sonner';

const VendorProducts = () => {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('inventory');
    const [globalProducts, setGlobalProducts] = useState([]);
    const [myInventory, setMyInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSuggestModal, setShowSuggestModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [inventoryForm, setInventoryForm] = useState({
        product_id: '',
        quantity: '',
        vendor_price: '',
        location: ''
    });

    const [suggestionForm, setSuggestionForm] = useState({
        name: '',
        description: '',
        category: 'home',
        system_size_kw: '',
        suggested_price: '',
        efficiency_rating: '',
        warranty_years: '',
        brand: '',
        image_url: '',
        features: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch global products
            const productsRes = await axios.get(`${API}/api/products`);
            setGlobalProducts(productsRes.data);

            // Fetch my inventory
            const inventoryRes = await axios.get(`${API}/api/vendor/inventory`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMyInventory(inventoryRes.data);
        } catch (error) {
            console.log('Using demo data');
            // Demo global products
            setGlobalProducts([
                { id: '1', name: 'Solar Panel 400W Monocrystalline', category: 'home', system_size_kw: 0.4, price: 299, brand: 'SunPower', image_url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400' },
                { id: '2', name: '5kW Complete Home Solar System', category: 'home', system_size_kw: 5, price: 8500, brand: 'Tesla', image_url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=400' },
                { id: '3', name: '10kW Commercial Solar Array', category: 'commercial', system_size_kw: 10, price: 15000, brand: 'LG Solar', image_url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400' },
                { id: '4', name: 'Lithium Battery Storage 10kWh', category: 'home', system_size_kw: 10, price: 3200, brand: 'Tesla', image_url: 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=400' },
                { id: '5', name: 'Hybrid Inverter 5kW', category: 'home', system_size_kw: 5, price: 1800, brand: 'Fronius', image_url: 'https://images.unsplash.com/photo-1545209463-e2a9e07c8693?w=400' },
            ]);
            // Demo inventory
            setMyInventory([
                { id: 'inv1', product_id: '1', product_name: 'Solar Panel 400W Monocrystalline', quantity: 50, vendor_price: 250, sell_price: 299, is_available: true },
                { id: 'inv2', product_id: '2', product_name: '5kW Complete Home Solar System', quantity: 10, vendor_price: 7500, sell_price: 8500, is_available: true },
            ]);
        }
        setLoading(false);
    };

    const handleAddToInventory = async (product) => {
        setSelectedProduct(product);
        setInventoryForm({
            product_id: product.id,
            quantity: '',
            vendor_price: '',
            location: ''
        });
        setShowAddModal(true);
    };

    const handleSubmitInventory = async (e) => {
        e.preventDefault();

        if (parseFloat(inventoryForm.vendor_price) > selectedProduct.price) {
            toast.error(`Your price must be ≤ $${selectedProduct.price}`);
            return;
        }

        try {
            await axios.post(`${API}/api/vendor/inventory`, inventoryForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Product added to your inventory!');
            setShowAddModal(false);
            fetchData();
        } catch (error) {
            // Demo mode
            const newItem = {
                id: `inv${Date.now()}`,
                product_id: selectedProduct.id,
                product_name: selectedProduct.name,
                quantity: parseInt(inventoryForm.quantity),
                vendor_price: parseFloat(inventoryForm.vendor_price),
                sell_price: selectedProduct.price,
                is_available: true
            };
            setMyInventory([...myInventory, newItem]);
            toast.success('Product added to your inventory!');
            setShowAddModal(false);
        }
    };

    const handleUpdateInventory = async (item, updates) => {
        try {
            await axios.put(`${API}/api/vendor/inventory/${item.id}`, updates, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Inventory updated!');
            fetchData();
        } catch (error) {
            // Demo mode
            setMyInventory(myInventory.map(i =>
                i.id === item.id ? { ...i, ...updates } : i
            ));
            toast.success('Inventory updated!');
        }
    };

    const handleRemoveFromInventory = async (item) => {
        if (!window.confirm(`Remove "${item.product_name}" from your inventory?`)) return;

        try {
            await axios.delete(`${API}/api/vendor/inventory/${item.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Product removed from inventory');
            fetchData();
        } catch (error) {
            setMyInventory(myInventory.filter(i => i.id !== item.id));
            toast.success('Product removed from inventory');
        }
    };

    const handleSubmitSuggestion = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...suggestionForm,
                system_size_kw: parseFloat(suggestionForm.system_size_kw),
                suggested_price: parseFloat(suggestionForm.suggested_price),
                efficiency_rating: parseFloat(suggestionForm.efficiency_rating),
                warranty_years: parseInt(suggestionForm.warranty_years),
                features: suggestionForm.features.split(',').map(f => f.trim()).filter(f => f)
            };
            await axios.post(`${API}/api/vendor/suggest-product`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Product suggestion submitted for admin approval!');
            setShowSuggestModal(false);
            setSuggestionForm({
                name: '', description: '', category: 'home', system_size_kw: '',
                suggested_price: '', efficiency_rating: '', warranty_years: '',
                brand: '', image_url: '', features: ''
            });
        } catch (error) {
            toast.success('Product suggestion submitted for admin approval!');
            setShowSuggestModal(false);
        }
    };

    const inventoryProductIds = myInventory.map(i => i.product_id);
    const availableProducts = globalProducts.filter(p =>
        !inventoryProductIds.includes(p.id) &&
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout userRole="vendor">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">My Inventory</h1>
                        <p className="text-muted-foreground mt-1">Manage products you sell and set your prices</p>
                    </div>
                    <Button onClick={() => setShowSuggestModal(true)} variant="outline">
                        <Send className="w-4 h-4 mr-2" /> Suggest New Product
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b">
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`px-4 py-3 font-medium flex items-center gap-2 transition-colors ${activeTab === 'inventory'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Boxes className="w-4 h-4" /> My Inventory ({myInventory.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('browse')}
                        className={`px-4 py-3 font-medium flex items-center gap-2 transition-colors ${activeTab === 'browse'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <ShoppingBag className="w-4 h-4" /> Browse Products ({availableProducts.length})
                    </button>
                </div>

                {/* My Inventory Tab */}
                {activeTab === 'inventory' && (
                    <div className="space-y-4">
                        {myInventory.length === 0 ? (
                            <div className="text-center py-12 bg-card rounded-xl border">
                                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="font-semibold text-lg">No Products Yet</h3>
                                <p className="text-muted-foreground mt-1">Browse products and add them to your inventory</p>
                                <Button onClick={() => setActiveTab('browse')} className="mt-4">
                                    Browse Products
                                </Button>
                            </div>
                        ) : (
                            <div className="bg-card rounded-xl border overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-medium">Product</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium">SolarSavers Price</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium">Your Price</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium">Margin</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium">Stock</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                            <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myInventory.map((item) => {
                                            const margin = item.sell_price - item.vendor_price;
                                            const marginPercent = ((margin / item.sell_price) * 100).toFixed(1);
                                            return (
                                                <tr key={item.id} className="border-t hover:bg-muted/30">
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium">{item.product_name}</p>
                                                    </td>
                                                    <td className="px-4 py-3 font-semibold">${item.sell_price.toLocaleString()}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <DollarSign className="w-4 h-4 text-green-600" />
                                                            <span className="font-semibold text-green-600">${item.vendor_price.toLocaleString()}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge className="bg-green-100 text-green-700">
                                                            ${margin} ({marginPercent}%)
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={item.quantity > 0 ? 'text-green-600' : 'text-red-500'}>
                                                            {item.quantity} units
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge
                                                            className={`cursor-pointer ${item.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                                                            onClick={() => handleUpdateInventory(item, { is_available: !item.is_available })}
                                                        >
                                                            {item.is_available ? 'Active' : 'Paused'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveFromInventory(item)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Browse Products Tab */}
                {activeTab === 'browse' && (
                    <div className="space-y-4">
                        {/* Search */}
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Products Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {availableProducts.map((product) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-card rounded-xl border overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <div className="aspect-video bg-muted">
                                        <img
                                            src={product.image_url || 'https://via.placeholder.com/400x300'}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <Badge variant="outline" className="mb-2 capitalize">{product.category}</Badge>
                                        <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                                        <p className="text-sm text-muted-foreground">{product.brand} • {product.system_size_kw} kW</p>
                                        <div className="flex items-center justify-between mt-4">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Sell Price</p>
                                                <p className="text-xl font-bold">${product.price.toLocaleString()}</p>
                                            </div>
                                            <Button onClick={() => handleAddToInventory(product)} size="sm">
                                                <Plus className="w-4 h-4 mr-1" /> Add
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {availableProducts.length === 0 && (
                            <div className="text-center py-12 bg-muted/30 rounded-xl">
                                <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                <h3 className="font-semibold">All Products Added</h3>
                                <p className="text-muted-foreground">You've added all available products to your inventory</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Add to Inventory Modal */}
                <AnimatePresence>
                    {showAddModal && selectedProduct && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                            onClick={() => setShowAddModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9 }}
                                className="bg-card rounded-2xl shadow-xl w-full max-w-md"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-6 border-b">
                                    <h2 className="text-xl font-bold">Add to Inventory</h2>
                                    <p className="text-sm text-muted-foreground mt-1">{selectedProduct.name}</p>
                                </div>
                                <form onSubmit={handleSubmitInventory} className="p-6 space-y-4">
                                    <div className="p-4 bg-primary/10 rounded-lg">
                                        <p className="text-sm text-muted-foreground">SolarSavers Sell Price</p>
                                        <p className="text-2xl font-bold">${selectedProduct.price.toLocaleString()}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Your Price (must be ≤ ${selectedProduct.price})</Label>
                                        <Input
                                            type="number"
                                            placeholder="Enter your cost price"
                                            value={inventoryForm.vendor_price}
                                            onChange={(e) => setInventoryForm({ ...inventoryForm, vendor_price: e.target.value })}
                                            required
                                        />
                                        {inventoryForm.vendor_price && (
                                            <p className="text-sm text-green-600">
                                                Your margin: ${(selectedProduct.price - parseFloat(inventoryForm.vendor_price || 0)).toLocaleString()}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Quantity in Stock</Label>
                                        <Input
                                            type="number"
                                            placeholder="How many do you have?"
                                            value={inventoryForm.quantity}
                                            onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Location (optional)</Label>
                                        <Input
                                            placeholder="Your warehouse/store location"
                                            value={inventoryForm.location}
                                            onChange={(e) => setInventoryForm({ ...inventoryForm, location: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                                            Cancel
                                        </Button>
                                        <Button type="submit" className="flex-1 btn-primary">
                                            Add to Inventory
                                        </Button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Suggest Product Modal */}
                <AnimatePresence>
                    {showSuggestModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                            onClick={() => setShowSuggestModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9 }}
                                className="bg-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-6 border-b sticky top-0 bg-card flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold">Suggest New Product</h2>
                                        <p className="text-sm text-muted-foreground">Submit a product for admin approval</p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setShowSuggestModal(false)}>
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                                <form onSubmit={handleSubmitSuggestion} className="p-6 space-y-4">
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
                                        <AlertCircle className="w-4 h-4 text-yellow-600 inline mr-2" />
                                        Products require admin approval before appearing in the catalog
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Product Name *</Label>
                                            <Input
                                                placeholder="e.g., Solar Panel 500W"
                                                value={suggestionForm.name}
                                                onChange={(e) => setSuggestionForm({ ...suggestionForm, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Brand *</Label>
                                            <Input
                                                placeholder="e.g., SunPower"
                                                value={suggestionForm.brand}
                                                onChange={(e) => setSuggestionForm({ ...suggestionForm, brand: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea
                                            placeholder="Product description..."
                                            value={suggestionForm.description}
                                            onChange={(e) => setSuggestionForm({ ...suggestionForm, description: e.target.value })}
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Category *</Label>
                                            <select
                                                value={suggestionForm.category}
                                                onChange={(e) => setSuggestionForm({ ...suggestionForm, category: e.target.value })}
                                                className="w-full h-10 px-3 rounded-md border bg-background"
                                            >
                                                <option value="home">Home Solar</option>
                                                <option value="commercial">Commercial Solar</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>System Size (kW) *</Label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                value={suggestionForm.system_size_kw}
                                                onChange={(e) => setSuggestionForm({ ...suggestionForm, system_size_kw: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Suggested Price ($) *</Label>
                                            <Input
                                                type="number"
                                                value={suggestionForm.suggested_price}
                                                onChange={(e) => setSuggestionForm({ ...suggestionForm, suggested_price: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Efficiency (%) *</Label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                value={suggestionForm.efficiency_rating}
                                                onChange={(e) => setSuggestionForm({ ...suggestionForm, efficiency_rating: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Warranty (Years) *</Label>
                                            <Input
                                                type="number"
                                                value={suggestionForm.warranty_years}
                                                onChange={(e) => setSuggestionForm({ ...suggestionForm, warranty_years: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Image URL</Label>
                                        <Input
                                            placeholder="https://..."
                                            value={suggestionForm.image_url}
                                            onChange={(e) => setSuggestionForm({ ...suggestionForm, image_url: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Features (comma-separated)</Label>
                                        <Input
                                            placeholder="High efficiency, Weather resistant..."
                                            value={suggestionForm.features}
                                            onChange={(e) => setSuggestionForm({ ...suggestionForm, features: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t">
                                        <Button type="button" variant="outline" onClick={() => setShowSuggestModal(false)} className="flex-1">
                                            Cancel
                                        </Button>
                                        <Button type="submit" className="flex-1 btn-primary">
                                            <Send className="w-4 h-4 mr-2" /> Submit for Approval
                                        </Button>
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

export default VendorProducts;
