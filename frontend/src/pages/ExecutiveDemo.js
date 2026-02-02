import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, CheckCircle, ShieldAlert, Zap, TrendingUp, ArrowRight, X } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const DemoStep = ({ icon: Icon, title, desc, isActive, isCompleted }) => (
    <div className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-500 ${isActive ? 'bg-primary/10 border border-primary/20 translate-x-2' : 'opacity-50'}`}>
        <div className={`p-2 rounded-full ${isActive || isCompleted ? 'bg-primary text-background' : 'bg-surface-light text-text-secondary'}`}>
            {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
        </div>
        <div>
            <h3 className={`font-semibold ${isActive ? 'text-primary' : 'text-text-primary'}`}>{title}</h3>
            <p className="text-sm text-text-secondary">{desc}</p>
        </div>
    </div>
);

const ExecutiveDemo = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const previousPath = location.state?.from?.pathname || '/risk';

    const [step, setStep] = useState(0);
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        const steps = [
            () => setStep(1), // Start
            () => setStep(2), // Detecting Risks
            () => setStep(3), // Generating Insights
            () => setShowResult(true), // Finished
        ];

        const timeouts = steps.map((fn, index) => setTimeout(fn, 1500 * (index + 1)));
        return () => timeouts.forEach(clearTimeout);
    }, []);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary animate-pulse" />

            <div className="max-w-2xl w-full space-y-8 relative z-10">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-white/10 text-xs font-mono text-primary mb-4">
                        <span className="animate-pulse">●</span> EXECUTIVE DEMO MODE
                    </div>
                    <h1 className="text-4xl font-bold">AI Onboarding Analysis</h1>
                </div>

                {!showResult ? (
                    <div className="space-y-4">
                        <DemoStep
                            icon={Loader2}
                            title="Scanning Employee Data"
                            desc="Analyzing 856 active employee records..."
                            isActive={step === 0}
                            isCompleted={step > 0}
                        />
                        <DemoStep
                            icon={ShieldAlert}
                            title="Detecting At-Risk Profiles"
                            desc="Identifying engagement drops and missed milestones..."
                            isActive={step === 1}
                            isCompleted={step > 1}
                        />
                        <DemoStep
                            icon={Zap}
                            title="Generating Action Plans"
                            desc="Creating personalized intervention strategies..."
                            isActive={step === 2}
                            isCompleted={step > 2}
                        />
                    </div>
                ) : (
                    <Card className="animate-enter text-center py-12 border-primary/20 bg-gradient-to-b from-surface to-surface/50">
                        <div className="w-20 h-20 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-6 shadow-glow-primary">
                            <TrendingUp className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Analysis Complete</h2>
                        <p className="text-text-secondary mb-8">System successfully optimized workforce integration.</p>

                        <div className="bg-surface-light/50 p-6 rounded-2xl max-w-sm mx-auto border border-white/5 mb-8">
                            <p className="text-lg font-medium text-text-secondary">Impact Projection</p>
                            <p className="text-4xl font-bold text-primary mt-2">63% Reduction</p>
                            <p className="text-sm text-text-secondary mt-1">in onboarding delays</p>
                        </div>

                        <Button size="lg" onClick={() => navigate("/risk")}>
                            Explore Live Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Card>
                )}

                <button
                    onClick={() => navigate(previousPath)}
                    className="absolute top-6 right-6 p-2 rounded-full bg-surface/50 hover:bg-surface border border-white/5 text-text-secondary hover:text-text-primary transition-all"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default ExecutiveDemo;
