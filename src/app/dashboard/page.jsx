"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          // Unauthorized or error -> go to login
          window.location.href = "/login";
          return;
        }
        // Guard against empty/invalid JSON bodies
        const ct = res.headers.get("content-type") || "";
        if (!ct.includes("application/json")) {
          window.location.href = "/login";
          return;
        }
        const data = await res.json();
        setUser(data);
      } catch (e) {
        window.location.href = "/login";
      }
    };
    fetchUser();
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <p>Welcome, {user?.name || user?.email} ({user?.role || "No role"})</p>
    </div>
  );
}
