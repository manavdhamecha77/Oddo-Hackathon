'use client'
import { use } from 'react'
import ProjectTaskBoard from '@/components/ProjectTaskBoard'

export default function ProjectDetailPage({ params }) {
  const resolvedParams = use(params)
  const { id } = resolvedParams

  return <ProjectTaskBoard projectId={id} backLink="/admin/dashboard/projects" />
}
