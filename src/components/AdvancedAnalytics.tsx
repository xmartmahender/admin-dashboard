import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { Calendar, TrendingUp, Users, Eye, Clock, Smartphone, Monitor, Tablet } from 'lucide-react';

interface DailyAnalytics {
  date: string;
  totalVisits: number;
  uniqueUsers: number;
  totalPageViews: number;
  averageSessionTime: number;
  bounceRate: number;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  ageGroupBreakdown: {
    '0-3': number;
    '3-6': number;
    '6-9': number;
    '9-12': number;
  };
  contentViews: {
    stories: number;
    videos: number;
    code: number;
  };
}

export const AdvancedAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<DailyAnalytics[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d'>('7d');
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration - replace with real Firebase data
  useEffect(() => {
    const generateMockData = () => {
      const mockData: DailyAnalytics[] = [];
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

      days.forEach((day, index) => {
        mockData.push({
          date: day,
          totalVisits: Math.floor(Math.random() * 200) + 50,
          uniqueUsers: Math.floor(Math.random() * 150) + 30,
          totalPageViews: Math.floor(Math.random() * 500) + 100,
          averageSessionTime: Math.floor(Math.random() * 300) + 60,
          bounceRate: Math.floor(Math.random() * 40) + 20,
          deviceBreakdown: {
            desktop: Math.floor(Math.random() * 50) + 20,
            mobile: Math.floor(Math.random() * 80) + 40,
            tablet: Math.floor(Math.random() * 30) + 10,
          },
          ageGroupBreakdown: {
            '0-3': Math.floor(Math.random() * 40) + 10,
            '3-6': Math.floor(Math.random() * 60) + 20,
            '6-9': Math.floor(Math.random() * 50) + 15,
            '9-12': Math.floor(Math.random() * 30) + 8,
          },
          contentViews: {
            stories: Math.floor(Math.random() * 1000) + 500,
            videos: Math.floor(Math.random() * 800) + 300,
            code: Math.floor(Math.random() * 400) + 100,
          }
        });
      });

      setAnalytics(mockData);
      setLoading(false);
    };

    generateMockData();
  }, [selectedPeriod]);

  // Calculate totals
  const totalVisits = analytics.reduce((sum, day) => sum + day.totalVisits, 0);
  const totalUsers = analytics.reduce((sum, day) => sum + day.uniqueUsers, 0);
  const avgSessionTime = Math.round(analytics.reduce((sum, day) => sum + day.averageSessionTime, 0) / analytics.length);
  const avgBounceRate = Math.round(analytics.reduce((sum, day) => sum + day.bounceRate, 0) / analytics.length);

  // Device distribution data
  const deviceData = [
    {
      name: 'Mobile',
      value: analytics.reduce((sum, day) => sum + day.deviceBreakdown.mobile, 0),
      color: '#8884d8',
      icon: Smartphone
    },
    {
      name: 'Desktop',
      value: analytics.reduce((sum, day) => sum + day.deviceBreakdown.desktop, 0),
      color: '#82ca9d',
      icon: Monitor
    },
    {
      name: 'Tablet',
      value: analytics.reduce((sum, day) => sum + day.deviceBreakdown.tablet, 0),
      color: '#ffc658',
      icon: Tablet
    },
  ];

  // Age group data
  const ageGroupData = [
    { name: '0-3 years', value: analytics.reduce((sum, day) => sum + day.ageGroupBreakdown['0-3'], 0), color: '#ff6b6b' },
    { name: '3-6 years', value: analytics.reduce((sum, day) => sum + day.ageGroupBreakdown['3-6'], 0), color: '#4ecdc4' },
    { name: '6-9 years', value: analytics.reduce((sum, day) => sum + day.ageGroupBreakdown['6-9'], 0), color: '#45b7d1' },
    { name: '9-12 years', value: analytics.reduce((sum, day) => sum + day.ageGroupBreakdown['9-12'], 0), color: '#96ceb4' },
  ];

  // Content views data
  const contentData = analytics.map(day => ({
    date: day.date,
    Stories: day.contentViews.stories,
    Videos: day.contentViews.videos,
    'Code Tutorials': day.contentViews.code,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Advanced Analytics</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedPeriod('7d')}
            className={`px-4 py-2 rounded-lg ${
              selectedPeriod === '7d'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setSelectedPeriod('30d')}
            className={`px-4 py-2 rounded-lg ${
              selectedPeriod === '30d'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center">
            <Calendar className="text-blue-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total Visits</p>
              <p className="text-2xl font-bold text-gray-800">{totalVisits.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <Users className="text-green-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Unique Users</p>
              <p className="text-2xl font-bold text-gray-800">{totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center">
            <Clock className="text-purple-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Avg Session Time</p>
              <p className="text-2xl font-bold text-gray-800">{Math.floor(avgSessionTime / 60)}m {avgSessionTime % 60}s</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
          <div className="flex items-center">
            <TrendingUp className="text-orange-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Bounce Rate</p>
              <p className="text-2xl font-bold text-gray-800">{avgBounceRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Visits Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Daily Visits (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="totalVisits" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Device Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Device Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={deviceData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {deviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Age Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">User Age Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ageGroupData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {ageGroupData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Content Views */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Content Views</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={contentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Stories" fill="#8884d8" />
              <Bar dataKey="Videos" fill="#82ca9d" />
              <Bar dataKey="Code Tutorials" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Content by Age Group */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Content by Age Group</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stories by Age */}
          <div>
            <h4 className="text-md font-medium mb-3">Stories</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { name: '0-3 years', value: Math.floor(Math.random() * 100) + 20 },
                { name: '3-6 years', value: Math.floor(Math.random() * 150) + 50 },
                { name: '6-9 years', value: Math.floor(Math.random() * 120) + 30 },
                { name: '9-12 years', value: Math.floor(Math.random() * 80) + 20 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Videos by Age */}
          <div>
            <h4 className="text-md font-medium mb-3">Videos</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { name: '0-3 years', value: Math.floor(Math.random() * 80) + 15 },
                { name: '3-6 years', value: Math.floor(Math.random() * 120) + 40 },
                { name: '6-9 years', value: Math.floor(Math.random() * 100) + 25 },
                { name: '9-12 years', value: Math.floor(Math.random() * 60) + 15 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
