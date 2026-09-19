import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, 
  Calendar, 
  Car, 
  FileText, 
  CreditCard, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight,
  Sparkles,
  Check,
  Clock,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { NotificationItem } from '../../types';

export const NotificationsPage: React.FC = () => {
  const { 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead, 
    navigate,
    currentUser 
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'unread' | 'appointment' | 'tracker' | 'report' | 'payment'>('all');

  const unreadCount = (notifications || []).filter(n => !n.read).length;

  const filteredNotifications = (notifications || []).filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'appointment') return n.type === 'appointment';
    if (filter === 'tracker') return n.type === 'tracker';
    if (filter === 'report') return n.type === 'report';
    if (filter === 'payment') return n.type === 'payment';
    return true;
  });

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'tracker':
        return <Car className="w-4 h-4 text-emerald-600" />;
      case 'report':
        return <FileText className="w-4 h-4 text-purple-600" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-teal-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeBadge = (type: NotificationItem['type']) => {
    switch (type) {
      case 'appointment':
        return <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded">Appointment</span>;
      case 'tracker':
        return <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">Live GPS Tracker</span>;
      case 'report':
        return <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded">Medical Report</span>;
      case 'payment':
        return <span className="bg-teal-50 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded">Payment</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded">Notice</span>;
    }
  };

  return (
    <div className="bg-[#FBFBFB] min-h-screen text-gray-900 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <button 
            onClick={() => navigate('/')} 
            className="hover:text-teal-700 flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Notifications</span>
        </div>

        {/* Header Bar */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0F766E] relative">
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Notifications & Updates
              </h1>
              <p className="text-xs text-gray-500">
                {currentUser ? `Real-time alerts for ${currentUser.name}` : 'Platform alerts and clinical updates'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="flex-1 sm:flex-initial bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark All as Read</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'appointment', label: 'Appointments' },
            { id: 'tracker', label: 'Live GPS' },
            { id: 'report', label: 'Reports' },
            { id: 'payment', label: 'Payments' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                filter === tab.id
                  ? 'bg-[#0F766E] text-white shadow-2xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications Feed */}
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif, idx) => (
              <div
                key={`${notif.id || 'notif'}_${idx}`}
                className={`bg-white border rounded-2xl p-4.5 transition-all shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  !notif.read ? 'border-teal-400 bg-teal-50/15' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    !notif.read ? 'bg-teal-100 border border-teal-300' : 'bg-gray-100 border border-gray-200'
                  }`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getTypeBadge(notif.type)}
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                        {notif.title}
                      </h3>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0"></span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 pt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{notif.created_at}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {!notif.read && (
                    <button
                      onClick={() => markNotificationRead(notif.id)}
                      className="text-xs text-teal-700 hover:text-teal-900 font-semibold px-2 py-1 rounded hover:bg-teal-50 cursor-pointer"
                    >
                      Mark read
                    </button>
                  )}
                  {notif.related_url && (
                    <button
                      onClick={() => navigate(notif.related_url!)}
                      className="bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-3">
              <Bell className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="text-sm font-bold text-gray-800">No notifications found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                You're all caught up! Updates regarding your doctor arrivals, medical reports, and bookings will appear here.
              </p>
              <button
                onClick={() => setFilter('all')}
                className="text-xs text-teal-700 font-bold hover:underline cursor-pointer"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
