import { useState, useEffect } from 'react';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import PreviewMobile from './preview-mobile';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import { DevicePhoneMobileIcon } from '@heroicons/react/24/outline';

const PreviewBtn = () => {
  const { data: currentUser } = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const [key, setKey] = useState(0); // Add key for forcing re-render

  // Force re-render when padding changes
  useEffect(() => {
    if (isOpen) {
      setKey(prev => prev + 1); // Force PreviewMobile to re-render
    }
  }, [
    currentUser?.headToPicturePadding,
    currentUser?.pictureToNamePadding,
    currentUser?.betweenCardsPadding,
    currentUser?.linkCardHeight,
    isOpen
  ]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg hover:bg-gray-800"
      >
        <DevicePhoneMobileIcon className="h-6 w-6" />
      </button>

      <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 mt-24 flex h-[96%] flex-col rounded-t-[10px] bg-zinc-100">
            <div className="flex-1 rounded-t-[10px] bg-zinc-100 p-4">
              <div className="mx-auto flex h-1.5 w-12 flex-shrink-0 rounded-full bg-zinc-300" />
              <div className="mt-4 flex-1">
                <PreviewMobile key={key} />
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
};

export default PreviewBtn;
