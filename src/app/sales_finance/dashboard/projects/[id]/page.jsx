'use client'
import ProjectTaskBoard from '@/components/ProjectTaskBoard'
import { use } from 'react'

export default function SalesFinanceProjectDetailPage({ params }) {
  const { id } = use(params)
  
  return <ProjectTaskBoard projectId={id} />
}
