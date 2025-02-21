/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, useMemo } from 'react';
import * as Avatar from '@radix-ui/react-avatar';
import LinkCard from '@/components/core/user-profile/links-card';
import Link from 'next/link';
import Loader from '@/components/utils/loading-spinner';
import NotFound from '@/components/utils/not-found';
import useLinks from '@/hooks/useLinks';
import { SocialCards } from '@/components/core/user-profile/social-cards';
import useCurrentUser from '@/hooks/useCurrentUser';
import { X } from 'lucide-react';

const PreviewMobile = ({ close }) => {
  const [, setIsDataLoaded] = useState(false);
  const [contentWidth, setContentWidth] = useState('100%');

  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const { data: userLinks } = useLinks(currentUser?.id);

  // Update content width based on screen size
  useEffect(() => {
    const updateContentWidth = () => {
      const width = window.innerWidth;
      if (width <= 640) { // sm
        setContentWidth('90%');
      } else if (width <= 768) { // md
        setContentWidth('85%');
      } else if (width <= 1024) { // lg
        setContentWidth('75%');
      } else if (width <= 1280) { // xl
        setContentWidth('65%');
      } else { // 2xl
        setContentWidth('50%');
      }
    };

    updateContentWidth();
    window.addEventListener('resize', updateContentWidth);
    return () => window.removeEventListener('resize', updateContentWidth);
  }, []);

  const theme = useMemo(
    () => ({
      primary: currentUser?.themePalette.palette[0],
      secondary: currentUser?.themePalette.palette[1],
      accent: currentUser?.themePalette.palette[2],
      neutral: currentUser?.themePalette.palette[3],
    }),
    [currentUser?.themePalette.palette]
  );

  const socialLinks = useMemo(
    () => userLinks?.filter((link) => link.isSocial && !link.archived),
    [userLinks]
  );

  const nonSocialLinks = useMemo(
    () => userLinks?.filter((link) => !link.isSocial),
    [userLinks]
  );

  useEffect(() => {
    if (currentUser && userLinks) {
      setIsDataLoaded(true);
    }
  }, [currentUser, userLinks]);

  if (isUserLoading) {
    return <Loader message={'Loading...'} bgColor="black" textColor="black" />;
  }

  if (!currentUser?.id) {
    return <NotFound />;
  }

  return (
    <section
      style={{ background: theme.primary }}
      className="min-h-screen w-full overflow-auto"
    >
      <div 
        style={{ width: contentWidth }}
        className="flex flex-col items-center mx-auto py-10 px-4 transition-all duration-300 ease-in-out"
      >
        <Avatar.Root
          className="inline-flex h-[70px] w-[70px] border-2 border-blue-300
          items-center justify-center overflow-hidden rounded-full align-middle 
          lg:w-[96px] lg:h-[96px] transition-all duration-300"
        >
          <Avatar.Image
            className="h-full w-full rounded-[inherit] object-cover"
            src={currentUser && currentUser?.image}
            referrerPolicy="no-referrer"
            alt="avatar"
          />
          <Avatar.Fallback
            className="leading-1 flex h-full w-full items-center justify-center bg-slate-900 text-xl text-white font-medium"
            delayMs={100}
          >
            @
          </Avatar.Fallback>
        </Avatar.Root>

        <p
          style={{ color: theme.accent }}
          className="font-bold text-center text-sm mt-4 mb-2 lg:text-xl transition-all duration-300"
        >
          {currentUser?.name}
        </p>

        {currentUser?.bio && (
          <p
            style={{ color: theme.accent }}
            className="max-w-[90%] md:max-w-[80%] lg:max-w-[70%] text-center text-sm mt-1 mb-4 
            lg:text-xl break-words transition-all duration-300"
          >
            {currentUser?.bio}
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-2 mb-8 lg:gap-4 transition-all duration-300">
          {socialLinks?.map(({ title, url }) => (
            <SocialCards
              key={title}
              title={title}
              url={url}
              color={theme.accent}
            />
          ))}
        </div>

        <div className="w-full space-y-4 transition-all duration-300">
          {nonSocialLinks?.map(({ id, ...link }) => (
            <LinkCard
              buttonStyle={currentUser?.buttonStyle}
              theme={theme}
              id={id}
              key={id}
              {...link}
            />
          ))}
        </div>

        {nonSocialLinks?.length === 0 && socialLinks?.length === 0 && (
          <div className="flex justify-center">
            <h3
              style={{ color: theme.neutral }}
              className="pt-8 text-md text-white font-semibold lg:text-2xl"
            >
              Hello World 🚀
            </h3>
          </div>
        )}

        {nonSocialLinks?.length > 0 && (
          <footer className="mt-10 w-full text-center">
            <p
              style={{ color: theme.accent }}
              className="text-sm text-semibold lg:text-lg"
            >
              Made with{' '}
              <Link
                className="font-semibold"
                target="_blank"
                href="https://twitter.com/NerdyProgramme2"
              >
                Librelinks
              </Link>
            </p>
          </footer>
        )}
      </div>

      <button
        onClick={close}
        style={{ background: theme.neutral }}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 
        w-[45px] h-[45px] rounded-full flex justify-center items-center
        shadow-lg hover:opacity-90 transition-all duration-300 lg:hidden"
      >
        <X color={theme.primary} size={30} />
      </button>
    </section>
  );
};

export default PreviewMobile;
