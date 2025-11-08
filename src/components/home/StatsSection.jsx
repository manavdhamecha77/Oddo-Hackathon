'use client'
import React from 'react'
import { TrendingUp, Users, Clock, DollarSign } from 'lucide-react'

const stats = [
    {
        icon: Users,
        value: "10,000+",
        label: "Active Users",
        color: "text-blue-500"
    },
    {
        icon: TrendingUp,
        value: "95%",
        label: "Customer Satisfaction",
        color: "text-green-500"
    },
    {
        icon: Clock,
        value: "50M+",
        label: "Hours Tracked",
        color: "text-purple-500"
    },
    {
        icon: DollarSign,
        value: "$100M+",
        label: "Revenue Managed",
        color: "text-orange-500"
    }
]

export default function StatsSection() {
    return (
        <section className="py-16 bg-card border-y">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className={`${stat.color} flex justify-center mb-3`}>
                                <stat.icon className="w-8 h-8" />
                            </div>
                            <div className="text-3xl md:text-4xl font-bold mb-1">
                                {stat.value}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
