import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// Mock data for demonstration - in a real app, this would come from Firebase
const MOCK_USER_DATA = {
  totalUsers: 1245,
  activeToday: 87,
  newThisWeek: 124,
  ageGroups: [
    { name: '0-3 years', value: 320 },
    { name: '3-6 years', value: 480 },
    { name: '6-9 years', value: 280 },
    { name: '9-12 years', value: 165 }
  ],
  devices: [
    { name: 'Desktop', value: 450 },
    { name: 'Mobile', value: 620 },
    { name: 'Tablet', value: 175 }
  ],
  dailyVisits: [
    { day: 'Mon', visits: 120 },
    { day: 'Tue', visits: 145 },
    { day: 'Wed', visits: 132 },
    { day: 'Thu', visits: 167 },
    { day: 'Fri', visits: 178 },
    { day: 'Sat', visits: 210 },
    { day: 'Sun', visits: 190 }
  ],
  contentViews: [
    { name: 'Stories', views: 3240 },
    { name: 'Videos', views: 2180 },
    { name: 'Code Tutorials', views: 980 }
  ]
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function UserStatistics() {
  const [userData, setUserData] = useState(MOCK_USER_DATA);
  const [loading, setLoading] = useState(false);
  const [storyViews, setStoryViews] = useState<any[]>([]);
  const [videoViews, setVideoViews] = useState<any[]>([]);

  useEffect(() => {
    // In a real application, you would fetch actual user data from Firebase here
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // This is where you would make actual Firebase queries
        // For now, we'll just use the mock data
        
        // Example of how you might fetch story views by age group
        const storiesQuery = query(
          collection(db, "stories"),
          where("disabled", "!=", true),
          orderBy("disabled")
        );
        
        const storiesSnapshot = await getDocs(storiesQuery);
        const storiesByAge = [
          { name: '0-3 years', count: 0 },
          { name: '3-6 years', count: 0 },
          { name: '6-9 years', count: 0 },
          { name: '9-12 years', count: 0 }
        ];
        
        storiesSnapshot.forEach(doc => {
          const story = doc.data();
          switch(story.ageGroup) {
            case '0-3':
              storiesByAge[0].count++;
              break;
            case '3-6':
              storiesByAge[1].count++;
              break;
            case '6-9':
              storiesByAge[2].count++;
              break;
            case '9-12':
              storiesByAge[3].count++;
              break;
          }
        });
        
        setStoryViews(storiesByAge);
        
        // Example of how you might fetch video views by age group
        const videosQuery = query(
          collection(db, "videos"),
          where("disabled", "!=", true),
          orderBy("disabled")
        );
        
        const videosSnapshot = await getDocs(videosQuery);
        const videosByAge = [
          { name: '0-3 years', count: 0 },
          { name: '3-6 years', count: 0 },
          { name: '6-9 years', count: 0 },
          { name: '9-12 years', count: 0 }
        ];
        
        videosSnapshot.forEach(doc => {
          const video = doc.data();
          switch(video.ageGroup) {
            case '0-3':
              videosByAge[0].count++;
              break;
            case '3-6':
              videosByAge[1].count++;
              break;
            case '6-9':
              videosByAge[2].count++;
              break;
            case '9-12':
              videosByAge[3].count++;
              break;
          }
        });
        
        setVideoViews(videosByAge);
        
      } catch (error) {
        console.error("Error fetching user statistics:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading user statistics...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
          <p className="text-3xl font-bold text-gray-800">{userData.totalUsers}</p>
          <p className="text-green-600 text-sm mt-2">↑ 12% from last month</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-medium">Active Today</h3>
          <p className="text-3xl font-bold text-gray-800">{userData.activeToday}</p>
          <p className="text-green-600 text-sm mt-2">↑ 5% from yesterday</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-sm font-medium">New This Week</h3>
          <p className="text-3xl font-bold text-gray-800">{userData.newThisWeek}</p>
          <p className="text-green-600 text-sm mt-2">↑ 18% from last week</p>
        </div>
      </div>
      
      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Visits Chart */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Daily Visits (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userData.dailyVisits}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="visits" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* User Age Distribution */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">User Age Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userData.ageGroups}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {userData.ageGroups.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Content Views */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Content Views</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userData.contentViews}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Device Distribution */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Device Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userData.devices}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {userData.devices.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Content by Age Group */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Content by Age Group</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium mb-2">Stories</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={storyViews}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h4 className="text-md font-medium mb-2">Videos</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={videoViews}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
