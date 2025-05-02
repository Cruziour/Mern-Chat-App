import React from 'react';
import NotificationBadge from './NotificationBadge';

const NotificationBadgeWrapper = () => {
  return (
    <div style={{ position: 'fixed', top: 10, right: 10, zIndex: 1000 }}>
      <NotificationBadge />
    </div>
  );
};

export default NotificationBadgeWrapper;
