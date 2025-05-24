import React, { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Film,
  FileText,
  Users,
  LogOut,
  TrendingUp,
  BarChart3,
  Clock,
  PieChart,
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { VideoManagement } from "./components/VideoManagement";
import { StoryManagement } from "./components/StoryManagement";
import { RealTimeUsers } from "./components/RealTimeUsers";
import { AdvancedAnalytics } from "./components/AdvancedAnalytics";
import { UserStatistics } from "./components/UserStatistics";

const ADMIN_PASSWORD = "admin123";



function Login({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError("Invalid password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 to-pink-400">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl px-8 py-10 shadow-xl flex flex-col w-96 border border-purple-200"
      >
        <h1 className="text-3xl font-bold mb-2 text-purple-700 text-center">Admin Login</h1>
        <p className="text-gray-600 text-center mb-6">Secure access to KidzZone Admin</p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            placeholder="Enter admin password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded border border-purple-300 focus:border-purple-500 outline-none transition"
            required
          />
        </div>

        <button
          className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded font-bold hover:scale-105 shadow transition-all duration-200"
          type="submit"
        >
          Sign In
        </button>

        <div className="mt-6 p-3 bg-blue-50 rounded text-sm text-blue-700">
          <strong>Test Password:</strong> admin123
        </div>
      </form>
    </div>
  );
}

// Sections for the dashboard
const sections = [
  { key: "dashboard", name: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { key: "stories", name: "Stories", icon: <BookOpen size={20} /> },
  { key: "videos", name: "Videos", icon: <Film size={20} /> },
  { key: "posts", name: "Posts", icon: <FileText size={20} /> },
  { key: "users", name: "Users", icon: <Users size={20} /> },
  { key: "analytics", name: "Analytics", icon: <PieChart size={20} /> },
];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function ProDashboard({ onLogout }: { onLogout: () => void }) {
  const [section, setSection] = useState("dashboard");

  // Sample data for dashboard
  const [stories, setStories] = useState([
    { title: "The Magic Forest", link: "https://example.com/magic-forest" },
    { title: "Space Adventure", link: "https://example.com/space-adventure" },
  ]);
  const [videos, setVideos] = useState([
    { title: "Learn Colors", link: "https://youtube.com/watch?v=colors" },
    { title: "Math Fun", link: "https://youtube.com/watch?v=math" },
  ]);
  const [posts, setPosts] = useState([
    { title: "Welcome Post", link: "https://example.com/welcome" },
  ]);
  const [users] = useState([
    { name: "Alice" },
    { name: "Bob" },
    { name: "Charlie" },
  ]);
  const connectedCount = users.length;

  // Add input states
  const [storyTitle, setStoryTitle] = useState("");
  const [storyLink, setStoryLink] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postLink, setPostLink] = useState("");

  // Simulated chart data for connected users by hour
  const chartData = [
    { hour: "09:00", users: 1 },
    { hour: "10:00", users: 2 },
    { hour: "11:00", users: 2 },
    { hour: "12:00", users: 3 },
    { hour: "13:00", users: 2 },
    { hour: "14:00", users: 3 },
    { hour: "15:00", users: 3 },
    { hour: "16:00", users: 2 } // latest
  ];

  // Handlers
  const addStory = () => {
    if (storyTitle.trim() && storyLink.trim()) {
      setStories([...stories, { title: storyTitle, link: storyLink }]);
      setStoryTitle("");
      setStoryLink("");
    }
  };
  const deleteStory = (idx: number) => {
    setStories(stories.filter((_, i) => i !== idx));
  };
  const addVideo = () => {
    if (videoTitle.trim() && videoLink.trim()) {
      setVideos([...videos, { title: videoTitle, link: videoLink }]);
      setVideoTitle("");
      setVideoLink("");
    }
  };
  const deleteVideo = (idx: number) => {
    setVideos(videos.filter((_, i) => i !== idx));
  };
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

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-purple-700">KidzZone Admin</h1>
        </div>

        <nav className="mt-6">
          {sections.map((item) => (
            <button
              key={item.key}
              onClick={() => setSection(item.key)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-purple-50 transition-colors ${
                section === item.key ? "bg-purple-100 border-r-4 border-purple-500 text-purple-700" : "text-gray-600"
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 p-6 border-t">
          <button
            onClick={onLogout}
            className="flex items-center text-red-600 hover:text-red-800 transition-colors"
          >
            <LogOut size={20} />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8">
          {section === "dashboard" && (
            <>
              {/* Real-time Connected Users Banner */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-300 rounded-full animate-pulse mr-3"></div>
                      <div>
                        <h2 className="text-2xl font-bold">Live Users on Main Website</h2>
                        <p className="text-green-100">Real-time monitoring</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold">{connectedCount}</div>
                      <div className="text-sm text-green-100">Currently Active</div>
                    </div>
                  </div>

                  {/* Capacity Indicator */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Current Capacity Usage</span>
                      <span>{Math.round((connectedCount / 50) * 100)}% of recommended limit</span>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${
                          connectedCount <= 20 ? 'bg-green-400' :
                          connectedCount <= 35 ? 'bg-yellow-400' :
                          'bg-red-400'
                        }`}
                        style={{ width: `${Math.min((connectedCount / 50) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1 text-green-100">
                      <span>0 users</span>
                      <span className="text-center">
                        {connectedCount <= 20 ? '✅ Optimal' :
                         connectedCount <= 35 ? '⚠️ Moderate' :
                         '🔴 High Load'}
                      </span>
                      <span>50 users (recommended limit)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Capacity Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Users className="text-blue-600" size={24} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Active Now</p>
                      <p className="text-2xl font-bold text-gray-800">{connectedCount}</p>
                      <div className="flex items-center mt-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                        <span className="text-xs text-green-600">Live</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-full">
                      <TrendingUp className="text-green-600" size={24} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Capacity Status</p>
                      <p className="text-lg font-bold text-gray-800">
                        {connectedCount <= 20 ? 'Excellent' :
                         connectedCount <= 35 ? 'Good' :
                         'High Load'}
                      </p>
                      <p className="text-xs text-gray-500">{50 - connectedCount} slots available</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <BarChart3 className="text-purple-600" size={24} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Daily Limit</p>
                      <p className="text-2xl font-bold text-gray-800">500</p>
                      <p className="text-xs text-gray-500">Firebase free tier</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
                  <div className="flex items-center">
                    <div className="p-3 bg-orange-100 rounded-full">
                      <Clock className="text-orange-600" size={24} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Server Status</p>
                      <p className="text-lg font-bold text-gray-800">
                        {connectedCount <= 50 ? 'Stable' : 'Overloaded'}
                      </p>
                      <p className="text-xs text-gray-500">Development mode</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full flex flex-col gap-6 max-w-4xl mb-8">
                <Card title="Connected Users Chart (Today)">
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 40, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" tick={{fontSize: 12}} />
                        <YAxis allowDecimals={false} width={30} tick={{fontSize: 13}} />
                        <Tooltip />
                        <Line type="monotone" dataKey="users" stroke="#a21caf" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              <Card title="System Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Current Capacity</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Recommended Limit:</span>
                        <span className="font-medium">50 simultaneous users</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Load:</span>
                        <span className="font-medium">{connectedCount} users ({Math.round((connectedCount / 50) * 100)}%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Server Type:</span>
                        <span className="font-medium">Development (Next.js)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Database:</span>
                        <span className="font-medium">Firebase (Free Tier)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Performance Tips</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>0-20 users: Excellent performance</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-yellow-500 mr-2">⚠</span>
                        <span>21-35 users: Good performance</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-orange-500 mr-2">⚠</span>
                        <span>36-50 users: Moderate performance</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-red-500 mr-2">✗</span>
                        <span>50+ users: Consider upgrading</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}

          {section === "stories" && <StoryManagement />}
          {section === "videos" && <VideoManagement />}

          {section === "posts" && (
            <Card title="Manage Posts">
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Post Title"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 flex-1"
                />
                <input
                  type="text"
                  placeholder="Post Link"
                  value={postLink}
                  onChange={(e) => setPostLink(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 flex-1"
                />
                <button
                  onClick={addPost}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                >
                  Add Post
                </button>
              </div>
              <ul className="divide-y">
                {posts.map((post, idx) => (
                  <li key={idx} className="py-3 flex justify-between items-center">
                    <div>
                      <span className="font-medium text-gray-800">{post.title}</span>
                      <a href={post.link} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 text-sm">
                        View
                      </a>
                    </div>
                    <button
                      onClick={() => deletePost(idx)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {section === "users" && (
            <div className="space-y-6">
              <RealTimeUsers />
              <UserStatistics />
            </div>
          )}

          {section === "analytics" && <AdvancedAnalytics />}
        </main>
        <footer className="text-gray-600 body-font bg-gradient-to-r from-pink-500 to-purple-500 py-6 text-center">
          <span className="font-bold text-yellow-200 text-2xl">Stormiz</span>
          <div className="text-white mt-2">© 2025 Stormiz — Admin Panel Demo</div>
        </footer>
      </div>
    </div>
  );
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  return loggedIn ? (
    <div className="app">
      <ProDashboard onLogout={() => setLoggedIn(false)} />
    </div>
  ) : (
    <Login onLogin={() => setLoggedIn(true)} />
  );
}

export default App;
