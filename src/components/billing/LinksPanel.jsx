'use client'
import React from 'react'
import ProjectLinksPanel from '@/components/project/ProjectLinksPanel'

export default function LinksPanel({ projectId, userRole }) {
  
  return <ProjectLinksPanel projectId={projectId} userRole={userRole} />
}
