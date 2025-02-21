import { useState, useEffect } from 'react';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import PreviewMobile from './preview-mobile';

const PreviewBtn = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [drawerHeight, setDrawerHeight] = useState('90vh');
  const [drawerWidth, setDrawerWidth] = useState('100%');

  useEffect(() => {
    const updateDimensions = () => {
      const height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      const width = window.innerWidth;
      
      // Adjust drawer size based on screen width
      if (width <= 640) { // sm
        setDrawerWidth('100%');
        setDrawerHeight('90vh');
      } else if (width <= 1024) { // md and lg
        setDrawerWidth('80%');
        setDrawerHeight('85vh');
      } else { // xl and above
        setDrawerWidth('70%');
        setDrawerHeight('80vh');
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState);
  };

  return (
    <>
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 lg:hidden z-50">
        <button
          onClick={toggleDrawer}
          className="block py-2 px-6 rounded-full bg-slate-700
          text-white text-center font-bold text-lg shadow-lg hover:bg-slate-600
          transition-all duration-300 ease-in-out"
        >
          Preview
        </button>
      </div>

      <Drawer
        id="drawer"
        open={isOpen}
        onClose={toggleDrawer}
        direction="bottom"
        size={drawerHeight}
        style={{
          width: drawerWidth,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
        className="overflow-auto"
        overlayClassName="bg-black/50"
        lockScroll={true}
      >
        <PreviewMobile close={toggleDrawer} />
      </Drawer>
    </>
  );
};

export default PreviewBtn;
