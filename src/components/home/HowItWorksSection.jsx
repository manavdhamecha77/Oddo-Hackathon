'use client'
import React from 'react'
import { CheckCircle2, ArrowRight } from 'lucide-react'

const steps = [
    {
        number: "01",
        title: "Create Your Project",
        description: "Set up a new project with all relevant details. Invite your team members and define roles.",
        highlights: ["Project hub", "Team assignment", "Role-based access"]
    },
    {
        number: "02",
        title: "Plan & Execute Tasks",
        description: "Break down your project into tasks on a visual Kanban board. Team members log hours and submit expenses.",
        highlights: ["Kanban board", "Time tracking", "Expense logging"]
    },
    {
        number: "03",
        title: "Link Financial Documents",
        description: "Attach sales orders, purchase orders, invoices, and bills to your project through the Links Panel.",
        highlights: ["Sales orders", "Purchase orders", "Invoices & bills"]
    },
    {
        number: "04",
        title: "Generate Smart Invoices",
        description: "Click 'Create Invoice' to automatically pull all unbilled timesheets and expenses. Select items and bill your client.",
        highlights: ["Auto-fetch unbilled items", "One-click billing", "Prevents double-billing"]
    },
    {
        number: "05",
        title: "Monitor Profitability",
        description: "View your real-time project profit dashboard. See exactly how much you're earning on every project.",
        highlights: ["Live profit calculation", "Revenue vs. Costs", "Financial analytics"]
    }
]

export default function HowItWorksSection() {
    return (
        <section id="billing-engine" className="py-24 bg-muted/30">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        How OneFlow Works
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        From project planning to profit tracking, OneFlow streamlines your entire workflow.
                    </p>
                </div>

                <div className="space-y-12">
                    {steps.map((step, index) => (
                        <div 
                            key={index}
                            className="flex flex-col md:flex-row gap-8 items-start"
                        >
                            <div className="shrink-0">
                                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <span className="text-3xl font-bold text-primary">{step.number}</span>
                                </div>
                            </div>
                            
                            <div className="flex-1">
                                <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                                <p className="text-muted-foreground mb-4 text-lg">{step.description}</p>
                                
                                <div className="flex flex-wrap gap-3">
                                    {step.highlights.map((highlight, idx) => (
                                        <div 
                                            key={idx}
                                            className="flex items-center gap-2 bg-card border rounded-full px-4 py-2"
                                        >
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            <span className="text-sm">{highlight}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {index < steps.length - 1 && (
                                <div className="hidden md:block shrink-0 pt-8">
                                    <ArrowRight className="w-6 h-6 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
