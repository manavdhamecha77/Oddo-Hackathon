"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function InvitePage({ params }) {
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", password: "", confirmPassword: "" });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const res = await fetch(`/api/invite/${params.token}`);
        const data = await res.json();

        if (res.ok) {
          setInvitation(data.invitation);
        } else {
          setError(data.error || "Invalid invitation");
        }
      } catch (err) {
        setError("Failed to load invitation");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [params.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/invite/${params.token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, password: form.password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Redirect based on role
        setTimeout(() => {
          if (data.user.role === "admin") {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
        }, 1000);
      } else {
        setError(data.error || "Failed to accept invitation");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading invitation...</p>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Invalid Invitation</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push("/login")} variant="outline">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">You're Invited!</h1>
          <p className="text-muted-foreground">
            Complete your registration to join <strong>{invitation.companyName}</strong>
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="text-sm space-y-1">
            <p>
              <span className="text-muted-foreground">Email:</span>{" "}
              <span className="font-medium">{invitation.email}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Role:</span>{" "}
              <span className="font-medium capitalize">{invitation.role.replace(/_/g, " ")}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Company ID:</span>{" "}
              <span className="font-mono text-xs">{invitation.companyId}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Creating Account..." : "Complete Registration"}
          </Button>
        </form>
      </div>
    </div>
  );
}
