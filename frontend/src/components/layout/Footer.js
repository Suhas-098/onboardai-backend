import React from 'react';
import { Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-surface border-t border-white/5 py-12 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
                <div className="col-span-1 md:col-span-2 space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-primary to-secondary" />
                        <span className="text-xl font-bold">OnboardAI</span>
                    </div>
                    <p className="text-text-secondary text-sm max-w-xs leading-relaxed">
                        The enterprise standard for AI-driven workforce integration and risk analytics.
                    </p>
                    <div className="flex items-center gap-4 pt-2">
                        <Github className="w-5 h-5 text-text-secondary hover:text-primary cursor-pointer transition-colors" />
                        <Twitter className="w-5 h-5 text-text-secondary hover:text-primary cursor-pointer transition-colors" />
                        <Linkedin className="w-5 h-5 text-text-secondary hover:text-primary cursor-pointer transition-colors" />
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold mb-4 text-text-primary">Product</h4>
                    <ul className="space-y-2 text-sm text-text-secondary">
                        <li className="hover:text-primary cursor-pointer">Features</li>
                        <li className="hover:text-primary cursor-pointer">Security</li>
                        <li className="hover:text-primary cursor-pointer">Enterprise</li>
                        <li className="hover:text-primary cursor-pointer">Changelog</li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold mb-4 text-text-primary">Company</h4>
                    <ul className="space-y-2 text-sm text-text-secondary">
                        <li className="hover:text-primary cursor-pointer">About</li>
                        <li className="hover:text-primary cursor-pointer">Careers</li>
                        <li className="hover:text-primary cursor-pointer">Blog</li>
                        <li className="hover:text-primary cursor-pointer">Contact</li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-text-secondary">
                <p>© 2026 OnboardAI Inc. All rights reserved.</p>
                <div className="flex gap-6 mt-4 md:mt-0">
                    <span className="hover:text-text-primary cursor-pointer">Privacy Policy</span>
                    <span className="hover:text-text-primary cursor-pointer">Terms of Service</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
