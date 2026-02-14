import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Eye, EyeOff, User, Briefcase } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState('employee'); // 'employee' or 'admin'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const user = await login(email, password);

            // Redirect based on role (case-insensitive)
            const userRole = user.role?.toLowerCase();

            // Basic role mismatch check (optional, but good for UX)
            if (role === 'admin' && !['admin', 'hr', 'hr_admin'].includes(userRole)) {
                setError("Access denied. You do not have Admin privileges.");
                setLoading(false);
                return;
            }

            if (userRole === 'hr' || userRole === 'admin' || userRole === 'hr_admin') {
                navigate('/dashboard');
            } else {
                navigate('/my-dashboard');
            }
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full mix-blend-screen" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-secondary/10 blur-[150px] rounded-full mix-blend-screen" />

            <Card className="w-full max-w-md p-0 bg-surface/80 border-white/10 backdrop-blur-xl animate-enter overflow-hidden">
                {/* Header Section */}
                <div className="p-8 text-center border-b border-white/5 bg-white/5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                        <User className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Welcome Back</h2>
                    <p className="text-text-secondary text-sm mt-2">Sign in to your enterprise account</p>
                </div>

                <div className="p-8 pt-6">
                    {/* Role Toggle */}
                    <div className="flex bg-surface-light p-1 rounded-lg mb-6 border border-white/5">
                        <button
                            type="button"
                            onClick={() => setRole('employee')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${role === 'employee'
                                ? 'bg-primary/20 text-primary shadow-sm'
                                : 'text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            <User className="w-4 h-4" />
                            Employee
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('admin')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${role === 'admin'
                                ? 'bg-secondary/20 text-secondary shadow-sm'
                                : 'text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            <Briefcase className="w-4 h-4" />
                            HR / Admin
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm flex items-center gap-2">
                            <span className="shrink-0">⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1.5 ml-1">Work Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-text-secondary/30"
                                placeholder="you@company.com"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1.5 ml-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-text-secondary/30 pr-10"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full mt-4"
                            size="lg"
                            variant="glow"
                            isLoading={loading}
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                            {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                        </Button>
                    </form>

                    <p className="text-center text-xs text-text-secondary mt-6">
                        {role === 'employee' ? (
                            "Forgot your password? Please contact HR."
                        ) : (
                            "Don't have an account? Contact Admin."
                        )}
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default Login;
