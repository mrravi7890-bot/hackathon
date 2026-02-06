import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { MapPin, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await authAPI.login(email, password);
            login(response.data.user, response.data.token);
            toast.success('Welcome back!');
            navigate('/admin/dashboard');
        } catch (error) {
            console.error('Login failed:', error);
            toast.error(error.response?.data?.detail || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4" data-testid="admin-login-page">
            <div className="w-full max-w-md space-y-8">
                {/* Logo */}
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center gap-2 group">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center neon-glow transition-all group-hover:neon-glow-strong">
                            <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-slate-100">
                            Visit<span className="text-cyan-400">Map</span>
                        </span>
                    </Link>
                    <h2 className="mt-6 text-2xl font-bold text-slate-100">
                        Admin Portal
                    </h2>
                    <p className="mt-2 text-slate-400">
                        Sign in to access the dashboard
                    </p>
                </div>

                {/* Login Form */}
                <div className="glass-card rounded-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@tourism.com"
                                    required
                                    className="pl-10 bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500 h-12"
                                    data-testid="login-email-input"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="pl-10 bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500 h-12"
                                    data-testid="login-password-input"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold"
                            data-testid="login-submit-btn"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <p className="text-xs text-slate-400 text-center mb-2">Demo Credentials</p>
                        <div className="text-sm text-slate-300 text-center font-mono">
                            <div>admin@tourism.com</div>
                            <div>admin123</div>
                        </div>
                    </div>
                </div>

                {/* Back Link */}
                <div className="text-center">
                    <Link 
                        to="/" 
                        className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
