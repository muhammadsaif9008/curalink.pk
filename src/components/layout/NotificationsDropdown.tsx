import React, { useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, 
  Calendar, 
  Car, 
  FileText, 
  CreditCard, 
  Check, 
  ArrowRight, 
  X,
  Clock
} from 'lucide-react';
import { NotificationItem } from '../../types';

interface NotificationsDropdownProps {
  onClose: () => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ onClose }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead, navigate } = useApp();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadNotifications = (notifications || []).filter(n => !n.read);
  const recentNotifications = (notifications || []).slice(0, 5);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

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

  const handleItemClick = (notif: NotificationItem) => {
    markNotificationRead(notif.id);
    onClose();
    if (notif.related_url) {
      navigate(notif.related_url);
    } else {
      navigate('/notifications');
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-200 py-3 z-50 animate-in fade-in zoom-in-95"
    >
      {/* Top Header */}
      <div className="px-4 pb-2.5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#0F766E]" />
          <span className="text-xs font-bold text-gray-900">Notifications</span>
          {unreadNotifications.length > 0 && (
            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {unreadNotifications.length} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {unreadNotifications.length > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold cursor-pointer"
            >
              Mark read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
        {recentNotifications.length > 0 ? (
          recentNotifications.map((notif, idx) => (
            <div
              key={`${notif.id || 'notif'}_${idx}`}
              onClick={() => handleItemClick(notif)}
              className={`p-3 hover:bg-gray-50 transition-colors cursor-pointer flex items-start gap-3 ${
                !notif.read ? 'bg-teal-50/25' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                !notif.read ? 'bg-teal-100' : 'bg-gray-100'
              }`}>
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-bold text-gray-900 truncate">{notif.title}</p>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0"></span>
                  )}
                </div>
                <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5">{notif.message}</p>
                <span className="text-[10px] text-gray-400 mt-1 block">{notif.created_at}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-xs text-gray-400">
            No notifications right now
          </div>
        )}
      </div>

      {/* Bottom Footer View All */}
      <div className="px-4 pt-2 border-t border-gray-100 mt-1">
        <button
          onClick={() => {
            onClose();
            navigate('/notifications');
          }}
          className="w-full text-center text-xs font-bold text-[#0F766E] hover:text-[#0B5C56] py-1 flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>View All Notifications</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
