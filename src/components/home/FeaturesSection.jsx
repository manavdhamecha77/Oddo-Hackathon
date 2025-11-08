'use client'
import React from 'react'
import { Kanban, DollarSign, TrendingUp, FileText, Clock, Shield } from 'lucide-react'

const features = [
    {
        icon: Kanban,
        title: "Visual Task Management",
        description: "Manage your projects with intuitive Kanban boards. Drag, drop, and track progress in real-time.",
        color: "text-blue-500"
    },
    {
        icon: DollarSign,
        title: "Financial Tracking",
        description: "Link sales orders, invoices, bills, and expenses directly to projects for complete financial visibility.",
        color: "text-green-500"
    },
    {
        icon: TrendingUp,
        title: "Real-Time Profitability",
        description: "See your project's profit (Revenue - Costs) updated live as you log time and expenses.",
        color: "text-purple-500"
    },
    {
        icon: FileText,
        title: "Smart Billing Engine",
        description: "Generate invoices automatically from unbilled timesheets and expenses with one click.",
        color: "text-orange-500"
    },
    {
        icon: Clock,
        title: "Time & Expense Logging",
        description: "Team members can easily log hours and submit expenses directly linked to tasks and projects.",
        color: "text-indigo-500"
    },
    {
        icon: Shield,
        title: "Role-Based Access",
        description: "Secure your data with granular permissions for Team Members, Project Managers, and Admins.",
        color: "text-red-500"
    }
]

export default function FeaturesSection() {
    return (
        <section id="features" className="py-24 bg-linear-to-b from-background to-muted/20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Everything You Need in One Platform
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        OneFlow combines project management and financial tracking to give you complete control over your projects.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div 
                            key={index}
                            className="bg-card border rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className={`${feature.color} mb-4`}>
                                <feature.icon className="w-12 h-12" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
