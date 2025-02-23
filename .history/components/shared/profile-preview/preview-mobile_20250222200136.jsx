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
import { UserAvatarSetting } from '@/components/utils/avatar';

const PreviewMobile = ({ close }) => {
  const [, setIsDataLoaded] = useState(false);

  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();

  const { data: userLinks } = useLinks(currentUser?.id);

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
    <>
      <section
        style={{ background: theme.primary }}
        className="h-[100vh] w-[100vw] overflow-auto"
      >
        <div 
          className="flex items-center w-full flex-col mx-auto max-w-3xl justify-center px-8"
          style={{ 
            paddingTop: `${currentUser?.headToPicturePadding || 40}px`,
            paddingBottom: `${currentUser?.headToPicturePadding || 40}px`
          }}
        >
          <UserAvatarSetting isPreview={true} />
          <p
            style={{ 
              color: theme.accent,
              fontSize: `${currentUser?.profileNameFontSize || 16}px`,
              marginTop: `${currentUser?.pictureToNamePadding || 16}px`
            }}
            className="font-bold text-white text-center mb-2"
          >
            {currentUser?.name}
          </p>
          {currentUser?.bio && (
            <p
              style={{ 
                color: theme.accent,
                fontSize: `${currentUser?.bioFontSize || 14}px`
              }}
              className="w-[150px] truncate text-center mt-1 mb-4 lg:mb-4 lg:w-[500px]"
            >
              {currentUser?.bio}
            </p>
          )}
          <div className="min-w-max flex flex-wrap gap-2 mb-8 lg:w-fit lg:gap-4">
            {socialLinks?.map(({ title, url }) => (
              <SocialCards
                key={title}
                title={title}
                url={url}
                color={theme.accent}
              />
            ))}
          </div>
          <div className="w-full flex flex-col" style={{ gap: `${currentUser?.betweenCardsPadding || 16}px` }}>
            {nonSocialLinks?.map(({ id, ...link }) => (
              <LinkCard
                buttonStyle={currentUser?.buttonStyle}
                theme={theme}
                id={id}
                key={id}
                fontSize={currentUser?.linkTitleFontSize || 14}
                cardHeight={currentUser?.linkCardHeight || 16}
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
        </div>
        <div className="mt-10" />
        {nonSocialLinks?.length > 0 && (
          <footer className="relative left-1/2 bottom-0 transform -translate-x-1/2 w-[200px]">
            <p
              style={{ color: theme.accent }}
              className="text-semibold text-center lg:text-lg"
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
        <div className="rounded-full bottom-[1rem] absolute left-1/2 transform -translate-x-1/2 lg:hidden">
          <button
            onClick={close}
            style={{ background: `${theme.neutral}` }}
            className="flex justify-center items-center w-[45px] h-[45px] rounded-full bg-gray-500 text-black text-center font-bold text-lg shadow-lg hover:bg-slate-600"
          >
            <X color={theme.primary} size={30} />
          </button>
        </div>
      </section>
    </>
  );
};

export default PreviewMobile;
