import React from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import Homepage from './Pages/Homepage';
import Chatpage from './Pages/Chatpage';
import NotFound from './Pages/NotFound';
import Layout from './Layout';
import RouteGuard from './components/route-guard';
import { useSelector } from 'react-redux';

const App = () => {
  const user = useSelector((state) => state.user?.user);
  
  const authenticated = !!user?._id;

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        <Route
          index
          element={
            <RouteGuard authenticated={authenticated} requiredAuth={false}>
              <Homepage />
            </RouteGuard>
          }
        />
        <Route
          path="chatpage"
          element={
            <RouteGuard authenticated={authenticated} requiredAuth={true}>
              <Chatpage />
            </RouteGuard>
          }
        />
        <Route
          path="*"
          element={
            <RouteGuard authenticated={authenticated} requiredAuth={false}>
              <NotFound />
            </RouteGuard>
          }
        />
      </Route>
    )
  );

  return <RouterProvider router={router} />;
};

export default App;
