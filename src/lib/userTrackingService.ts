// lib/userTrackingService.ts
import { db } from "./firebase";
import {
  collection, onSnapshot, query, where, Timestamp, orderBy, getDocs
} from "firebase/firestore";

// Collection name for active users
const ACTIVE_USERS_COLLECTION = 'activeUsers';

// Time in milliseconds to consider a user inactive (5 minutes)
const INACTIVE_THRESHOLD = 5 * 60 * 1000;

// User session data type
export interface UserSession {
  id: string;
  sessionId: string;
  deviceType: string;
  browser: string;
  os: string;
  lastActive: Timestamp;
  currentPage: string;
  referrer: string;
  ageGroup?: string;
  contentType?: string; // 'story', 'video', 'code'
  contentId?: string;
}

// Listen for active users (for admin dashboard)
export const listenForActiveUsers = (callback: (users: UserSession[]) => void) => {
  // Calculate the timestamp for the inactive threshold
  const thresholdTime = new Date(Date.now() - INACTIVE_THRESHOLD);

  // Create a query for active users
  const activeUsersQuery = query(
    collection(db, ACTIVE_USERS_COLLECTION),
    where('lastActive', '>', Timestamp.fromDate(thresholdTime)),
    orderBy('lastActive', 'desc')
  );

  // Set up the listener
  return onSnapshot(activeUsersQuery, (snapshot) => {
    const activeUsers: UserSession[] = [];

    snapshot.forEach((doc) => {
      activeUsers.push({ id: doc.id, ...doc.data() } as UserSession);
    });

    callback(activeUsers);
  });
};

// Get user statistics
export const getUserStatistics = async () => {
  try {
    // Calculate the timestamp for the inactive threshold
    const thresholdTime = new Date(Date.now() - INACTIVE_THRESHOLD);

    // Query for active users
    const activeUsersQuery = query(
      collection(db, ACTIVE_USERS_COLLECTION),
      where('lastActive', '>', Timestamp.fromDate(thresholdTime))
    );

    const snapshot = await getDocs(activeUsersQuery);
    const activeUsers: UserSession[] = [];

    snapshot.forEach((doc) => {
      activeUsers.push({ id: doc.id, ...doc.data() } as UserSession);
    });

    // Calculate statistics
    const deviceStats = {
      desktop: 0,
      mobile: 0,
      tablet: 0
    };

    const browserStats: Record<string, number> = {};
    const osStats: Record<string, number> = {};
    const pageStats: Record<string, number> = {};
    const ageGroupStats = {
      '0-3': 0,
      '3-6': 0,
      '6-9': 0,
      '9-12': 0,
      'unknown': 0
    };

    const contentTypeStats = {
      story: 0,
      video: 0,
      'code-stories': 0,
      'age-group': 0,
      parents: 0,
      home: 0,
      other: 0
    };

    activeUsers.forEach(user => {
      // Device stats
      if (user.deviceType && user.deviceType in deviceStats) {
        deviceStats[user.deviceType as keyof typeof deviceStats] = (deviceStats[user.deviceType as keyof typeof deviceStats] || 0) + 1;
      }

      // Browser stats
      if (user.browser) {
        browserStats[user.browser] = (browserStats[user.browser] || 0) + 1;
      }

      // OS stats
      if (user.os) {
        osStats[user.os] = (osStats[user.os] || 0) + 1;
      }

      // Page stats
      if (user.currentPage) {
        pageStats[user.currentPage] = (pageStats[user.currentPage] || 0) + 1;
      }

      // Age group stats
      if (user.ageGroup && user.ageGroup in ageGroupStats) {
        ageGroupStats[user.ageGroup as keyof typeof ageGroupStats] = (ageGroupStats[user.ageGroup as keyof typeof ageGroupStats] || 0) + 1;
      } else {
        ageGroupStats['unknown'] = (ageGroupStats['unknown'] || 0) + 1;
      }

      // Content type stats
      if (user.contentType && user.contentType in contentTypeStats) {
        contentTypeStats[user.contentType as keyof typeof contentTypeStats] = (contentTypeStats[user.contentType as keyof typeof contentTypeStats] || 0) + 1;
      } else {
        contentTypeStats['other'] = (contentTypeStats['other'] || 0) + 1;
      }
    });

    return {
      totalActive: activeUsers.length,
      deviceStats,
      browserStats,
      osStats,
      pageStats,
      ageGroupStats,
      contentTypeStats
    };
  } catch (error) {
    console.error('Error getting user statistics:', error);
    throw error;
  }
};
