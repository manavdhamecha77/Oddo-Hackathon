'use client'
import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export default function CTASection() {
    return (
        <section className="py-24 bg-linear-to-r from-primary/10 via-purple-500/10 to-primary/10">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    Ready to Know Your Project Profit?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Join thousands of project managers who have gained real-time visibility into their project finances with OneFlow.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button asChild size="lg" className="text-base px-8">
                        <Link href="/register">
                            Get Started Free
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="text-base px-8">
                        <Link href="/login">
                            Sign In
                        </Link>
                    </Button>
                </div>

                <p className="mt-6 text-sm text-muted-foreground">
                    14-day free trial • No credit card required • Cancel anytime
                </p>
            </div>
        </section>
    )
}
