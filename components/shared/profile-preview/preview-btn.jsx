import { useState } from 'react';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import PreviewMobile from './preview-mobile';

const PreviewBtn = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState);
  };

  // Get current screen height
  const drawerHeight =
    typeof window !== 'undefined'
      ? Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
      : null;

  return (
    <>
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 lg:hidden z-50">
        <button
          onClick={toggleDrawer}
          className="block py-2 px-6 rounded-full bg-slate-700 
          text-white text-center font-semibold text-lg shadow-lg 
          hover:bg-slate-700 transition-colors duration-200
          border-2 border-white/20"
        >
          Preview
        </button>
      </div>

      <Drawer
        id="drawer"
        open={isOpen}
        onClose={toggleDrawer}
        direction="bottom"
        size={'100vh'}
        className="overflow-auto h-[100vh]"
      >
        <PreviewMobile close={toggleDrawer} />
      </Drawer>
    </>
  );
};

export default PreviewBtn;
