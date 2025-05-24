import React, { useState, useEffect } from 'react';
import { listenForActiveUsers, UserSession } from '../lib/userTrackingService';
import { formatDistanceToNow } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function ConnectedUsers() {
  const [activeUsers, setActiveUsers] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [deviceStats, setDeviceStats] = useState<any[]>([]);
  const [contentTypeStats, setContentTypeStats] = useState<any[]>([]);
  const [ageGroupStats, setAgeGroupStats] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSession | null>(null);

  useEffect(() => {
    setLoading(true);

    // Set up listener for active users
    const unsubscribe = listenForActiveUsers((users) => {
      setActiveUsers(users);

      // Calculate device statistics
      const deviceCounts = {
        desktop: 0,
        mobile: 0,
        tablet: 0
      };

      // Calculate content type statistics
      const contentTypeCounts = {
        story: 0,
        video: 0,
        'code-stories': 0,
        'age-group': 0,
        parents: 0,
        home: 0,
        other: 0
      };

      // Calculate age group statistics
      const ageGroupCounts = {
        '0-3': 0,
        '3-6': 0,
        '6-9': 0,
        '9-12': 0,
        unknown: 0
      };

      users.forEach(user => {
        // Count devices
        if (user.deviceType && user.deviceType in deviceCounts) {
          deviceCounts[user.deviceType as keyof typeof deviceCounts] = (deviceCounts[user.deviceType as keyof typeof deviceCounts] || 0) + 1;
        }

        // Count content types
        if (user.contentType && user.contentType in contentTypeCounts) {
          contentTypeCounts[user.contentType as keyof typeof contentTypeCounts] = (contentTypeCounts[user.contentType as keyof typeof contentTypeCounts] || 0) + 1;
        } else {
          contentTypeCounts.other++;
        }

        // Count age groups
        if (user.ageGroup && user.ageGroup in ageGroupCounts) {
          ageGroupCounts[user.ageGroup as keyof typeof ageGroupCounts] = (ageGroupCounts[user.ageGroup as keyof typeof ageGroupCounts] || 0) + 1;
        } else {
          ageGroupCounts.unknown++;
        }
      });

      // Convert to array format for charts
      const deviceStatsArray = Object.keys(deviceCounts).map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: deviceCounts[key as keyof typeof deviceCounts]
      }));

      const contentTypeStatsArray = Object.keys(contentTypeCounts).map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1).replace('-', ' '),
        value: contentTypeCounts[key as keyof typeof contentTypeCounts]
      }));

      const ageGroupStatsArray = Object.keys(ageGroupCounts).map(key => ({
        name: key === 'unknown' ? 'Unknown' : `${key} years`,
        value: ageGroupCounts[key as keyof typeof ageGroupCounts]
      }));

      setDeviceStats(deviceStatsArray);
      setContentTypeStats(contentTypeStatsArray);
      setAgeGroupStats(ageGroupStatsArray);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Format the last active time
  const formatLastActive = (timestamp: any) => {
    if (!timestamp) return 'Unknown';

    try {
      const date = timestamp.toDate();
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get content name based on type and ID
  const getContentName = (user: UserSession) => {
    if (!user.contentType) return 'Unknown';

    switch (user.contentType) {
      case 'story':
        return `Story (ID: ${user.contentId || 'Unknown'})`;
      case 'video':
        return `Video (ID: ${user.contentId || 'Unknown'})`;
      case 'code-stories':
        return `Code Stories ${user.contentId ? `(${user.contentId})` : ''}`;
      case 'age-group':
        return `Age Group: ${user.ageGroup || 'Unknown'}`;
      case 'parents':
        return 'Parents Information';
      case 'home':
        return 'Home Page';
      default:
        return user.contentType;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading connected users...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Connected Users: {activeUsers.length}</h2>
        <div className="text-sm text-gray-500">Auto-refreshing in real-time</div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-semibold mb-2">Device Types</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {deviceStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-semibold mb-2">Content Types</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contentTypeStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-semibold mb-2">Age Groups</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ageGroupStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {ageGroupStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Browser</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age Group</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.deviceType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.browser}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.os}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getContentName(user)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.ageGroup || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatLastActive(user.lastActive)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}

              {activeUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No users currently connected
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">User Session Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Session ID</p>
                <p className="text-sm text-gray-900">{selectedUser.sessionId}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Last Active</p>
                <p className="text-sm text-gray-900">{formatLastActive(selectedUser.lastActive)}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Device</p>
                <p className="text-sm text-gray-900">{selectedUser.deviceType}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Browser</p>
                <p className="text-sm text-gray-900">{selectedUser.browser}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Operating System</p>
                <p className="text-sm text-gray-900">{selectedUser.os}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Current Page</p>
                <p className="text-sm text-gray-900">{selectedUser.currentPage}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Content Type</p>
                <p className="text-sm text-gray-900">{selectedUser.contentType || 'Unknown'}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Content ID</p>
                <p className="text-sm text-gray-900">{selectedUser.contentId || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Age Group</p>
                <p className="text-sm text-gray-900">{selectedUser.ageGroup || 'Unknown'}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Referrer</p>
                <p className="text-sm text-gray-900">{selectedUser.referrer || 'Direct'}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
