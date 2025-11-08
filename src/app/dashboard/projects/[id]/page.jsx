'use client';
import { use } from 'react';
import { ProjectKanbanPage } from '@/components/project-kanban-page';

export default function ProjectDetailPage({ params }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  return <ProjectKanbanPage projectId={id} backLink="/dashboard/projects" />;
}
