import { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import PreviewMobile from './preview-mobile';
import useCurrentUser from '@/hooks/useCurrentUser';
import { getCurrentBaseURL } from '@/utils/helpers';

const PreviewBtn = () => {
  const [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 lg:hidden z-50">
        <button
          type="button"
          onClick={openModal}
          className="block py-2 px-6 rounded-full bg-slate-700 
          text-white text-center font-semibold text-lg shadow-lg 
          hover:bg-slate-700 transition-colors duration-200
          border-2 border-white/20"
        >
          Preview
        </button>
      </div>

      {/* Headless UI Dialog with Transitions */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[60] lg:hidden" onClose={closeModal}>
          {/* Backdrop Transition */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </Transition.Child>

          {/* Panel Container */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center text-center">
              {/* Panel Transition */}
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-full"
                enterTo="opacity-100 translate-y-0"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-full"
              >
                <Dialog.Panel className="w-full h-[100vh] max-w-full transform overflow-hidden bg-white text-left align-middle shadow-xl transition-all">
                  {/* Render PreviewMobile directly */}
                  <PreviewMobile close={closeModal} />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default PreviewBtn;
