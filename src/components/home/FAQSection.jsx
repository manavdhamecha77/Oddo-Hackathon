'use client'
import React from 'react'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const faqs = [
    {
        question: "What makes OneFlow different from other project management tools?",
        answer: "OneFlow uniquely combines project execution (task management) with financial tracking (billing and costs) in a single platform. You can see your project's profitability in real-time, not weeks after the fact. Our smart billing engine automatically links timesheets and expenses to invoices, preventing double-billing and giving you accurate financial data."
    },
    {
        question: "How does the billing engine work?",
        answer: "When you're ready to bill a client, click 'Create Invoice' from the project's Links Panel. OneFlow automatically fetches all unbilled timesheets and expenses for that project and displays them as checkboxes. Select the items you want to bill, and OneFlow creates the invoice while marking those items as billed—all in a single database transaction to prevent errors."
    },
    {
        question: "What are the different user roles?",
        answer: "OneFlow has four roles: TEAM_MEMBER (can log time and expenses), PROJECT_MANAGER (full project and financial access), SALES_FINANCE (manages financial documents), and ADMIN (full system access). Each role has specific permissions to keep your data secure."
    },
    {
        question: "Can I track multiple projects simultaneously?",
        answer: "Yes! OneFlow is designed for managing multiple projects. Each project has its own hub with a Kanban board, financial documents, and real-time profit tracking. You can easily switch between projects and see an overview of all projects on your dashboard."
    },
    {
        question: "How is profitability calculated?",
        answer: "Profitability is calculated as: Revenue (from Customer Invoices) minus Costs (Vendor Bills + Expenses). OneFlow updates this calculation in real-time as you log timesheets, submit expenses, and create invoices. You'll always know exactly how much profit each project is generating."
    },
    {
        question: "Is my data secure?",
        answer: "Absolutely. OneFlow uses industry-standard encryption, secure authentication through NextAuth.js, and role-based access control (RBAC) at both the API and database level. Your financial data is protected with multi-layer security."
    },
    {
        question: "Can I export my financial data?",
        answer: "Yes, OneFlow allows you to export invoices, bills, and financial reports in multiple formats. You can also integrate with accounting software through our API (available in Professional and Enterprise plans)."
    },
    {
        question: "What happens during the free trial?",
        answer: "You get full access to all features for 14 days with no credit card required. You can create projects, invite team members, track time, log expenses, and use the billing engine. If you decide it's not for you, simply let the trial expire—no charges, no hassle."
    }
]

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState(null)

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <section className="py-24 bg-muted/20">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Everything you need to know about OneFlow
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div 
                            key={index}
                            className="bg-card border rounded-xl overflow-hidden"
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                            >
                                <span className="font-semibold pr-8">{faq.question}</span>
                                <ChevronDown 
                                    className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                                        openIndex === index ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                            
                            {openIndex === index && (
                                <div className="px-6 pb-5 text-muted-foreground">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-muted-foreground mb-4">Still have questions?</p>
                    <Button asChild variant="outline">
                        <Link href="mailto:support@oneflow.com">
                            Contact Support
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
