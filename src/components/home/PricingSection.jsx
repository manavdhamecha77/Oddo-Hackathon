'use client'
import React from 'react'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const plans = [
    {
        name: "Starter",
        price: "29",
        period: "/month",
        description: "Perfect for small teams getting started",
        features: [
            "Up to 5 projects",
            "10 team members",
            "Basic Kanban boards",
            "Time & expense tracking",
            "Email support",
            "5GB storage"
        ],
        cta: "Start Free Trial",
        popular: false
    },
    {
        name: "Professional",
        price: "79",
        period: "/month",
        description: "For growing teams that need more power",
        features: [
            "Unlimited projects",
            "50 team members",
            "Advanced Kanban boards",
            "Full financial tracking",
            "Smart billing engine",
            "Priority support",
            "50GB storage",
            "Custom reports"
        ],
        cta: "Start Free Trial",
        popular: true
    },
    {
        name: "Enterprise",
        price: "Custom",
        period: "",
        description: "For large organizations with custom needs",
        features: [
            "Everything in Professional",
            "Unlimited team members",
            "Advanced analytics",
            "API access",
            "SSO & SAML",
            "Dedicated support",
            "Unlimited storage",
            "Custom integrations"
        ],
        cta: "Contact Sales",
        popular: false
    }
]

export default function PricingSection() {
    return (
        <section id="pricing" className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Choose the plan that fits your team. All plans include a 14-day free trial.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, index) => (
                        <div 
                            key={index}
                            className={`relative bg-card border rounded-2xl p-8 ${
                                plan.popular ? 'ring-2 ring-primary shadow-xl scale-105' : ''
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                                    Most Popular
                                </div>
                            )}
                            
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <p className="text-muted-foreground text-sm">{plan.description}</p>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline">
                                    <span className="text-5xl font-bold">${plan.price}</span>
                                    <span className="text-muted-foreground ml-2">{plan.period}</span>
                                </div>
                            </div>

                            <Button 
                                asChild 
                                className="w-full mb-6"
                                variant={plan.popular ? "default" : "outline"}
                                size="lg"
                            >
                                <Link href="/register">
                                    {plan.cta}
                                </Link>
                            </Button>

                            <div className="space-y-3">
                                {plan.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                        <span className="text-sm">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-muted-foreground">
                        All plans include 14-day free trial. No credit card required. Cancel anytime.
                    </p>
                </div>
            </div>
        </section>
    )
}
