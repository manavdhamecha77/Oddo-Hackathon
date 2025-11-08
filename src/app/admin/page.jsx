"use client";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.role !== "Admin") window.location.href = "/dashboard";
      else setUser(data);
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
