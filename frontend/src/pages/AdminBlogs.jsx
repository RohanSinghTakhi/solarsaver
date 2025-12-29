import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Plus, Edit, Trash2, Eye, X, Save, Image,
    Calendar, User, Tag, Check, XCircle
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { useAuth, API } from '../App';
import axios from 'axios';
import { toast } from 'sonner';

const AdminBlogs = () => {
    const { token } = useAuth();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEditor, setShowEditor] = useState(false);
    const [editingBlog, setEditingBlog] = useState(null);
    const [form, setForm] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: 'news',
        image_url: '',
        tags: '',
        is_published: true
    });

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/api/admin/blogs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBlogs(res.data);
        } catch (error) {
            console.log('Using demo data');
            setBlogs([
                {
                    id: 'blog-1',
                    title: '5 Reasons to Go Solar in 2025',
                    excerpt: 'Discover why 2025 is the perfect year to switch to solar energy for your home or business.',
                    content: 'Solar energy has never been more accessible...',
                    category: 'guides',
                    image_url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600',
                    tags: ['solar', 'energy', 'savings'],
                    author_id: 'admin',
                    author_name: 'Solar Admin',
                    is_published: true,
                    views: 1250,
                    created_at: '2024-12-20T10:00:00Z',
                    updated_at: '2024-12-20T10:00:00Z'
                },
                {
                    id: 'blog-2',
                    title: 'Understanding Solar Panel Efficiency',
                    excerpt: 'Learn what solar panel efficiency means and how it affects your energy production.',
                    content: 'Solar panel efficiency is a crucial factor...',
                    category: 'technology',
                    image_url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600',
                    tags: ['technology', 'efficiency', 'panels'],
                    author_id: 'admin',
                    author_name: 'Solar Admin',
                    is_published: true,
                    views: 890,
                    created_at: '2024-12-18T14:00:00Z',
                    updated_at: '2024-12-18T14:00:00Z'
                },
                {
                    id: 'blog-3',
                    title: 'Government Solar Subsidies Guide',
                    excerpt: 'Complete guide to solar subsidies and incentives available in India.',
                    content: 'The Indian government offers various subsidies...',
                    category: 'news',
                    image_url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600',
                    tags: ['subsidy', 'government', 'incentives'],
                    author_id: 'admin',
                    author_name: 'Solar Admin',
                    is_published: true,
                    views: 2100,
                    created_at: '2024-12-15T09:00:00Z',
                    updated_at: '2024-12-15T09:00:00Z'
                },
                {
                    id: 'blog-4',
                    title: 'Solar Maintenance Tips',
                    excerpt: 'Essential tips to keep your solar system running at peak performance.',
                    content: 'Regular maintenance is key to solar efficiency...',
                    category: 'tips',
                    image_url: 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=600',
                    tags: ['maintenance', 'tips', 'performance'],
                    author_id: 'admin',
                    author_name: 'Solar Admin',
                    is_published: false,
                    views: 0,
                    created_at: '2024-12-28T16:00:00Z',
                    updated_at: '2024-12-28T16:00:00Z'
                }
            ]);
        }
        setLoading(false);
    };

    const handleSubmit = async () => {
        if (!form.title || !form.content || !form.excerpt) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            const payload = {
                ...form,
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
            };

            if (editingBlog) {
                await axios.put(`${API}/api/admin/blogs/${editingBlog.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Blog updated successfully!');
            } else {
                await axios.post(`${API}/api/admin/blogs`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Blog created successfully!');
            }
            fetchBlogs();
            resetForm();
        } catch (error) {
            // Demo mode - update locally
            if (editingBlog) {
                setBlogs(blogs.map(b => b.id === editingBlog.id ? { ...b, ...form, tags: form.tags.split(','), updated_at: new Date().toISOString() } : b));
                toast.success('Blog updated (demo)!');
            } else {
                const newBlog = {
                    id: `blog-${Date.now()}`,
                    ...form,
                    tags: form.tags.split(',').map(t => t.trim()),
                    author_id: 'admin',
                    author_name: 'Admin',
                    views: 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                setBlogs([newBlog, ...blogs]);
                toast.success('Blog created (demo)!');
            }
            resetForm();
        }
    };

    const handleDelete = async (blogId) => {
        if (!window.confirm('Are you sure you want to delete this blog?')) return;
        try {
            await axios.delete(`${API}/api/admin/blogs/${blogId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Blog deleted!');
            fetchBlogs();
        } catch (error) {
            setBlogs(blogs.filter(b => b.id !== blogId));
            toast.success('Blog deleted (demo)!');
        }
    };

    const handleEdit = (blog) => {
        setEditingBlog(blog);
        setForm({
            title: blog.title,
            excerpt: blog.excerpt,
            content: blog.content,
            category: blog.category,
            image_url: blog.image_url,
            tags: blog.tags.join(', '),
            is_published: blog.is_published
        });
        setShowEditor(true);
    };

    const resetForm = () => {
        setForm({ title: '', excerpt: '', content: '', category: 'news', image_url: '', tags: '', is_published: true });
        setEditingBlog(null);
        setShowEditor(false);
    };

    const categories = ['news', 'tips', 'guides', 'technology'];

    return (
        <DashboardLayout userRole="admin">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Blog Management</h1>
                        <p className="text-muted-foreground mt-1">Create and manage blog posts</p>
                    </div>
                    <Button onClick={() => setShowEditor(true)}>
                        <Plus className="w-4 h-4 mr-2" /> New Blog Post
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-card rounded-xl border p-4">
                        <p className="text-sm text-muted-foreground">Total Posts</p>
                        <p className="text-2xl font-bold">{blogs.length}</p>
                    </div>
                    <div className="bg-card rounded-xl border p-4">
                        <p className="text-sm text-muted-foreground">Published</p>
                        <p className="text-2xl font-bold text-green-600">{blogs.filter(b => b.is_published).length}</p>
                    </div>
                    <div className="bg-card rounded-xl border p-4">
                        <p className="text-sm text-muted-foreground">Drafts</p>
                        <p className="text-2xl font-bold text-yellow-600">{blogs.filter(b => !b.is_published).length}</p>
                    </div>
                    <div className="bg-card rounded-xl border p-4">
                        <p className="text-sm text-muted-foreground">Total Views</p>
                        <p className="text-2xl font-bold text-primary">{blogs.reduce((sum, b) => sum + (b.views || 0), 0).toLocaleString()}</p>
                    </div>
                </div>

                {/* Blog List */}
                <div className="bg-card rounded-xl border">
                    <div className="p-4 border-b">
                        <h2 className="font-semibold">All Blog Posts</h2>
                    </div>
                    {loading ? (
                        <div className="p-8 text-center text-muted-foreground">Loading...</div>
                    ) : blogs.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No blog posts yet. Create your first one!</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {blogs.map((blog) => (
                                <div key={blog.id} className="p-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-muted/30 transition-colors">
                                    <img src={blog.image_url} alt={blog.title} className="w-full md:w-24 h-32 md:h-16 object-cover rounded-lg" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold line-clamp-1">{blog.title}</h3>
                                            <Badge variant={blog.is_published ? 'default' : 'outline'} className={blog.is_published ? 'bg-green-100 text-green-700' : ''}>
                                                {blog.is_published ? 'Published' : 'Draft'}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-1">{blog.excerpt}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{blog.category}</span>
                                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{blog.views} views</span>
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(blog.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(blog)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDelete(blog.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Editor Modal */}
                <AnimatePresence>
                    {showEditor && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                            onClick={() => resetForm()}
                        >
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9 }}
                                className="bg-card rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-6 border-b sticky top-0 bg-card flex items-center justify-between">
                                    <h2 className="text-xl font-bold">{editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}</h2>
                                    <Button variant="ghost" size="icon" onClick={resetForm}><X className="w-5 h-5" /></Button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="space-y-2">
                                        <Label>Title *</Label>
                                        <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Enter blog title" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Excerpt *</Label>
                                        <Input value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} placeholder="Short description for previews" />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Category</Label>
                                            <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {categories.map(cat => (
                                                        <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Image URL</Label>
                                            <Input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tags (comma separated)</Label>
                                        <Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="solar, energy, tips" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Content *</Label>
                                        <Textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Write your blog content here..." rows={10} />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                        <div>
                                            <Label>Publish immediately</Label>
                                            <p className="text-sm text-muted-foreground">Make this post visible to everyone</p>
                                        </div>
                                        <Switch checked={form.is_published} onCheckedChange={c => setForm({ ...form, is_published: c })} />
                                    </div>
                                    <div className="flex gap-3">
                                        <Button onClick={handleSubmit} className="flex-1">
                                            <Save className="w-4 h-4 mr-2" /> {editingBlog ? 'Update Post' : 'Create Post'}
                                        </Button>
                                        <Button variant="outline" onClick={resetForm}>Cancel</Button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};

export default AdminBlogs;
