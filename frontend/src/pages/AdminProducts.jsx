import React, { useState } from 'react';
import { Package, Star, Eye, Trash2, CheckCircle } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DataTable from '../components/dashboard/DataTable';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

const AdminProducts = () => {
    const [products, setProducts] = useState([
        { id: 1, name: 'Solar Panel 400W Monocrystalline', vendor: 'SunPower Solar', category: 'home', price: 299, stock: true, featured: true, rating: 4.8 },
        { id: 2, name: '5kW Complete Home Solar System', vendor: 'Tesla Energy', category: 'home', price: 8500, stock: true, featured: true, rating: 4.9 },
        { id: 3, name: '10kW Commercial Solar Array', vendor: 'LG Solar Shop', category: 'commercial', price: 15000, stock: true, featured: false, rating: 4.7 },
        { id: 4, name: 'Lithium Battery Storage 10kWh', vendor: 'Tesla Energy', category: 'home', price: 3200, stock: false, featured: false, rating: 4.6 },
        { id: 5, name: 'Hybrid Inverter 5kW', vendor: 'Canadian Solar', category: 'home', price: 1800, stock: true, featured: false, rating: 4.5 },
        { id: 6, name: 'Solar Panel 550W Bifacial', vendor: 'SunPower Solar', category: 'commercial', price: 450, stock: true, featured: true, rating: 4.9 },
        { id: 7, name: 'EV Charger Solar Powered', vendor: 'Tesla Energy', category: 'home', price: 2200, stock: true, featured: false, rating: 4.4 },
        { id: 8, name: 'Solar Monitoring System', vendor: 'LG Solar Shop', category: 'home', price: 350, stock: true, featured: false, rating: 4.3 },
    ]);
    const [categoryFilter, setCategoryFilter] = useState('all');

    const toggleFeatured = (productId) => {
        setProducts(products.map(p => p.id === productId ? { ...p, featured: !p.featured } : p));
        toast.success('Product featured status updated');
    };

    const deleteProduct = (product) => {
        if (window.confirm(`Delete "${product.name}"?`)) {
            setProducts(products.filter(p => p.id !== product.id));
            toast.success('Product removed');
        }
    };

    const filteredProducts = categoryFilter === 'all' ? products : products.filter(p => p.category === categoryFilter);

    const columns = [
        {
            key: 'name',
            label: 'Product',
            render: (value, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="font-medium">{value}</p>
                        <p className="text-xs text-muted-foreground">{row.vendor}</p>
                    </div>
                </div>
            )
        },
        { key: 'category', label: 'Category', render: (value) => <Badge variant="outline" className="capitalize">{value}</Badge> },
        { key: 'price', label: 'Price', render: (value) => `$${value.toLocaleString()}` },
        { key: 'stock', label: 'Stock', render: (value) => <Badge className={value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{value ? 'In Stock' : 'Out'}</Badge> },
        {
            key: 'featured',
            label: 'Featured',
            render: (value, row) => (
                <button onClick={(e) => { e.stopPropagation(); toggleFeatured(row.id); }} className={`flex items-center gap-1 ${value ? 'text-yellow-500' : 'text-gray-300'}`}>
                    <Star className={`w-5 h-5 ${value ? 'fill-current' : ''}`} />
                </button>
            )
        },
        { key: 'rating', label: 'Rating', render: (value) => <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-current" /> {value}</span> }
    ];

    const tableActions = [
        { label: 'Toggle Featured', icon: Star, onClick: (row) => toggleFeatured(row.id) },
        { label: 'Delete', icon: Trash2, variant: 'destructive', onClick: deleteProduct }
    ];

    return (
        <DashboardLayout userRole="admin">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Products Oversight</h1>
                    <p className="text-muted-foreground mt-1">Manage all platform products</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-card rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">Total Products</p>
                        <p className="text-2xl font-bold">{products.length}</p>
                    </div>
                    <div className="bg-card rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">Featured</p>
                        <p className="text-2xl font-bold text-yellow-500">{products.filter(p => p.featured).length}</p>
                    </div>
                    <div className="bg-card rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">In Stock</p>
                        <p className="text-2xl font-bold text-green-600">{products.filter(p => p.stock).length}</p>
                    </div>
                    <div className="bg-card rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">Out of Stock</p>
                        <p className="text-2xl font-bold text-red-500">{products.filter(p => !p.stock).length}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {['all', 'home', 'commercial'].map((cat) => (
                        <Button key={cat} variant={categoryFilter === cat ? 'default' : 'outline'} size="sm" onClick={() => setCategoryFilter(cat)} className="capitalize">
                            {cat === 'all' ? 'All' : cat}
                        </Button>
                    ))}
                </div>

                <DataTable columns={columns} data={filteredProducts} actions={tableActions} searchPlaceholder="Search products..." />
            </div>
        </DashboardLayout>
    );
};

export default AdminProducts;
