import { ArrowRight, Sparkles, ShieldCheck, Zap, BarChart3, Clock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Card from '../components/ui/Card';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-text-primary overflow-x-hidden">
            <Navbar />

            {/* HERO SECTION */}
            <section className="relative min-h-screen flex flex-col items-center justify-center text-center p-6 pt-20">
                {/* Background Ambience */}
                <div className="absolute inset-0 -z-10 bg-background overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full mix-blend-screen animate-pulse-slow" />
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/10 blur-[150px] rounded-full mix-blend-screen" />
                </div>

                <div className="max-w-4xl mx-auto space-y-8 animate-enter relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-white/10 text-xs font-medium text-primary mb-4 backdrop-blur-md">
                        <Sparkles className="w-3 h-3" />
                        <span>AI-Powered Workforce Intelligence</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight text-text-primary">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-text-primary via-text-primary/90 to-text-primary/50">
                            Predict Employee Success
                        </span>
                        <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                            Before Problems Begin.
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
                        OnboardAI uses predictive engines to analyze onboarding velocity, risk factors, and engagement instantly.
                        Stop guessing, start knowing.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Button
                            size="lg"
                            variant="glow"
                            className="group"
                            onClick={() => navigate('/login')}
                        >
                            <Zap className="w-5 h-5 mr-2 fill-current" />
                            Get Started
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>

                        <Button
                            size="lg"
                            variant="secondary"
                            onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                        >
                            Explore Features
                        </Button>
                    </div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section id="features" className="py-24 px-6 bg-surface/30 border-t border-white/5 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Enterprise-Grade Intelligence</h2>
                        <p className="text-text-secondary max-w-2xl mx-auto">Everything you need to manage workforce integration at scale.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="p-8 hover:bg-surface/80">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Predictive Risk</h3>
                            <p className="text-text-secondary leading-relaxed">
                                Identify at-risk employees 3 weeks faster than traditional reviews using
                                engagement pattern analysis.
                            </p>
                        </Card>
                        <Card className="p-8 hover:bg-surface/80">
                            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent mb-6">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Live Analytics</h3>
                            <p className="text-text-secondary leading-relaxed">
                                Real-time dashboards showing onboarding velocity, completion rates,
                                and department bottlenecks.
                            </p>
                        </Card>
                        <Card className="p-8 hover:bg-surface/80">
                            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary mb-6">
                                <Clock className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Smart Correction</h3>
                            <p className="text-text-secondary leading-relaxed">
                                Automated nudges and intervention plans generated by AI to
                                get employees back on track.
                            </p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="how-it-works" className="py-24 px-6 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10" />

                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <h2 className="text-3xl md:text-4xl font-bold">From Hired to Hero in Record Time.</h2>
                            <p className="text-text-secondary text-lg">
                                OnboardAI integrates silently with your existing tools to gather signals and provide insights.
                            </p>

                            <div className="space-y-6">
                                {[
                                    { title: "Connect Data Sources", desc: "One-click integration with Slack, Jira, and GitHub." },
                                    { title: "AI Analyzes Patterns", desc: "Our model detects engagement drops and stalling." },
                                    { title: "Receive Actionable Alerts", desc: "Get notified before an employee churns." }
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-surface border border-white/10 flex items-center justify-center text-primary font-bold shrink-0">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg">{step.title}</h4>
                                            <p className="text-text-secondary">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button variant="secondary" className="mt-4" onClick={() => navigate('/login')}>Get Started Now</Button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-2xl blur-xl" />
                            <Card className="relative bg-surface/90 border-white/10 p-8 space-y-6">
                                <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">System Active</h4>
                                        <p className="text-xs text-text-secondary">Monitoring 854 employees</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-2 bg-surface-light rounded-full w-3/4" />
                                    <div className="h-2 bg-surface-light rounded-full w-1/2" />
                                    <div className="h-2 bg-surface-light rounded-full w-5/6" />
                                </div>
                                <div className="p-4 rounded-lg bg-surface-light/50 border border-white/5">
                                    <p className="text-sm text-text-secondary font-mono">
                                        {">"} Anomaly detected<br />
                                        {">"} Analyzing impact...<br />
                                        {">"} Mitigation suggested.
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;
