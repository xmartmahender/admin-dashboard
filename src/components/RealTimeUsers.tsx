import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import { 
  Users, 
  Globe, 
  Clock, 
  TrendingUp, 
  Monitor, 
  Smartphone, 
  Tablet,
  MapPin,
  Eye,
  MousePointer,
  RefreshCw
} from 'lucide-react';

interface ActiveUser {
  id?: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  device: string;
  browser: string;
  os: string;
  location?: string;
  currentPage: string;
  lastActivity: Timestamp;
  joinedAt: Timestamp;
  isActive: boolean;
  pageViews: number;
  timeSpent: number;
}

interface UserStats {
  totalActiveUsers: number;
  totalVisitorsToday: number;
  totalPageViews: number;
  averageSessionTime: number;
  bounceRate: number;
  topPages: { page: string; views: number }[];
  deviceBreakdown: { device: string; count: number }[];
  browserBreakdown: { browser: string; count: number }[];
}

export function RealTimeUsers() {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalActiveUsers: 0,
    totalVisitorsToday: 0,
    totalPageViews: 0,
    averageSessionTime: 0,
    bounceRate: 0,
    topPages: [],
    deviceBreakdown: [],
    browserBreakdown: []
  });
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Real-time listener for active users
  useEffect(() => {
    const activeUsersQuery = query(
      collection(db, 'activeUsers'),
      where('isActive', '==', true),
      orderBy('lastActivity', 'desc')
    );

    const unsubscribe = onSnapshot(activeUsersQuery, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ActiveUser));
      
      setActiveUsers(users);
      setUserStats(prev => ({
        ...prev,
        totalActiveUsers: users.length
      }));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load user statistics
  useEffect(() => {
    loadUserStatistics();
    
    if (autoRefresh) {
      const interval = setInterval(loadUserStatistics, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadUserStatistics = async () => {
    try {
      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Query for today's sessions
      const sessionsQuery = query(
        collection(db, 'userSessions'),
        where('joinedAt', '>=', Timestamp.fromDate(today)),
        where('joinedAt', '<', Timestamp.fromDate(tomorrow))
      );

      const sessionsSnapshot = await getDocs(sessionsQuery);
      const sessions = sessionsSnapshot.docs.map(doc => doc.data());

      // Calculate statistics
      const totalVisitorsToday = sessions.length;
      const totalPageViews = sessions.reduce((sum, session: any) => sum + (session.pageViews || 0), 0);
      const totalTimeSpent = sessions.reduce((sum, session: any) => sum + (session.timeSpent || 0), 0);
      const averageSessionTime = sessions.length > 0 ? totalTimeSpent / sessions.length : 0;
      
      // Calculate bounce rate (sessions with only 1 page view)
      const bouncedSessions = sessions.filter((session: any) => (session.pageViews || 0) <= 1).length;
      const bounceRate = sessions.length > 0 ? (bouncedSessions / sessions.length) * 100 : 0;

      // Top pages
      const pageViews: { [key: string]: number } = {};
      sessions.forEach((session: any) => {
        if (session.currentPage) {
          pageViews[session.currentPage] = (pageViews[session.currentPage] || 0) + 1;
        }
      });
      const topPages = Object.entries(pageViews)
        .map(([page, views]) => ({ page, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      // Device breakdown
      const devices: { [key: string]: number } = {};
      sessions.forEach((session: any) => {
        if (session.device) {
          devices[session.device] = (devices[session.device] || 0) + 1;
        }
      });
      const deviceBreakdown = Object.entries(devices)
        .map(([device, count]) => ({ device, count }));

      // Browser breakdown
      const browsers: { [key: string]: number } = {};
      sessions.forEach((session: any) => {
        if (session.browser) {
          browsers[session.browser] = (browsers[session.browser] || 0) + 1;
        }
      });
      const browserBreakdown = Object.entries(browsers)
        .map(([browser, count]) => ({ browser, count }));

      setUserStats({
        totalActiveUsers: activeUsers.length,
        totalVisitorsToday,
        totalPageViews,
        averageSessionTime: Math.round(averageSessionTime / 1000), // Convert to seconds
        bounceRate: Math.round(bounceRate),
        topPages,
        deviceBreakdown,
        browserBreakdown
      });

    } catch (error) {
      console.error('Error loading user statistics:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile': return <Smartphone size={16} />;
      case 'tablet': return <Tablet size={16} />;
      default: return <Monitor size={16} />;
    }
  };

  const formatLastActivity = (timestamp: Timestamp) => {
    const now = new Date();
    const lastActivity = timestamp.toDate();
    const diffMs = now.getTime() - lastActivity.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h ago`;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh toggle */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Real-Time User Analytics</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center px-3 py-2 rounded-lg text-sm ${
              autoRefresh 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <RefreshCw size={16} className={`mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={loadUserStatistics}
            className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh Now
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="text-green-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-800">{userStats.totalActiveUsers}</p>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                <span className="text-xs text-green-600">Live</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Globe className="text-blue-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Visitors Today</p>
              <p className="text-2xl font-bold text-gray-800">{userStats.totalVisitorsToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Eye className="text-purple-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Page Views</p>
              <p className="text-2xl font-bold text-gray-800">{userStats.totalPageViews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="text-orange-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Avg. Session</p>
              <p className="text-2xl font-bold text-gray-800">{formatTime(userStats.averageSessionTime)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Users List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Users size={20} className="mr-2" />
          Currently Active Users ({activeUsers.length})
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activeUsers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No active users right now</p>
          ) : (
            activeUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    {getDeviceIcon(user.device)}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-800">
                      {user.device} • {user.browser}
                    </p>
                    <p className="text-sm text-gray-600">
                      <MapPin size={12} className="inline mr-1" />
                      {user.currentPage}
                    </p>
                    <p className="text-xs text-gray-500">
                      Views: {user.pageViews} • Time: {formatTime(Math.floor(user.timeSpent / 1000))}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{formatLastActivity(user.lastActivity)}</p>
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-1 ml-auto animate-pulse"></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
