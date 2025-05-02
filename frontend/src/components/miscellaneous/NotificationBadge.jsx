import React from 'react';
import { useSelector } from 'react-redux';

const NotificationBadge = () => {
  const notificationsByUser = useSelector(state => state.notifications.notificationsByUser);

  // Calculate total unread notifications count
  const totalUnread = Object.values(notificationsByUser || {}).reduce((acc, count) => acc + count, 0);

  if (totalUnread === 0) {
    return null;
  }

  return (
    <div style={{
      backgroundColor: 'red',
      color: 'white',
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '12px',
      fontWeight: 'bold',
      position: 'relative',
      top: '-10px',
      right: '-10px',
    }}>
      {totalUnread}
    </div>
  );
};

export default NotificationBadge;
