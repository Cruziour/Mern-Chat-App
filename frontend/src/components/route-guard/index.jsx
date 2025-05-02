import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const RouteGuard = ({ authenticated, requiredAuth, children }) => {
  const location = useLocation();

  if (requiredAuth && !authenticated) {
    // If route requires auth and user is not authenticated, redirect to homepage
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (!requiredAuth && authenticated) {
    // If route does not require auth but user is authenticated, redirect to chatpage
    return <Navigate to="/chatpage" replace />;
  }

  return children;
};

export default RouteGuard;
