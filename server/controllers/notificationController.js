// server/controllers/notificationController.js
// Controller for managing in-app user notifications with MongoDB and In-Memory fallback support
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const { getDbStatus } = require('../config/db');

// In-Memory fallback notifications store
let inMemoryNotifications = [
  {
    _id: 'notif-seed-1',
    recipient: 'seed-user-1', // Alex Rivera
    sender: 'seed-emp-1', // Sarah Jenkins
    type: 'APPLICATION_SHORTLISTED',
    title: 'Application Shortlisted! 🎉',
    message: 'Your application for "Senior Full-Stack Engineer (React & Node.js)" at TechCorp Solutions has been shortlisted.',
    application: 'app-seed-1',
    job: 'job-seed-1',
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'notif-seed-2',
    recipient: 'seed-emp-1', // Sarah Jenkins (Employer)
    sender: 'seed-user-2', // Emily Chen
    type: 'APPLICATION_RECEIVED',
    title: 'New Application Received 📄',
    message: 'Emily Chen submitted an application for "Lead Frontend Architect".',
    application: 'app-seed-2',
    job: 'job-seed-2',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Helper to push notification (used by applicationController)
const createNotificationHelper = async ({
  recipient,
  sender,
  type,
  title,
  message,
  applicationId,
  jobId,
}) => {
  try {
    if (getDbStatus() && mongoose.Types.ObjectId.isValid(recipient)) {
      try {
        return await Notification.create({
          recipient,
          sender: sender || null,
          type,
          title,
          message,
          application: applicationId || null,
          job: jobId || null,
        });
      } catch (mongoErr) {
        console.warn('MongoDB insert notification error:', mongoErr.message);
      }
    }

    // In-memory fallback
    const newNotif = {
      _id: `notif-mem-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      recipient: String(recipient),
      sender: sender ? String(sender) : null,
      type,
      title,
      message,
      application: applicationId ? String(applicationId) : null,
      job: jobId ? String(jobId) : null,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    inMemoryNotifications.unshift(newNotif);
    return newNotif;
  } catch (err) {
    console.error('createNotificationHelper failed:', err);
  }
};

/**
 * @desc    Get user's notifications
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    if (getDbStatus() && mongoose.Types.ObjectId.isValid(userId)) {
      try {
        const notifications = await Notification.find({ recipient: userId })
          .sort({ createdAt: -1 })
          .limit(30);

        const unreadCount = await Notification.countDocuments({
          recipient: userId,
          isRead: false,
        });

        return res.status(200).json({
          success: true,
          count: notifications.length,
          unreadCount,
          isInMemory: false,
          notifications,
        });
      } catch (mongoErr) {
        console.warn('MongoDB query failed in getNotifications, using fallback:', mongoErr.message);
      }
    }

    // In-memory
    const userNotifs = inMemoryNotifications.filter(
      (n) => String(n.recipient) === String(userId)
    );
    const unreadCount = userNotifs.filter((n) => !n.isRead).length;

    return res.status(200).json({
      success: true,
      count: userNotifs.length,
      unreadCount,
      isInMemory: true,
      notifications: userNotifs,
    });
  } catch (error) {
    console.error('getNotifications Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving notifications.',
    });
  }
};

/**
 * @desc    Mark a single notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    if (getDbStatus() && mongoose.Types.ObjectId.isValid(id)) {
      try {
        const notif = await Notification.findOneAndUpdate(
          { _id: id, recipient: userId },
          { isRead: true },
          { new: true }
        );
        if (notif) {
          return res.status(200).json({ success: true, notification: notif });
        }
      } catch (mongoErr) {
        console.warn('MongoDB query warning in markAsRead:', mongoErr.message);
      }
    }

    // In-memory
    const notif = inMemoryNotifications.find(
      (n) => String(n._id) === String(id) && String(n.recipient) === String(userId)
    );
    if (notif) {
      notif.isRead = true;
    }

    return res.status(200).json({ success: true, notification: notif });
  } catch (error) {
    console.error('markAsRead Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating notification status.',
    });
  }
};

/**
 * @desc    Mark all user's notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    if (getDbStatus() && mongoose.Types.ObjectId.isValid(userId)) {
      try {
        await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
        return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
      } catch (mongoErr) {
        console.warn('MongoDB query warning in markAllAsRead:', mongoErr.message);
      }
    }

    // In-memory
    inMemoryNotifications.forEach((n) => {
      if (String(n.recipient) === String(userId)) {
        n.isRead = true;
      }
    });

    return res.status(200).json({ success: true, message: 'All notifications marked as read. (In-memory)' });
  } catch (error) {
    console.error('markAllAsRead Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error marking notifications read.',
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotificationHelper,
  inMemoryNotifications,
};
