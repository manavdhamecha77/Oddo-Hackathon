'use client'

import { usePathname } from 'next/navigation'
import { HeroHeader } from './header'

export function ConditionalHeader() {
  const pathname = usePathname()
  
  // Don't show header on dashboard routes
  if (pathname?.includes('/dashboard')) {
    return null
  }

  return <HeroHeader />
}