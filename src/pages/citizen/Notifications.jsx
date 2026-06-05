import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/citizenService';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Bell, CheckCheck, Eye, Calendar, MessageCircle, CheckCircle, UserCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

const NotificationIcon = ({ type }) => {
  switch (type) {
    case 'status_update':
      return <div className="p-2 bg-blue-100 rounded-full"><MessageCircle className="w-4 h-4 text-blue-600" /></div>;
    case 'resolution':
      return <div className="p-2 bg-green-100 rounded-full"><CheckCircle className="w-4 h-4 text-green-600" /></div>;
    case 'assignment':
      return <div className="p-2 bg-purple-100 rounded-full"><UserCheck className="w-4 h-4 text-purple-600" /></div>;
    default:
      return <div className="p-2 bg-gray-100 rounded-full"><Bell className="w-4 h-4 text-gray-600" /></div>;
  }
};

const NotificationItem = ({ notification, onMarkRead, onClick }) => {
  return (
    <div 
      className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${
        !notification.is_read ? 'bg-blue-50' : ''
      }`}
      onClick={() => onClick(notification.complaint_id)}
    >
      <div className="flex gap-3">
        <NotificationIcon type={notification.type} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">{notification.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              <p className="text-xs text-gray-500 mt-2">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </p>
            </div>
            {!notification.is_read && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkRead(notification.id);
                }}
                className="text-primary-600 hover:text-primary-700 text-xs font-medium"
              >
                Mark as read
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkRead = async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      await loadNotifications();
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      await loadNotifications();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications');
    }
  };

  const handleNotificationClick = (complaintId) => {
    navigate(`/citizen/complaint/${complaintId}`);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'No unread notifications'
            }
          </p>
        </div>
        {notifications.length > 0 && unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllRead}>
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Updates</h2>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No notifications yet</p>
              <p className="text-sm text-gray-400 mt-1">
                When your complaints get updates, they'll appear here
              </p>
            </div>
          ) : (
            notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
                onClick={handleNotificationClick}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;