export const employees = [
    { id: 1, name: "Alice Chen", role: "Senior Engineer", dept: "Engineering", risk: "Low", progress: 78, avatar: "AC", riskScore: 12 },
    { id: 2, name: "Marcus Johnson", role: "Product Designer", dept: "Design", risk: "High", progress: 45, avatar: "MJ", riskScore: 88, riskReason: "Missed 3 onboarding sessions" },
    { id: 3, name: "Sarah Williams", role: "Marketing Lead", dept: "Marketing", risk: "Medium", progress: 62, avatar: "SW", riskScore: 54, riskReason: "Slow documentation completion" },
    { id: 4, name: "David Kim", role: "Backend Dev", dept: "Engineering", risk: "Low", progress: 92, avatar: "DK", riskScore: 5 },
    { id: 5, name: "Elena Rodriguez", role: "HR Specialist", dept: "People", risk: "High", progress: 30, avatar: "ER", riskScore: 91, riskReason: "No activity for 5 days" },
    { id: 6, name: "Tom Baker", role: "Sales Rep", dept: "Sales", risk: "Medium", progress: 55, avatar: "TB", riskScore: 48, riskReason: "Failed compliance quiz" },
];

export const risks = [
    { id: 1, type: "Retention Risk", employee: "Marcus Johnson", score: 88, trend: "+12%", reason: "Disengagement markers detected in Slack activity." },
    { id: 2, type: "Performance Risk", employee: "Elena Rodriguez", score: 91, trend: "+5%", reason: "Zero login activity in last 5 days." },
    { id: 3, type: "Compliance Risk", employee: "Tom Baker", score: 48, trend: "-2%", reason: "Failed compliance quiz twice." },
];

export const alerts = [
    { id: 1, level: "Critical", title: "Security Protocols Ignored", time: "2m ago", desc: "Multiple login attempts from unauthorized IP for user: Marcus Johnson." },
    { id: 2, level: "Warning", title: "Onboarding Bottleneck", time: "1h ago", desc: "Design department completion rate dropped by 15% this week." },
    { id: 3, level: "Info", title: "New Employee Added", time: "3h ago", desc: "System auto-provisioned 3 accounts for Engineering team." },
];
