import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, ShoppingCart, User, Menu, X, ChevronDown,
  Home, Building2, Calculator, Phone, LogOut, LayoutDashboard,
  Heart, GitCompare, FileText
} from 'lucide-react';
import { useAuth, useCart, useWishlist, useCompare } from '../App';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { compareCount } = useCompare();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we're on the home page (for transparent header with white text)
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Shop', path: '/shop', icon: ShoppingCart },
    { name: 'Calculator', path: '/calculator', icon: Calculator },
    { name: 'Blog', path: '/blog', icon: FileText },
    { name: 'Contact', path: '/contact', icon: Phone },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Dynamic text color based on scroll and page
  const textColorClass = (!scrolled && isHomePage)
    ? 'text-white hover:text-primary'
    : 'text-foreground hover:text-primary';

  const logoTextClass = (!scrolled && isHomePage)
    ? 'text-white'
    : 'text-foreground';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-background/95 backdrop-blur-md shadow-md'
        : 'bg-transparent'
        }`}
    >
      <div className="container-solar">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              className="relative"
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
            >
              <Sun className="w-8 h-8 md:w-10 md:h-10 text-primary" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg group-hover:blur-xl transition-all" />
            </motion.div>
            <span className="text-xl md:text-2xl font-bold">
              <span className="solar-text-gradient">Solar</span>
              <span className={logoTextClass}>Savers</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${location.pathname === link.path
                  ? 'text-primary bg-primary/10'
                  : textColorClass
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2 md:gap-3">

            {/* Wishlist */}
            <Link to="/wishlist" className={`relative p-2 rounded-lg transition-all duration-200 ${textColorClass}`}>
              <Heart className="w-5 h-5 md:w-6 md:h-6" />
              <AnimatePresence>
                {wishlistCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {wishlistCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Compare */}
            <Link to="/compare" className={`relative p-2 rounded-lg transition-all duration-200 ${textColorClass}`}>
              <GitCompare className="w-5 h-5 md:w-6 md:h-6" />
              <AnimatePresence>
                {compareCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {compareCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Cart */}
            <Link to="/cart" className={`relative p-2 rounded-lg transition-all duration-200 ${textColorClass}`}>
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* User Menu - Desktop */}
            <div className="hidden md:block">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="hidden lg:block">{user.name}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to={user.role === 'vendor' ? '/vendor/dashboard' : '/dashboard'} className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={(!scrolled && isHomePage)
                        ? 'text-white border border-white/50 hover:bg-primary hover:text-white hover:border-primary'
                        : ''}
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button
                      size="sm"
                      className={(!scrolled && isHomePage)
                        ? 'bg-transparent border-2 border-white text-white hover:bg-primary hover:border-primary hover:text-white transition-all'
                        : 'btn-primary text-sm py-2'}
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                      <Sun className="w-8 h-8 text-primary" />
                      <span className="text-xl font-bold">
                        <span className="solar-text-gradient">Solar</span>Savers
                      </span>
                    </Link>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex-1 p-4 space-y-2">
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname === link.path
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-secondary'
                            }`}
                        >
                          <Icon className="w-5 h-5" />
                          {link.name}
                        </Link>
                      );
                    })}
                  </nav>

                  {/* Mobile User Section */}
                  <div className="p-4 border-t space-y-2">
                    {user ? (
                      <>
                        <div className="flex items-center gap-3 px-4 py-3 bg-secondary/50 rounded-xl">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <Link
                          to={user.role === 'vendor' ? '/vendor/dashboard' : '/dashboard'}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary transition-colors"
                        >
                          <LayoutDashboard className="w-5 h-5" />
                          Dashboard
                        </Link>
                        <button
                          onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <LogOut className="w-5 h-5" />
                          Logout
                        </button>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full">Login</Button>
                        </Link>
                        <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                          <Button className="w-full btn-primary">Sign Up</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
