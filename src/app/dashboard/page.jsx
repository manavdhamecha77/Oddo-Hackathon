'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, TrendingUp, DollarSign, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user
        const userRes = await fetch("/api/auth/me", { credentials: "include" });
        if (!userRes.ok) {
          window.location.href = "/login";
          return;
        }
        const userData = await userRes.json();
        setUser(userData);

        // Fetch projects
        const projectsRes = await fetch("/api/projects", { credentials: "include" });
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData.slice(0, 4)); // Get only 4 most recent
          
          // Calculate basic stats from projects
          const activeProjects = projectsData.filter(p => p.status === 'in_progress').length;
          setStats({
            activeProjects,
            totalProjects: projectsData.length,
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}! Here&apos;s what&apos;s happening with your projects.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/create">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Active Projects</span>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats?.activeProjects || 0}</div>
          <p className="text-sm text-muted-foreground">In progress</p>
        </div>

        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Total Projects</span>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats?.totalProjects || 0}</div>
          <p className="text-sm text-muted-foreground">All time</p>
        </div>

        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Team Members</span>
            <Clock className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-3xl font-bold mb-1">-</div>
          <p className="text-sm text-muted-foreground">Coming soon</p>
        </div>

        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Pending Tasks</span>
            <AlertCircle className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold mb-1">-</div>
          <p className="text-sm text-muted-foreground">Coming soon</p>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-card border rounded-xl">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/projects">View All</Link>
          </Button>
        </div>
        {projects.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No projects yet</p>
            <Button asChild>
              <Link href="/dashboard/projects/create">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="p-6 hover:bg-muted/50 transition-colors flex items-center justify-between"
              >
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{project.name}</h3>
                  <p className="text-sm text-muted-foreground">{project.description || 'No description'}</p>
                </div>
                <div className="flex items-center gap-8">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <span className="text-sm font-medium capitalize">{project.status?.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Budget</p>
                    <span className="text-sm font-semibold">${project.budget?.toLocaleString() || 0}</span>
                  </div>
                  <div className="w-32">
                    <p className="text-sm text-muted-foreground mb-2">Progress</p>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${project.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
