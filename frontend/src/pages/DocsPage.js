import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Card from "../components/ui/Card";

const DocsPage = () => {
    return (
        <div className="min-h-screen bg-background text-text-primary">
            <Navbar />

            {/* HERO */}
            <section className="pt-28 pb-20 px-6 text-center relative">
                <div className="absolute inset-0 -z-10 bg-background">
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 blur-[140px] rounded-full" />
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    OnboardAI Documentation
                </h1>
                <p className="text-text-secondary max-w-2xl mx-auto text-lg">
                    Product overview, system design, AI logic, and platform architecture.
                </p>
            </section>

            {/* CONTENT */}
            <section className="pb-24 px-6">
                <div className="max-w-5xl mx-auto space-y-12">

                    {/* OVERVIEW */}
                    <Card className="p-8 space-y-4">
                        <h2 className="text-2xl font-bold">1. Overview</h2>
                        <p className="text-text-secondary leading-relaxed">
                            OnboardAI is an AI-powered workforce intelligence platform designed
                            to predict employee onboarding success before issues become visible.
                            It analyzes engagement signals, onboarding velocity, and behavioral
                            patterns to enable early intervention.
                        </p>
                    </Card>

                    {/* PROBLEM */}
                    <Card className="p-8 space-y-4">
                        <h2 className="text-2xl font-bold">2. Problem Statement</h2>
                        <p className="text-text-secondary leading-relaxed">
                            Traditional onboarding relies on delayed reviews and subjective
                            feedback. By the time disengagement is noticed, attrition risk is
                            already high.
                        </p>
                        <p className="text-text-secondary leading-relaxed">
                            OnboardAI replaces reactive processes with continuous, data-driven
                            onboarding intelligence.
                        </p>
                    </Card>

                    {/* ARCHITECTURE */}
                    <Card className="p-8 space-y-4">
                        <h2 className="text-2xl font-bold">3. System Architecture</h2>
                        <pre className="bg-surface-light/50 p-4 rounded-lg text-sm text-text-secondary overflow-x-auto">
                            Frontend (React)
                            ↓
                            Backend API
                            ↓
                            AI / Analytics Engine
                            ↓
                            Database + Background Workers
                        </pre>
                        <p className="text-text-secondary leading-relaxed">
                            The system follows a modular architecture allowing independent
                            scaling of the frontend, backend services, and analytics engine.
                        </p>
                    </Card>

                    {/* DATA SIGNALS */}
                    <Card className="p-8 space-y-4">
                        <h2 className="text-2xl font-bold">4. Data Signals</h2>
                        <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                            <li>Task completion velocity</li>
                            <li>Inactivity windows</li>
                            <li>Onboarding module progress</li>
                            <li>Engagement consistency</li>
                            <li>Missed deadlines</li>
                        </ul>
                        <p className="text-text-secondary leading-relaxed">
                            Only behavioral metadata is analyzed. No private message content
                            is stored or processed.
                        </p>
                    </Card>

                    {/* AI MODEL */}
                    <Card className="p-8 space-y-4">
                        <h2 className="text-2xl font-bold">5. AI Risk Scoring</h2>
                        <p className="text-text-secondary leading-relaxed">
                            Each employee is assigned a normalized onboarding risk score
                            between 0 and 1 based on weighted behavioral signals.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                            <li>0.00 – 0.40 → Healthy</li>
                            <li>0.41 – 0.70 → Monitor</li>
                            <li>0.71 – 1.00 → Intervention required</li>
                        </ul>
                    </Card>

                    {/* ALERTS */}
                    <Card className="p-8 space-y-4">
                        <h2 className="text-2xl font-bold">6. Alerts & Interventions</h2>
                        <p className="text-text-secondary leading-relaxed">
                            When risk thresholds are crossed, alerts are generated along with
                            AI-suggested corrective actions.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                            <li>Schedule 1-on-1 meetings</li>
                            <li>Reduce onboarding workload</li>
                            <li>Assign mentors</li>
                        </ul>
                    </Card>

                    {/* SECURITY */}
                    <Card className="p-8 space-y-4">
                        <h2 className="text-2xl font-bold">7. Security & Privacy</h2>
                        <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                            <li>Role-based access control</li>
                            <li>Secure authentication (JWT / OAuth planned)</li>
                            <li>Data minimization principles</li>
                            <li>Audit-ready system design</li>
                        </ul>
                    </Card>

                    {/* SCALABILITY */}
                    <Card className="p-8 space-y-4">
                        <h2 className="text-2xl font-bold">8. Scalability</h2>
                        <p className="text-text-secondary leading-relaxed">
                            Stateless APIs, background job queues, and caching strategies
                            ensure performance even at large organizational scale.
                        </p>
                    </Card>

                    {/* ROADMAP */}
                    <Card className="p-8 space-y-4">
                        <h2 className="text-2xl font-bold">9. Future Roadmap</h2>
                        <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                            <li>Churn prediction models</li>
                            <li>Organization-wide analytics</li>
                            <li>Slack, Jira, GitHub integrations</li>
                            <li>Executive dashboards</li>
                        </ul>
                    </Card>

                    {/* FOOT NOTE */}
                    <div className="text-center text-sm text-text-secondary pt-6">
                        Built with scalability, privacy, and people-first intelligence in mind.
                    </div>

                </div>
            </section>

            <Footer />
        </div>
    );
};

export default DocsPage;
