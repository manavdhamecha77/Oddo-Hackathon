"use client";

const handleLogout = async () => {
  await fetch("/api/auth/logout", { method: "POST" });
  localStorage.removeItem("token"); // optional if you store JWT locally
  window.location.href = "/login"; // redirect to login page
};

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 border-b bg-background">
      <h1 className="text-xl font-semibold">Oddo Hackathon</h1>
      <div className="space-x-4">
        <a href="/" className="hover:underline">Home</a>
        <a href="/dashboard" className="hover:underline">Dashboard</a>
        <a href="/login" className="hover:underline">Login</a>
        <button onClick={handleLogout} className="hover:underline">Logout</button>
      </div>
    </nav>
  );
}
