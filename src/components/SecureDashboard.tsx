import React, { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Film,
  FileText,
  Users,
  LogOut,
  Activity,
  Settings,
  User,
  Shield,
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { VideoManagement } from "./VideoManagement";
import { StoryManagement } from "./StoryManagement";
import { UserStatistics } from "./UserStatistics";
import { ConnectedUsers } from "./ConnectedUsers";
import { ChangePassword } from "./ChangePassword";
import { useAuth } from "../contexts/AuthContext";

// Sections for the dashboard
const sections = [
  { key: "dashboard", name: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { key: "connected", name: "Connected Users", icon: <Activity size={20} /> },
  { key: "stories", name: "Stories", icon: <BookOpen size={20} /> },
  { key: "videos", name: "Videos", icon: <Film size={20} /> },
  { key: "posts", name: "Posts", icon: <FileText size={20} /> },
  { key: "users", name: "Users", icon: <Users size={20} /> },
  { key: "settings", name: "Settings", icon: <Settings size={20} /> },
];

function Sidebar({
  current,
  onChange,
  onLogout,
  adminEmail,
}: {
  current: string;
  onChange: (key: string) => void;
  onLogout: () => void;
  adminEmail: string;
}) {
  return (
    <aside className="bg-gradient-to-b from-purple-600 to-pink-400 w-56 min-h-screen py-8 px-4 flex flex-col gap-6 shadow-lg text-white fixed z-40">
      <div className="mb-8 text-center flex items-center justify-center gap-2">
        <BookOpen size={30} />
        <span className="font-black text-2xl tracking-tight">KidzZone</span>
      </div>
      
      {/* Admin Info */}
      <div className="bg-white/10 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={16} />
          <span className="text-sm font-medium">Admin Panel</span>
        </div>
        <div className="flex items-center gap-2">
          <User size={14} />
          <span className="text-xs text-white/80 truncate">{adminEmail}</span>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {sections.map(({ key, name, icon }) => (
          <button
            key={key}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold hover:bg-pink-500/30 focus:outline-none transition ${
              current === key ? "bg-white/15 text-yellow-200" : ""
            }`}
            style={{ background: current === key ? "rgba(255,255,255,0.1)" : undefined }}
            onClick={() => onChange(key)}
          >
            {icon} {name}
          </button>
        ))}
      </nav>
      <button
        className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold hover:bg-yellow-400/30 text-yellow-300 transition bg-white/0"
        onClick={onLogout}
      >
        <LogOut size={20} /> Logout
      </button>
    </aside>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl shadow-lg p-6 mb-8 w-full max-w-2xl border border-slate-100">
      <h2 className="font-extrabold text-xl text-purple-700 flex items-center gap-2 mb-4">{title}</h2>
      {children}
    </section>
  );
}

function AdminSettings({ adminEmail }: { adminEmail: string }) {
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <div className="w-full max-w-2xl">
      <Card title="Account Settings">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Email Address</h3>
              <p className="text-sm text-gray-600">{adminEmail}</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Verified
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Password</h3>
              <p className="text-sm text-gray-600">Last changed recently</p>
            </div>
            <button
              onClick={() => setShowChangePassword(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Change Password
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600">Add an extra layer of security</p>
            </div>
            <button className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed">
              Coming Soon
            </button>
          </div>
        </div>
      </Card>

      <Card title="Security Information">
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <Shield className="text-green-600" size={20} />
            <div>
              <p className="font-medium text-green-800">Secure Connection</p>
              <p className="text-sm text-green-600">Your connection is encrypted and secure</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <User className="text-blue-600" size={20} />
            <div>
              <p className="font-medium text-blue-800">Admin Role Active</p>
              <p className="text-sm text-blue-600">You have full administrative privileges</p>
            </div>
          </div>
        </div>
      </Card>

      <ChangePassword 
        isOpen={showChangePassword} 
        onClose={() => setShowChangePassword(false)} 
      />
    </div>
  );
}

export function SecureDashboard() {
  const { currentAdmin, logout } = useAuth();
  const [section, setSection] = useState("dashboard");

  // Posts state for the posts section
  const [posts, setPosts] = useState([
    { title: "Fun Facts for Kids", link: "https://example.com/post1" },
    { title: "Learning With Games", link: "https://example.com/post2" },
  ]);
  const [postTitle, setPostTitle] = useState("");
  const [postLink, setPostLink] = useState("");

  const addPost = () => {
    if (postTitle.trim() && postLink.trim()) {
      setPosts([...posts, { title: postTitle, link: postLink }]);
      setPostTitle("");
      setPostLink("");
    }
  };

  const deletePost = (idx: number) => {
    setPosts(posts.filter((_, i) => i !== idx));
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!currentAdmin) {
    return null; // This should not happen due to ProtectedRoute, but just in case
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100">
      <Sidebar 
        current={section} 
        onChange={setSection} 
        onLogout={handleLogout}
        adminEmail={currentAdmin.email}
      />
      <div className="flex-1 min-h-screen pl-0 md:pl-56 flex flex-col">
        <header className="bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg sticky top-0 z-30 w-full">
          <div className="flex items-center justify-between p-4 md:pl-8">
            <span className="text-2xl font-bold text-gray-100">Kidz Zone Admin</span>
            <div className="flex items-center gap-4">
              <span className="hidden md:block text-white/80 text-sm">
                Welcome, {currentAdmin.displayName || 'Admin'}
              </span>
              <button
                className="md:hidden flex items-center gap-2 text-white font-bold"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut size={20} /> Logout
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center px-2 py-8 md:p-8">
          {section === "dashboard" && (
            <>
              <Card title="User Statistics Dashboard">
                <UserStatistics />
              </Card>
              <Card title="Welcome">
                <div className="text-gray-700">
                  Welcome, {currentAdmin.displayName || 'Admin'}! Use the sidebar to manage stories, videos, posts, and users.
                  <div className="mt-2 text-sm text-gray-500">
                    Logged in as: {currentAdmin.email}
                  </div>
                </div>
              </Card>
            </>
          )}
          {section === "connected" && (
            <Card title="Real-Time Connected Users">
              <ConnectedUsers />
            </Card>
          )}
          {section === "stories" && (
            <StoryManagement />
          )}
          {section === "videos" && (
            <VideoManagement />
          )}
          {section === "posts" && (
            <Card title="Posts">
              <div className="flex flex-col space-y-2 mb-4">
                <input
                  type="text"
                  placeholder="Post Title"
                  value={postTitle}
                  onChange={e => setPostTitle(e.target.value)}
                  className="rounded px-3 py-2 border mb-2 w-full"
                />
                <input
                  type="text"
                  placeholder="Post Link"
                  value={postLink}
                  onChange={e => setPostLink(e.target.value)}
                  className="rounded px-3 py-2 border w-full"
                />
                <button
                  onClick={addPost}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2 rounded font-bold mt-2 hover:scale-105 transition"
                >Add Post</button>
              </div>
              <ul className="divide-y">
                {posts.map((post, idx) => (
                  <li key={idx} className="flex items-center justify-between py-2">
                    <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:underline font-medium">{post.title}</a>
                    <button
                      onClick={() => deletePost(idx)}
                      className="ml-3 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded font-bold text-xs"
                    >Delete</button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {section === "users" && (
            <Card title="Users Connected">
              <ConnectedUsers />
            </Card>
          )}
          {section === "settings" && (
            <AdminSettings adminEmail={currentAdmin.email} />
          )}
        </main>
        <footer className="text-gray-600 body-font bg-gradient-to-r from-pink-500 to-purple-500 py-6 text-center">
          <span className="font-bold text-yellow-200 text-2xl">Stormiz</span>
          <div className="text-white mt-2">© 2025 Stormiz — Secure Admin Panel</div>
        </footer>
      </div>
    </div>
  );
}
