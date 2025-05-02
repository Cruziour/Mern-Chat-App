import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import SideDrawer from '../components/miscellaneous/SideDrawer';
import MyChats from '../components/Chatcomponents/MyChats';
import ChatBox from '../components/Chatcomponents/ChatBox';

const Chatpage = () => {
  const user = useSelector((state) => state.user?.user);
  const selectedChat = useSelector((state) => state.selectedUser?.selectedUser);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const breakpoint = 768;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isSmallDevice = windowWidth < breakpoint;

  return (
    <div className="min-w-full absolute">
      {user && <SideDrawer />}
      <div className="relative top-2 w-full h-[89vh] px-4 flex justify-between">
        {user && (
          <>
            {isSmallDevice ? (
              selectedChat ? (
                <ChatBox />
              ) : (
                <MyChats />
              )
            ) : (
              <>
                <MyChats />
                <ChatBox />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Chatpage;
