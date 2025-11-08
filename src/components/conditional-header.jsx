'use client'

import { usePathname } from 'next/navigation'
import { HeroHeader } from './header'

export function ConditionalHeader() {
  const pathname = usePathname()
  
  // Don't show header on dashboard and admin routes
  if (pathname?.includes('/dashboard') || pathname?.includes('/admin')) {
    return null
  }
  
  return <HeroHeader />
}
