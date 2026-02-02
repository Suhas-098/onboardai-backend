import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const Signup = () => {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-8 text-center bg-surface/50 border-white/10 backdrop-blur-md">
                <div className="w-16 h-16 rounded-full bg-surface-light flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">🔒</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">Private Access Only</h2>
                <p className="text-text-secondary mb-8 leading-relaxed">
                    OnboardAI is an enterprise platform. Account creation is restricted to organization administrators.
                </p>
                <div className="bg-surface-light/50 p-4 rounded-xl border border-white/5 text-sm mb-8 text-left">
                    <p className="font-semibold mb-2">To request access:</p>
                    <ul className="list-disc list-inside text-text-secondary space-y-1">
                        <li>Contact your IT department</li>
                        <li>Email support@onboardai.com</li>
                        <li>Use your SSO provider</li>
                    </ul>
                </div>
                <Link to="/login">
                    <Button variant="secondary" className="w-full">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                    </Button>
                </Link>
            </Card>
        </div>
    );
};

export default Signup;
