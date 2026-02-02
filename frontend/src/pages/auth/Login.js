import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, ShieldCheck, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [role, setRole] = useState('employee'); // 'employee' | 'hr'
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const user = login(role);
        setLoading(false);

        // Redirect based on role
        if (user.role === 'hr') {
            navigate('/dashboard');
        } else {
            navigate('/my-dashboard'); // We will build this next
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full mix-blend-screen" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-secondary/10 blur-[150px] rounded-full mix-blend-screen" />

            <Card className="w-full max-w-md p-8 bg-surface/80 border-white/10 backdrop-blur-xl animate-enter">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                        <span className="font-bold text-background text-2xl">O</span>
                    </div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Welcome Back</h2>
                    <p className="text-text-secondary text-sm mt-2">Sign in to your enterprise account</p>
                </div>

                {/* Role Toggle */}
                <div className="flex bg-surface-light p-1 rounded-lg mb-8 border border-white/5">
                    <button
                        onClick={() => setRole('employee')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${role === 'employee'
                            ? 'bg-surface shadow-sm text-primary border border-white/5'
                            : 'text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        <User className="w-4 h-4" /> Employee
                    </button>
                    <button
                        onClick={() => setRole('hr')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${role === 'hr'
                            ? 'bg-surface shadow-sm text-accent border border-white/5'
                            : 'text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        <ShieldCheck className="w-4 h-4" /> HR Admin
                    </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1.5 ml-1">Work Email</label>
                        <input
                            type="email"
                            defaultValue={role === 'hr' ? 'alex@company.com' : 'sam@employee.com'}
                            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-text-secondary/30"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1.5 ml-1">
                            <label className="block text-xs font-medium text-text-secondary">Password</label>
                            <a href="#" className="text-xs text-primary hover:text-primary/80 transition-colors">Forgot?</a>
                        </div>
                        <input
                            type="password"
                            defaultValue="password"
                            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-text-secondary/30"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full mt-2"
                        size="lg"
                        variant={role === 'hr' ? 'glow' : 'primary'}
                        isLoading={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                        {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                </form>

                <p className="text-center text-xs text-text-secondary mt-6">
                    Don't have an account?
                    <Link to="/signup" className="text-primary hover:text-primary/80 font-medium ml-1 transition-colors">Contact Admin</Link>
                </p>
            </Card>
        </div>
    );
};

export default Login;
