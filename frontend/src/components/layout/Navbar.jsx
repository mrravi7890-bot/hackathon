import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { 
    Menu, 
    X, 
    MapPin, 
    LayoutDashboard, 
    LogOut, 
    User,
    Map,
    MessageSquare
} from 'lucide-react';

export const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, logout, isAuthenticated } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const publicLinks = [
        { path: '/', label: 'Home', icon: MapPin },
        { path: '/places', label: 'Places', icon: Map },
        { path: '/heatmap', label: 'Live Heatmap', icon: Map },
    ];

    const adminLinks = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/locations', label: 'Locations', icon: MapPin },
        { path: '/admin/feedbacks', label: 'Feedbacks', icon: MessageSquare },
    ];

    return (
        <nav className="glass sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center neon-glow transition-all group-hover:neon-glow-strong">
                            <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold text-lg hidden sm:block text-slate-100">
                            Visit<span className="text-cyan-400">Map</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {publicLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`nav-link px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    isActive(link.path)
                                        ? 'text-cyan-400 bg-cyan-500/10'
                                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                                }`}
                                data-testid={`nav-${link.label.toLowerCase().replace(' ', '-')}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        
                        {isAuthenticated() && (
                            <>
                                <div className="w-px h-6 bg-slate-700 mx-2" />
                                {adminLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`nav-link px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            isActive(link.path)
                                                ? 'text-cyan-400 bg-cyan-500/10'
                                                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                                        }`}
                                        data-testid={`nav-admin-${link.label.toLowerCase()}`}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </>
                        )}
                    </div>

                    {/* Auth Section */}
                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated() ? (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700">
                                    <User className="w-4 h-4 text-cyan-400" />
                                    <span className="text-sm text-slate-300">{user?.name}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={logout}
                                    className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                                    data-testid="logout-btn"
                                >
                                    <LogOut className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <Link to="/admin/login">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                                    data-testid="admin-login-btn"
                                >
                                    Admin Login
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        data-testid="mobile-menu-btn"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6 text-slate-300" />
                        ) : (
                            <Menu className="w-6 h-6 text-slate-300" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden mobile-menu pb-4 border-t border-slate-800">
                        <div className="pt-4 space-y-1">
                            {publicLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                        isActive(link.path)
                                            ? 'text-cyan-400 bg-cyan-500/10'
                                            : 'text-slate-300 hover:bg-slate-800/50'
                                    }`}
                                >
                                    <link.icon className="w-5 h-5" />
                                    {link.label}
                                </Link>
                            ))}
                            
                            {isAuthenticated() && (
                                <>
                                    <div className="h-px bg-slate-800 my-2" />
                                    {adminLinks.map((link) => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                                isActive(link.path)
                                                    ? 'text-cyan-400 bg-cyan-500/10'
                                                    : 'text-slate-300 hover:bg-slate-800/50'
                                            }`}
                                        >
                                            <link.icon className="w-5 h-5" />
                                            {link.label}
                                        </Link>
                                    ))}
                                    <div className="h-px bg-slate-800 my-2" />
                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Logout
                                    </button>
                                </>
                            )}
                            
                            {!isAuthenticated() && (
                                <Link
                                    to="/admin/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                                >
                                    <User className="w-5 h-5" />
                                    Admin Login
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};
