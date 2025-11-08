"use client";
import { useEffect, useState } from "react";
import { Users, Mail, CheckCircle, Clock, Shield, Copy, Send, Loader2, UserPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [inviteForm, setInviteForm] = useState({ email: "", roleId: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);
  const [userStats, setUserStats] = useState({
    totalMembers: 0,
    projectManagers: 0,
    teamMembers: 0,
    salesFinance: 0
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          window.location.href = "/login";
          return;
        }
        const ct = res.headers.get("content-type") || "";
        if (!ct.includes("application/json")) {
          window.location.href = "/login";
          return;
        }
        const data = await res.json();
        if (data.role !== "admin") {
          window.location.href = "/dashboard";
        } else {
          setUser(data);
        }
      } catch (e) {
        window.location.href = "/login";
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchTeamMembers();
      fetchRoles();
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const res = await fetch("/api/admin/users/stats");
      if (res.ok) {
        const data = await res.json();
        setUserStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
    }
  };

  const fetchTeamMembers = async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setTeamMembers(data.users);
    }
  };

  const fetchRoles = async () => {
    setRoles([
      { id: 2, name: "project_manager" },
      { id: 3, name: "team_member" },
      { id: 4, name: "sales_finance" },
    ]);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setCreatedUser(null);

    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteForm),
      });

      const data = await res.json();

      if (res.ok) {
        const msg = data.emailSent 
          ? "User created and credentials sent to their email!" 
          : "User created! (Email failed - please share credentials manually)";
        toast.success(msg);
        setMessage(msg);
        setCreatedUser(data.user);
        setInviteForm({ email: "", roleId: "" });
        fetchTeamMembers();
      } else {
        toast.error(data.error || "Failed to create user");
        setMessage(data.error || "Failed to create user");
      }
    } catch (error) {
      toast.error("An error occurred");
      setMessage("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleRevokeUser = async (userId) => {
    if (!confirm('Are you sure you want to revoke this user? They will be removed from all projects.')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/users/${userId}/revoke`, {
        method: 'POST',
      });
      
      if (res.ok) {
        toast.success('User revoked successfully');
        fetchTeamMembers();
        fetchUserStats();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to revoke user');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const stats = [
    { 
      label: "Total Team Members", 
      value: userStats.totalMembers.toString(), 
      change: "Active users", 
      icon: Users, 
      color: "text-blue-500" 
    },
    { 
      label: "Project Managers", 
      value: userStats.projectManagers.toString(), 
      change: "Managing projects", 
      icon: Shield, 
      color: "text-purple-500" 
    },
    { 
      label: "Team Members", 
      value: userStats.teamMembers.toString(), 
      change: "In projects", 
      icon: Users, 
      color: "text-green-500" 
    },
    { 
      label: "Sales & Finance", 
      value: userStats.salesFinance.toString(), 
      change: "Managing finance", 
      icon: CheckCircle, 
      color: "text-orange-500" 
    },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background to-muted/20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-card border rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate pr-2">{stat.label}</span>
              <div className={`p-1.5 sm:p-2 rounded-lg bg-muted/50 shrink-0`}>
                <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
              </div>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">{stat.value}</div>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 truncate">
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Invite User Section */}
      <div className="bg-card border rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Send className="w-5 h-5 text-primary shrink-0" />
          <h2 className="text-lg sm:text-xl font-semibold">Invite New User</h2>
        </div>
        <form onSubmit={handleInvite} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email Address
              </label>
              <input
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm sm:text-base"
                placeholder="user@example.com"
                required
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                Role
              </label>
              <select
                value={inviteForm.roleId}
                onChange={(e) => setInviteForm({ ...inviteForm, roleId: parseInt(e.target.value) })}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm sm:text-base"
                required
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name.replace(/_/g, " ").toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="gap-2 w-full sm:w-auto" size="lg">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Sending Invitation...</span>
                <span className="sm:hidden">Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Invitation
              </>
            )}
          </Button>
        </form>

        {message && (
          <div className={`mt-4 p-4 rounded-lg ${message.includes("success") ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
            {message}
          </div>
        )}

        {createdUser && (
          <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">User Created Successfully!</p>
            </div>
            <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 mb-4">Share these credentials with the new user:</p>
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-3 sm:p-4 border border-blue-100 dark:border-blue-900">
                <label className="text-xs text-blue-800 dark:text-blue-300 font-medium mb-2 block">Company ID</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={createdUser.companyId}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-xs sm:text-sm font-mono select-all overflow-x-auto"
                  />
                  <Button 
                    onClick={() => copyToClipboard(createdUser.companyId, "Company ID")} 
                    variant="outline" 
                    size="sm"
                    className="gap-2 w-full sm:w-auto shrink-0"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </Button>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg p-3 sm:p-4 border border-blue-100 dark:border-blue-900">
                <label className="text-xs text-blue-800 dark:text-blue-300 font-medium mb-2 block">Email</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={createdUser.email}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-xs sm:text-sm select-all overflow-x-auto break-all"
                  />
                  <Button 
                    onClick={() => copyToClipboard(createdUser.email, "Email")} 
                    variant="outline" 
                    size="sm"
                    className="gap-2 w-full sm:w-auto shrink-0"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </Button>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg p-3 sm:p-4 border border-blue-100 dark:border-blue-900">
                <label className="text-xs text-blue-800 dark:text-blue-300 font-medium mb-2 block">Password (temporary)</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={createdUser.password}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-xs sm:text-sm font-mono select-all overflow-x-auto break-all"
                  />
                  <Button 
                    onClick={() => copyToClipboard(createdUser.password, "Password")} 
                    variant="outline" 
                    size="sm"
                    className="gap-2 w-full sm:w-auto shrink-0"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </Button>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-xs text-blue-800 dark:text-blue-200">
                <Mail className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  Credentials have been sent to the user&apos;s email. You can also share them manually using the copy buttons above.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Team Members */}
      <div className="bg-card border rounded-xl shadow-sm">
        <div className="p-4 sm:p-6 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary shrink-0" />
            <h2 className="text-lg sm:text-xl font-semibold">Active Team Members</h2>
          </div>
        </div>
        {teamMembers.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-muted-foreground">
            <div className="inline-flex p-3 sm:p-4 bg-muted rounded-full mb-4">
              <Users className="w-8 h-8 sm:w-12 sm:h-12 opacity-50" />
            </div>
            <p className="text-base sm:text-lg font-medium mb-1">No active team members</p>
            <p className="text-sm">Invite your first team member above to get started.</p>
          </div>
        ) : (
          <div className="divide-y">
            {teamMembers.map((member) => (
              <div key={member.id} className="p-4 sm:p-6 hover:bg-muted/30 transition-all duration-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg truncate">{member.email}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground capitalize flex items-center gap-2">
                          <Shield className="w-3 h-3 shrink-0" />
                          <span className="truncate">{member.role.name.replace(/_/g, " ")}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
                    <div className="text-center shrink-0">
                      <p className="text-xs text-muted-foreground mb-2">Created</p>
                      <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{new Date(member.createdAt).toLocaleDateString()}</span>
                    </div>
                    <Button
                      onClick={() => handleRevokeUser(member.id)}
                      variant="destructive"
                      size="sm"
                      className="gap-2 shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span className="hidden sm:inline">Remove</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
