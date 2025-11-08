"use client";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      // Check for "admin" role (lowercase)
      if (data.role !== "admin") {
        window.location.href = "/dashboard";
      } else {
        setUser(data);
      }
    };
    fetchUser();
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin Panel</h1>
      <p>Welcome, {user.name} (Admin)</p>
    </div>
  );
}
