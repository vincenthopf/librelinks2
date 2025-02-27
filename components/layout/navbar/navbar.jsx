import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Wand,
  Link2,
  BarChart,
  CircleDot,
  Settings2,
  Layout,
  Settings,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import UserAccountNavDesktop from '@/components/utils/usernavbutton-desktop';
import ShareButton from '@/components/utils/share-button';
import SaveTemplateButton from '@/components/utils/save-template-button';
import SiteHeader from './main-nav';
import ShareModal from '@/components/shared/modals/share-modal';
import SaveAsTemplateModal from '@/components/shared/modals/save-as-template-modal';
import React from 'react';
import useMediaQuery from '@/hooks/use-media-query';

const items = [
  {
    title: 'Profile',
    href: '/admin/settings',
    icon: <Settings2 color="black" size={18} />,
    showForAll: true,
  },
  {
    title: 'Links',
    href: '/admin',
    icon: <Link2 color="black" size={18} />,
    showForAll: true,
  },
  {
    title: 'Templates',
    href: '/admin/templates-user',
    icon: <Layout color="black" size={18} />,
    showForAll: true,
  },
  {
    title: 'Customize',
    href: '/admin/customize',
    icon: <CircleDot size={18} />,
    showForAll: true,
  },

  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: <BarChart color="black" size={18} />,
    showForAll: true,
  },

  {
    title: 'Templates Admin',
    href: '/admin/templates-admin',
    icon: <Settings color="black" size={18} />,
    showForAdmin: true,
  },
];

const Navbar = ({ showName = false, isHomePage = true }) => {
  const session = useSession();
  const isAdmin = session?.data?.user?.isAdmin;
  const { isNavigationOverflow } = useMediaQuery();

  const filteredItems = items.filter((item) =>
    isAdmin ? true : !item.showForAdmin
  );

  const NavItem = ({ item, compact = false }) => (
    <nav key={item.title} className="rounded-xl">
      <Link href={item.href}>
        <div
          className={`bg-transparent flex items-center hover:bg-slate-100 rounded-xl ${
            compact ? 'p-1.5 space-x-1' : 'p-2 space-x-2'
          }`}
        >
          {React.cloneElement(item.icon, { size: compact ? 16 : 18 })}
          <span className={`${compact ? 'text-sm' : 'text-sm'}`}>
            {item.title}
          </span>
        </div>
      </Link>
    </nav>
  );

  return (
    <>
      <header className="z-40 top-0 w-[100vw] border-b border-b-slate-200 bg-white">
        {/* First row - Logo and controls */}
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 items-center">
            <Wand color="black" size={30} />
            <div className="hidden sm:flex sm:items-center sm:space-x-6">
              {!showName ? (
                filteredItems.map((item) => (
                  <NavItem key={item.title} item={item} />
                ))
              ) : (
                <SiteHeader />
              )}
            </div>
          </div>

          <div className="flex items-center">
            {session.status === 'authenticated' && (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Dialog.Root>
                    <Dialog.Trigger asChild>
                      <SaveTemplateButton />
                    </Dialog.Trigger>
                    <SaveAsTemplateModal onClose={() => {}} />
                  </Dialog.Root>
                )}
                <Dialog.Root>
                  <Dialog.Trigger>
                    <ShareButton />
                  </Dialog.Trigger>
                  <ShareModal />
                </Dialog.Root>
                <UserAccountNavDesktop />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation with Flexbox Wrapping */}
        {(!session.status === 'authenticated' || !isHomePage) &&
        isNavigationOverflow ? (
          <div className="flex flex-wrap items-center justify-center border-t border-gray-200 lg:hidden md:hidden">
            <div className="flex flex-wrap items-center justify-center w-full px-4 py-1 gap-2">
              {filteredItems.map((item) => (
                <NavItem key={item.title} item={item} compact />
              ))}
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
};

export default Navbar;
