"use client";
import { useEffect, useState } from "react";
import { Users, Mail, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [roles, setRoles] = useState([]);
  const [inviteForm, setInviteForm] = useState({ email: "", roleId: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showInviteLink, setShowInviteLink] = useState(null);

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
      fetchInvitations();
      fetchRoles();
    }
  }, [user]);

  const fetchInvitations = async () => {
    const res = await fetch("/api/admin/invite");
    if (res.ok) {
      const data = await res.json();
      setInvitations(data.invitations);
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
    setShowInviteLink(null);

    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteForm),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Invitation sent successfully!");
        setShowInviteLink(data.invitation.inviteLink);
        setInviteForm({ email: "", roleId: "" });
        fetchInvitations();
      } else {
        setMessage(data.error || "Failed to send invitation");
      }
    } catch (error) {
      setMessage("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Invite link copied to clipboard!");
  };

  const stats = [
    { 
      label: "Total Invitations", 
      value: invitations.length.toString(), 
      change: "All time", 
      icon: Mail, 
      color: "text-blue-500" 
    },
    { 
      label: "Pending", 
      value: invitations.filter(inv => inv.status === "pending").length.toString(), 
      change: "Awaiting acceptance", 
      icon: Clock, 
      color: "text-orange-500" 
    },
    { 
      label: "Accepted", 
      value: invitations.filter(inv => inv.status === "accepted").length.toString(), 
      change: "Active users", 
      icon: CheckCircle, 
      color: "text-green-500" 
    },
    { 
      label: "Team Members", 
      value: invitations.filter(inv => inv.status === "accepted").length.toString(), 
      change: "In your company", 
      icon: Users, 
      color: "text-purple-500" 
    },
  ];

  if (!user) return <div className="p-8"><p>Loading...</p></div>;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name || user.email}! Manage your team and invitations.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-card border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <p className="text-sm text-muted-foreground">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Invite User Section */}
      <div className="bg-card border rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Invite New User</h2>
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="user@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <select
                value={inviteForm.roleId}
                onChange={(e) => setInviteForm({ ...inviteForm, roleId: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
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
          <Button type="submit" disabled={loading}>
            <Mail className="w-4 h-4 mr-2" />
            {loading ? "Sending..." : "Send Invitation"}
          </Button>
        </form>

        {message && (
          <div className={`mt-4 p-4 rounded-lg ${message.includes("success") ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
            {message}
          </div>
        )}

        {showInviteLink && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium mb-2 text-blue-900">Invitation Link:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={showInviteLink}
                readOnly
                className="flex-1 px-3 py-2 border rounded-lg bg-white text-sm"
              />
              <Button onClick={() => copyToClipboard(showInviteLink)} variant="outline">
                Copy Link
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Invitations List */}
      <div className="bg-card border rounded-xl">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Invitations History</h2>
        </div>
        {invitations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No invitations sent yet.</p>
            <p className="text-sm">Send your first invitation above to get started.</p>
          </div>
        ) : (
          <div className="divide-y">
            {invitations.map((inv) => (
              <div key={inv.id} className="p-6 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{inv.email}</h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {inv.role.name.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-8">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          inv.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : inv.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Expires</p>
                      <span className="text-sm">{new Date(inv.expiresAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Created</p>
                      <span className="text-sm">{new Date(inv.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
