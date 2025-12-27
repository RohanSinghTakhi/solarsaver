import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Edit, Trash2, Eye, Package, Search, Filter,
    X, Upload, Save, AlertCircle
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DataTable from '../components/dashboard/DataTable';
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
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'home',
        system_size_kw: '',
        price: '',
        original_price: '',
        efficiency_rating: '',
        warranty_years: '',
        brand: '',
        image_url: '',
        features: '',
        in_stock: true
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/vendor/products`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(res.data);
        } catch (error) {
            // Demo data
            setProducts([
                { id: '1', name: 'Solar Panel 400W Monocrystalline', category: 'home', system_size_kw: 0.4, price: 299, original_price: 349, efficiency_rating: 21.5, warranty_years: 25, brand: 'SunPower', in_stock: true, image_url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400' },
                { id: '2', name: '5kW Complete Home Solar System', category: 'home', system_size_kw: 5, price: 8500, original_price: 9500, efficiency_rating: 20.5, warranty_years: 20, brand: 'Tesla', in_stock: true, image_url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=400' },
                { id: '3', name: '10kW Commercial Solar Array', category: 'commercial', system_size_kw: 10, price: 15000, original_price: 17000, efficiency_rating: 22, warranty_years: 25, brand: 'LG Solar', in_stock: true, image_url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400' },
                { id: '4', name: 'Lithium Battery Storage 10kWh', category: 'home', system_size_kw: 10, price: 3200, original_price: null, efficiency_rating: 95, warranty_years: 10, brand: 'Tesla', in_stock: false, image_url: 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=400' },
                { id: '5', name: 'Hybrid Inverter 5kW', category: 'home', system_size_kw: 5, price: 1800, original_price: 2100, efficiency_rating: 97, warranty_years: 10, brand: 'Fronius', in_stock: true, image_url: 'https://images.unsplash.com/photo-1545209463-e2a9e07c8693?w=400' },
            ]);
        }
        setLoading(false);
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                description: product.description || '',
                category: product.category,
                system_size_kw: product.system_size_kw,
                price: product.price,
                original_price: product.original_price || '',
                efficiency_rating: product.efficiency_rating,
                warranty_years: product.warranty_years,
                brand: product.brand,
                image_url: product.image_url || '',
                features: Array.isArray(product.features) ? product.features.join(', ') : '',
                in_stock: product.in_stock
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                description: '',
                category: 'home',
                system_size_kw: '',
                price: '',
                original_price: '',
                efficiency_rating: '',
                warranty_years: '',
                brand: '',
                image_url: '',
                features: '',
                in_stock: true
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const productData = {
                ...formData,
                system_size_kw: parseFloat(formData.system_size_kw),
                price: parseFloat(formData.price),
                original_price: formData.original_price ? parseFloat(formData.original_price) : null,
                efficiency_rating: parseFloat(formData.efficiency_rating),
                warranty_years: parseInt(formData.warranty_years),
                features: formData.features.split(',').map(f => f.trim()).filter(f => f)
            };

            if (editingProduct) {
                // Update - demo mode
                setProducts(products.map(p =>
                    p.id === editingProduct.id ? { ...p, ...productData } : p
                ));
                toast.success('Product updated successfully!');
            } else {
                // Create - demo mode
                const newProduct = {
                    ...productData,
                    id: Date.now().toString(),
                };
                setProducts([newProduct, ...products]);
                toast.success('Product created successfully!');
            }
            setShowModal(false);
        } catch (error) {
            toast.error('Failed to save product');
        }
    };

    const handleDelete = async (product) => {
        if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
            try {
                // Demo mode
                setProducts(products.filter(p => p.id !== product.id));
                toast.success('Product deleted successfully!');
            } catch (error) {
                toast.error('Failed to delete product');
            }
        }
    };

    const toggleStock = (product) => {
        setProducts(products.map(p =>
            p.id === product.id ? { ...p, in_stock: !p.in_stock } : p
        ));
        toast.success(`Stock status updated for ${product.name}`);
    };

    const columns = [
        {
            key: 'image_url',
            label: 'Image',
            sortable: false,
            render: (value, row) => (
                <img
                    src={value || 'https://via.placeholder.com/50'}
                    alt={row.name}
                    className="w-12 h-12 rounded-lg object-cover"
                />
            )
        },
        {
            key: 'name',
            label: 'Product Name',
            render: (value, row) => (
                <div>
                    <p className="font-medium">{value}</p>
                    <p className="text-xs text-muted-foreground">{row.brand}</p>
                </div>
            )
        },
        {
            key: 'category',
            label: 'Category',
            render: (value) => (
                <Badge variant="outline" className="capitalize">
                    {value}
                </Badge>
            )
        },
        {
            key: 'system_size_kw',
            label: 'Size',
            render: (value) => `${value} kW`
        },
        {
            key: 'price',
            label: 'Price',
            render: (value, row) => (
                <div>
                    <p className="font-semibold">${value.toLocaleString()}</p>
                    {row.original_price && (
                        <p className="text-xs text-muted-foreground line-through">${row.original_price.toLocaleString()}</p>
                    )}
                </div>
            )
        },
        {
            key: 'in_stock',
            label: 'Stock',
            render: (value, row) => (
                <Badge
                    className={`cursor-pointer ${value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    onClick={(e) => { e.stopPropagation(); toggleStock(row); }}
                >
                    {value ? 'In Stock' : 'Out of Stock'}
                </Badge>
            )
        }
    ];

    const tableActions = [
        {
            label: 'Edit',
            icon: Edit,
            onClick: (row) => handleOpenModal(row)
        },
        {
            label: 'Delete',
            icon: Trash2,
            variant: 'destructive',
            onClick: handleDelete
        }
    ];

    return (
        <DashboardLayout userRole="vendor">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Products</h1>
                        <p className="text-muted-foreground mt-1">Manage your solar products inventory</p>
                    </div>
                    <Button className="btn-primary" onClick={() => handleOpenModal()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                    </Button>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-card rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">Total Products</p>
                        <p className="text-2xl font-bold">{products.length}</p>
                    </div>
                    <div className="bg-card rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">In Stock</p>
                        <p className="text-2xl font-bold text-green-600">{products.filter(p => p.in_stock).length}</p>
                    </div>
                    <div className="bg-card rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">Out of Stock</p>
                        <p className="text-2xl font-bold text-red-500">{products.filter(p => !p.in_stock).length}</p>
                    </div>
                    <div className="bg-card rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">Total Value</p>
                        <p className="text-2xl font-bold">${products.reduce((sum, p) => sum + p.price, 0).toLocaleString()}</p>
                    </div>
                </div>

                {/* Products Table */}
                <DataTable
                    columns={columns}
                    data={products}
                    actions={tableActions}
                    searchPlaceholder="Search products..."
                />

                {/* Add/Edit Modal */}
                <AnimatePresence>
                    {showModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                            onClick={() => setShowModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-card">
                                    <h2 className="text-xl font-bold">
                                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                                    </h2>
                                    <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Product Name *</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="e.g., Solar Panel 400W"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="brand">Brand *</Label>
                                            <Input
                                                id="brand"
                                                value={formData.brand}
                                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                                placeholder="e.g., SunPower"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Product description..."
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="category">Category *</Label>
                                            <select
                                                id="category"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full h-10 px-3 rounded-md border bg-background"
                                                required
                                            >
                                                <option value="home">Home Solar</option>
                                                <option value="commercial">Commercial Solar</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="system_size_kw">System Size (kW) *</Label>
                                            <Input
                                                id="system_size_kw"
                                                type="number"
                                                step="0.1"
                                                value={formData.system_size_kw}
                                                onChange={(e) => setFormData({ ...formData, system_size_kw: e.target.value })}
                                                placeholder="5.0"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="warranty_years">Warranty (Years) *</Label>
                                            <Input
                                                id="warranty_years"
                                                type="number"
                                                value={formData.warranty_years}
                                                onChange={(e) => setFormData({ ...formData, warranty_years: e.target.value })}
                                                placeholder="25"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="price">Price ($) *</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                placeholder="999"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="original_price">Original Price ($)</Label>
                                            <Input
                                                id="original_price"
                                                type="number"
                                                value={formData.original_price}
                                                onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                                                placeholder="1199"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="efficiency_rating">Efficiency (%) *</Label>
                                            <Input
                                                id="efficiency_rating"
                                                type="number"
                                                step="0.1"
                                                value={formData.efficiency_rating}
                                                onChange={(e) => setFormData({ ...formData, efficiency_rating: e.target.value })}
                                                placeholder="21.5"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="image_url">Image URL</Label>
                                        <Input
                                            id="image_url"
                                            value={formData.image_url}
                                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="features">Features (comma-separated)</Label>
                                        <Input
                                            id="features"
                                            value={formData.features}
                                            onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                                            placeholder="High efficiency, Weather resistant, 25-year warranty"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="in_stock"
                                            checked={formData.in_stock}
                                            onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                                            className="w-4 h-4"
                                        />
                                        <Label htmlFor="in_stock" className="cursor-pointer">In Stock</Label>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t">
                                        <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                                            Cancel
                                        </Button>
                                        <Button type="submit" className="btn-primary flex-1">
                                            <Save className="w-4 h-4 mr-2" />
                                            {editingProduct ? 'Update Product' : 'Create Product'}
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
